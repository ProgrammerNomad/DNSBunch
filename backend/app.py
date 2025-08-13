import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import asyncio
import logging
from dns_checker import DNSChecker

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow your frontend domain
cors_origins = [
    'https://www.dnsbunch.com',
    'https://dnsbunch.com', 
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]

# If CORS_ORIGINS environment variable is set, use it
if os.getenv('CORS_ORIGINS'):
    cors_origins = os.getenv('CORS_ORIGINS').split(',')

CORS(app, origins=cors_origins, methods=['GET', 'POST', 'OPTIONS'])

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DNSBunch API",
        "version": "1.0.0",
        "cors_origins": cors_origins
    })

@app.route('/api/check', methods=['POST', 'OPTIONS'])
def check_domain():
    """DNS analysis endpoint"""
    
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        
        if not data or 'domain' not in data:
            return jsonify({
                "error": "Domain parameter is required",
                "code": "MISSING_DOMAIN"
            }), 400
        
        domain = data['domain'].strip().lower()
        
        if not domain:
            return jsonify({
                "error": "Domain cannot be empty",
                "code": "EMPTY_DOMAIN"
            }), 400
        
        if not _is_valid_domain(domain):
            return jsonify({
                "error": "Invalid domain format",
                "code": "INVALID_DOMAIN"
            }), 400
        
        logger.info(f"Starting DNS check for domain: {domain}")
        
        try:
            # Perform DNS analysis
            checker = DNSChecker()
            results = asyncio.run(checker.analyze_domain(domain))
            
            return jsonify({
                "domain": domain,
                "timestamp": results.get('timestamp'),
                "status": "completed", 
                "checks": results.get('checks', {}),
                "summary": results.get('summary', {})
            })
            
        except Exception as e:
            logger.error(f"DNS check failed for {domain}: {str(e)}")
            return jsonify({
                "error": f"DNS check failed: {str(e)}",
                "code": "DNS_CHECK_FAILED"
            }), 500
    
    except Exception as e:
        logger.error(f"Request processing failed: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "code": "INTERNAL_ERROR"
        }), 500

def _is_valid_domain(domain):
    """Basic domain validation"""
    import re
    pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
    return re.match(pattern, domain) is not None and len(domain) <= 253

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "code": "NOT_FOUND"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "code": "INTERNAL_ERROR"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
