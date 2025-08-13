import os
import time
import hmac
import hashlib
import secrets
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import wraps
import asyncio
import json
from datetime import datetime, timedelta
from collections import defaultdict, deque
import ipaddress
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import jwt

from dns_checker import DNSChecker

app = Flask(__name__)
CORS(app)

# Enhanced Security Configuration
CSRF_SECRET_KEY = os.environ.get('CSRF_SECRET_KEY', secrets.token_hex(32))
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
CSRF_TOKEN_EXPIRES = int(os.environ.get('CSRF_TOKEN_EXPIRES', '3600'))  # 1 hour
CSRF_REFRESH_THRESHOLD = int(os.environ.get('CSRF_REFRESH_THRESHOLD', '1800'))  # 30 minutes

# In-memory stores (use Redis for production scaling)
rate_limit_store = defaultdict(lambda: deque())
blocked_ips = {}
csrf_tokens = {}  # Store active CSRF tokens with metadata

# Configuration
RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', '10'))
RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', '300'))
BLOCK_DURATION = int(os.environ.get('BLOCK_DURATION', '3600'))
MAX_DOMAIN_LENGTH = 253
ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', 'https://www.dnsbunch.com').split(',') if origin.strip()]

# CSRF Token Management
class CSRFManager:
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(CSRF_SECRET_KEY)
    
    def generate_token(self, client_ip: str, user_agent: str) -> dict:
        """Generate a secure CSRF token with multiple binding factors"""
        current_time = time.time()
        
        # Create unique token data with multiple binding factors
        token_data = {
            'ip': self._hash_ip(client_ip),  # Hashed IP for privacy
            'ua_hash': self._hash_user_agent(user_agent),  # User agent fingerprint
            'timestamp': current_time,
            'nonce': secrets.token_hex(16),  # Random nonce
            'session_id': secrets.token_hex(8)  # Session identifier
        }
        
        # Create JWT token with additional security
        jwt_payload = {
            'data': token_data,
            'exp': current_time + CSRF_TOKEN_EXPIRES,
            'iat': current_time,
            'iss': 'dnsbunch-api',
            'aud': 'dnsbunch-frontend'
        }
        
        # Sign with both symmetric and HMAC
        token = jwt.encode(jwt_payload, JWT_SECRET_KEY, algorithm='HS256')
        
        # Store token metadata (for validation and cleanup)
        csrf_tokens[token] = {
            'ip_hash': token_data['ip'],
            'ua_hash': token_data['ua_hash'],
            'created': current_time,
            'last_used': current_time,
            'usage_count': 0,
            'session_id': token_data['session_id']
        }
        
        return {
            'csrf_token': token,
            'expires_in': CSRF_TOKEN_EXPIRES,
            'expires_at': current_time + CSRF_TOKEN_EXPIRES,
            'refresh_after': CSRF_REFRESH_THRESHOLD
        }
    
    def validate_token(self, token: str, client_ip: str, user_agent: str) -> bool:
        """Validate CSRF token with comprehensive security checks"""
        try:
            if not token or token not in csrf_tokens:
                return False
            
            # Decode and verify JWT
            payload = jwt.decode(
                token, 
                JWT_SECRET_KEY, 
                algorithms=['HS256'],
                audience='dnsbunch-frontend',
                issuer='dnsbunch-api'
            )
            
            token_data = payload['data']
            current_time = time.time()
            
            # Check expiration
            if current_time > payload['exp']:
                self._cleanup_token(token)
                return False
            
            # Verify IP binding (hashed)
            if token_data['ip'] != self._hash_ip(client_ip):
                self._cleanup_token(token)
                return False
            
            # Verify User-Agent binding
            if token_data['ua_hash'] != self._hash_user_agent(user_agent):
                self._cleanup_token(token)
                return False
            
            # Check token metadata
            metadata = csrf_tokens[token]
            
            # Rate limiting per token (prevent token abuse)
            if metadata['usage_count'] > 100:  # Max 100 uses per token
                self._cleanup_token(token)
                return False
            
            # Update usage statistics
            metadata['last_used'] = current_time
            metadata['usage_count'] += 1
            
            return True
            
        except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, KeyError) as e:
            if token in csrf_tokens:
                self._cleanup_token(token)
            return False
    
    def should_refresh_token(self, token: str) -> bool:
        """Check if token should be refreshed"""
        if token not in csrf_tokens:
            return True
        
        metadata = csrf_tokens[token]
        age = time.time() - metadata['created']
        return age > CSRF_REFRESH_THRESHOLD
    
    def _hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy while maintaining binding"""
        return hmac.new(
            CSRF_SECRET_KEY.encode(),
            ip.encode(),
            hashlib.sha256
        ).hexdigest()[:16]  # First 16 chars for space efficiency
    
    def _hash_user_agent(self, user_agent: str) -> str:
        """Create user agent fingerprint"""
        # Extract key components to create stable fingerprint
        ua_lower = user_agent.lower()
        key_parts = []
        
        # Browser detection
        browsers = ['chrome', 'firefox', 'safari', 'edge', 'opera']
        for browser in browsers:
            if browser in ua_lower:
                key_parts.append(browser)
                break
        
        # OS detection
        os_list = ['windows', 'macos', 'linux', 'android', 'ios']
        for os_name in os_list:
            if os_name in ua_lower:
                key_parts.append(os_name)
                break
        
        # Create hash of key components
        ua_key = '|'.join(key_parts) + '|' + str(len(user_agent))
        return hmac.new(
            CSRF_SECRET_KEY.encode(),
            ua_key.encode(),
            hashlib.sha256
        ).hexdigest()[:12]
    
    def _cleanup_token(self, token: str):
        """Remove invalid or expired token"""
        if token in csrf_tokens:
            del csrf_tokens[token]
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens (call periodically)"""
        current_time = time.time()
        expired_tokens = []
        
        for token, metadata in csrf_tokens.items():
            if current_time - metadata['created'] > CSRF_TOKEN_EXPIRES:
                expired_tokens.append(token)
        
        for token in expired_tokens:
            self._cleanup_token(token)

