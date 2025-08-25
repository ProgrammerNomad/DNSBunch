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

# Fixed CORS Configuration - MUST set supports_credentials=True
CORS(app, 
     origins=[
         "https://www.dnsbunch.com",
         "https://dnsbunch.com", 
         "http://localhost:3000",
         "http://localhost:3001"
     ],
     supports_credentials=True,  # This is crucial!
     allow_headers=['Content-Type', 'Authorization', 'X-CSRF-Token'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
)

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
RATE_LIMIT_REQUESTS = int(os.environ.get('RATE_LIMIT_REQUESTS', '50'))  # Increased from 10 to 50
RATE_LIMIT_WINDOW = int(os.environ.get('RATE_LIMIT_WINDOW', '300'))     # Keep 5 minutes
BLOCK_DURATION = int(os.environ.get('BLOCK_DURATION', '3600'))
MAX_DOMAIN_LENGTH = 253
ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', 'https://www.dnsbunch.com').split(',') if origin.strip()]

# CSRF Token Management
class CSRFManager:
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(CSRF_SECRET_KEY)
        self.jwt_secret = JWT_SECRET_KEY
    
    def generate_token(self, client_ip: str, user_agent: str) -> str:
        """Generate a secure CSRF token with IP and User-Agent binding"""
        payload = {
            'ip_hash': self._hash_ip(client_ip),
            'ua_hash': self._hash_user_agent(user_agent),
            'issued_at': int(time.time()),
            'expires_at': int(time.time()) + CSRF_TOKEN_EXPIRES,
            'nonce': secrets.token_hex(16)
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
        
        # Store token metadata for validation
        csrf_tokens[token] = {
            'ip_hash': payload['ip_hash'],
            'ua_hash': payload['ua_hash'],
            'expires_at': payload['expires_at'],
            'usage_count': 0
        }
        
        return token
    
    def validate_token(self, token: str, client_ip: str, user_agent: str) -> bool:
        """Validate CSRF token with multi-factor verification"""
        try:
            # Check if token exists in our store
            if token not in csrf_tokens:
                return False
            
            token_data = csrf_tokens[token]
            
            # Check expiration
            if time.time() > token_data['expires_at']:
                self._cleanup_token(token)
                return False
            
            # Decode JWT
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            
            # Verify IP and User-Agent binding
            if (payload['ip_hash'] != self._hash_ip(client_ip) or 
                payload['ua_hash'] != self._hash_user_agent(user_agent)):
                return False
            
            # Update usage count
            token_data['usage_count'] += 1
            
            # Optional: Limit token usage count
            if token_data['usage_count'] > 100:  # Prevent token abuse
                self._cleanup_token(token)
                return False
            
            return True
            
        except (jwt.InvalidTokenError, KeyError, ValueError):
            return False
    
    def should_refresh_token(self, token: str) -> bool:
        """Check if token should be refreshed"""
        if token not in csrf_tokens:
            return True
        
        token_data = csrf_tokens[token]
        time_until_expiry = token_data['expires_at'] - time.time()
        
        return time_until_expiry < CSRF_REFRESH_THRESHOLD
    
    def _hash_ip(self, ip: str) -> str:
        """Create a hash of the IP address"""
        return hashlib.sha256(f"{ip}{CSRF_SECRET_KEY}".encode()).hexdigest()[:16]
    
    def _hash_user_agent(self, user_agent: str) -> str:
        """Create a hash of the User-Agent"""
        return hashlib.sha256(f"{user_agent}{CSRF_SECRET_KEY}".encode()).hexdigest()[:16]
    
    def _cleanup_token(self, token: str):
        """Remove token from store"""
        csrf_tokens.pop(token, None)
    
    def cleanup_expired_tokens(self):
        """Clean up expired tokens periodically"""
        current_time = time.time()
        expired_tokens = [
            token for token, data in csrf_tokens.items() 
            if current_time > data['expires_at']
        ]
        
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
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        
        csrf_token = request.headers.get('X-CSRF-Token')
        if not csrf_token:
            return jsonify({
                'error': 'CSRF token required',
                'code': 'CSRF_TOKEN_MISSING'
            }), 403
        
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', '')
        
        if not csrf_manager.validate_token(csrf_token, client_ip, user_agent):
            return jsonify({
                'error': 'Invalid or expired CSRF token',
                'code': 'CSRF_TOKEN_INVALID'
            }), 403
        
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
                    'retry_after': int(blocked_ips[client_ip] - current_time),
                    'code': 'RATE_LIMITED'
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
                'retry_after': BLOCK_DURATION,
                'code': 'RATE_LIMITED'
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
        # Skip validation for OPTIONS requests
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        
        # Validate Content-Type for POST requests
        if request.method == 'POST':
            content_type = request.headers.get('Content-Type', '')
            if not content_type.startswith('application/json'):
                return jsonify({
                    'error': 'Invalid Content-Type. Expected application/json.',
                    'code': 'INVALID_CONTENT_TYPE'
                }), 400
        
        # Validate Origin
        origin = request.headers.get('Origin')
        if origin and origin not in ALLOWED_ORIGINS:
            return jsonify({
                'error': 'Invalid origin',
                'code': 'INVALID_ORIGIN'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def is_valid_domain(domain: str) -> bool:
    """Validate domain format"""
    if not domain or len(domain) > MAX_DOMAIN_LENGTH:
        return False
    
    # Basic domain regex
    import re
    domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
    
    if not re.match(domain_pattern, domain):
        return False
    
    # Check for suspicious patterns
    suspicious = ['localhost', '127.0.0.1', 'test.test', 'example.example']
    if any(pattern in domain.lower() for pattern in suspicious):
        return False
    
    return True

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
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # CORS headers for credentials
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    # Rate limit headers
    if hasattr(g, 'rate_limit_remaining'):
        response.headers['X-RateLimit-Remaining'] = str(g.rate_limit_remaining)
        response.headers['X-RateLimit-Reset'] = str(g.rate_limit_reset)
    
    return response

@app.route('/', methods=['GET'])
@rate_limit
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DNSBunch API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

# Fixed CSRF token endpoint
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Generate and return a new CSRF token"""
    try:
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', '')
        
        # Generate new token
        token = csrf_manager.generate_token(client_ip, user_agent)
        
        response = jsonify({
            'csrf_token': token,
            'expires_in': CSRF_TOKEN_EXPIRES,
            'server_time': int(time.time())
        })
        
        # Set CORS headers explicitly
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Origin'] = origin
        
        return response
        
    except Exception as e:
        app.logger.error(f"CSRF token generation failed: {e}")
        return jsonify({'error': 'Token generation failed'}), 500

# Fixed main API endpoint - FIXED DNSChecker instantiation
@app.route('/api/check', methods=['POST', 'OPTIONS'])
@rate_limit
@validate_request
@csrf_required
def check_dns():
    """Main DNS checking endpoint"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRF-Token'
        return response
    
    try:
        data = request.get_json()
        domain = data.get('domain', '').strip().lower()
        checks = data.get('checks', [])
        
        if not domain:
            return jsonify({'error': 'Domain is required'}), 400
        
        # Validate domain format
        if not is_valid_domain(domain):
            return jsonify({'error': 'Invalid domain format'}), 400
        
        # FIXED: Pass domain to DNSChecker constructor
        checker = DNSChecker(domain)
        results = asyncio.run(checker.run_all_checks(checks))
        
        response = jsonify(results)
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Origin'] = origin
        
        return response
        
    except Exception as e:
        app.logger.error(f"DNS check failed for {domain}: {e}")
        error_response = jsonify({'error': 'DNS analysis failed'})
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            error_response.headers['Access-Control-Allow-Credentials'] = 'true'
            error_response.headers['Access-Control-Allow-Origin'] = origin
        return error_response, 500

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