# Initialize CSRF manager
csrf_manager = CSRFManager()

def get_client_ip():
    """Get the real client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def csrf_required(f):
    """CSRF protection decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', '')
        
        # Get CSRF token from header
        csrf_token = request.headers.get('X-CSRF-Token') or request.headers.get('X-CSRFToken')
        
        if not csrf_token:
            return jsonify({
                'error': 'CSRF token missing. Please refresh the page and try again.',
                'code': 'CSRF_TOKEN_MISSING'
            }), 403
        
        # Validate token
        if not csrf_manager.validate_token(csrf_token, client_ip, user_agent):
            return jsonify({
                'error': 'Invalid or expired CSRF token. Please refresh the page.',
                'code': 'CSRF_TOKEN_INVALID'
            }), 403
        
        # Store token info for response headers
        g.csrf_token = csrf_token
        g.should_refresh = csrf_manager.should_refresh_token(csrf_token)
        
        return f(*args, **kwargs)
    
    return decorated_function

def rate_limit(f):
    """Rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = get_client_ip()
        current_time = time.time()
        
        # Check if IP is currently blocked
        if client_ip in blocked_ips:
            if current_time < blocked_ips[client_ip]:
                return jsonify({
                    'error': 'Rate limit exceeded. Access temporarily blocked.',
                    'retry_after': int(blocked_ips[client_ip] - current_time)
                }), 429
            else:
                del blocked_ips[client_ip]
        
        # Get request history for this IP
        requests = rate_limit_store[client_ip]
        
        # Remove old requests outside the window
        while requests and requests[0] < current_time - RATE_LIMIT_WINDOW:
            requests.popleft()
        
        # Check if limit exceeded
        if len(requests) >= RATE_LIMIT_REQUESTS:
            blocked_ips[client_ip] = current_time + BLOCK_DURATION
            return jsonify({
                'error': f'Rate limit exceeded: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds.',
                'retry_after': BLOCK_DURATION
            }), 429
        
        # Add current request
        requests.append(current_time)
        
        # Add rate limit headers
        g.rate_limit_remaining = RATE_LIMIT_REQUESTS - len(requests)
        g.rate_limit_reset = int(current_time + RATE_LIMIT_WINDOW)
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_request(f):
    """Request validation decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_agent = request.headers.get('User-Agent', '')
        if not user_agent or len(user_agent) < 10:
            return jsonify({'error': 'Invalid request'}), 400
        
        # Block common bot user agents
        bot_indicators = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
        if any(indicator in user_agent.lower() for indicator in bot_indicators):
            return jsonify({'error': 'Automated requests not allowed'}), 403
        
        # Validate Content-Type for POST requests
        if request.method == 'POST':
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        # Validate Origin (CSRF protection)
        origin = request.headers.get('Origin')
        if origin and ALLOWED_ORIGINS:
            if not any(allowed in origin for allowed in ALLOWED_ORIGINS):
                return jsonify({'error': 'Origin not allowed'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

@app.before_request
def before_request():
    """Clean up expired tokens periodically"""
    if hasattr(g, 'cleanup_done'):
        return
    
    # Clean up expired tokens (do this once per request cycle)
    csrf_manager.cleanup_expired_tokens()
    g.cleanup_done = True

@app.after_request
def after_request(response):
    """Add security headers and CSRF info"""
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # Rate limit headers
    if hasattr(g, 'rate_limit_remaining'):
        response.headers['X-RateLimit-Limit'] = str(RATE_LIMIT_REQUESTS)
        response.headers['X-RateLimit-Remaining'] = str(g.rate_limit_remaining)
        response.headers['X-RateLimit-Reset'] = str(g.rate_limit_reset)
    
    # CSRF refresh notification
    if hasattr(g, 'should_refresh') and g.should_refresh:
        response.headers['X-CSRF-Refresh-Required'] = 'true'
    
    return response

@app.route('/', methods=['GET'])
@rate_limit
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DNSBunch API',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/csrf-token', methods=['GET'])
@rate_limit
@validate_request
def get_csrf_token():
    """Generate and return CSRF token"""
    client_ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', '')
    
    try:
        token_info = csrf_manager.generate_token(client_ip, user_agent)
        
        return jsonify({
            'success': True,
            'csrf_token': token_info['csrf_token'],
            'expires_in': token_info['expires_in'],
            'expires_at': token_info['expires_at'],
            'server_time': time.time()
        })
        
    except Exception as e:
        print(f"Error generating CSRF token: {str(e)}")
        return jsonify({'error': 'Failed to generate security token'}), 500

@app.route('/api/check', methods=['POST'])
@rate_limit
@validate_request
@csrf_required
def check_dns():
    """Check DNS records for a domain"""
    try:
        data = request.get_json()
        
        if not data or 'domain' not in data:
            return jsonify({'error': 'Domain is required'}), 400
        
        domain = data['domain'].strip().lower()
        requested_checks = data.get('checks', [])
        
        # Enhanced domain validation
        if not domain or len(domain) > MAX_DOMAIN_LENGTH:
            return jsonify({'error': 'Invalid domain name'}), 400
        
        # Block suspicious patterns
        suspicious_patterns = [
            'localhost', '127.0.0.1', '0.0.0.0', '10.', '192.168.', '172.',
            'test.test', 'example.example', 'admin', 'root', 'api'
        ]
        
        if any(pattern in domain for pattern in suspicious_patterns):
            return jsonify({'error': 'Domain not allowed for analysis'}), 400
        
        # Validate domain format
        import re
        domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
        if not re.match(domain_pattern, domain):
            return jsonify({'error': 'Invalid domain format'}), 400
        
        # Validate checks array
        if requested_checks:
            valid_checks = [
                'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
                'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
            ]
            invalid_checks = [check for check in requested_checks if check not in valid_checks]
            if invalid_checks:
                return jsonify({'error': f'Invalid check types: {invalid_checks}'}), 400
        
        # Create DNS checker and run analysis
        checker = DNSChecker(domain)
        
        # Run checks with timeout
        if requested_checks and len(requested_checks) > 0:
            print(f"Running specific checks: {requested_checks} for domain: {domain} from IP: {get_client_ip()}")
            result = asyncio.wait_for(
                checker.run_all_checks(requested_checks),
                timeout=60
            )
        else:
            print(f"Running all checks for domain: {domain} from IP: {get_client_ip()}")
            result = asyncio.wait_for(
                checker.run_all_checks(),
                timeout=120
            )
        
        # Run the async operation
        result = asyncio.run(result)
        
        return jsonify(result)
        
    except asyncio.TimeoutError:
        return jsonify({'error': 'Request timeout - analysis took too long'}), 408
    except Exception as e:
        print(f"Error checking DNS for domain {domain}: {str(e)}")
        return jsonify({'error': 'DNS check failed - please try again later'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print(f"Starting DNSBunch API server on port {port}")
    print(f"Debug mode: {debug}")
    print(f"CSRF protection: ENABLED")
    print(f"Rate limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds")
    print(f"Allowed origins: {ALLOWED_ORIGINS}")
    
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=debug
    )
