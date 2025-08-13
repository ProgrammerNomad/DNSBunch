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

# Configure CORS from environment variables
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=cors_origins)

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DNSBunch API",
        "version": "1.0.0"
    })

@app.route('/api/check', methods=['POST'])
def check_domain():
    """
    Main endpoint for DNS domain checking
    
    Expected JSON payload:
    {
        "domain": "example.com",
        "checks": ["all"] or ["ns", "soa", "mx", ...]  # optional, defaults to all
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'domain' not in data:
            return jsonify({
                "error": "Domain is required",
                "code": "MISSING_DOMAIN"
            }), 400
        
        domain = data['domain'].strip().lower()
        
        # Validate domain format
        if not _is_valid_domain(domain):
            return jsonify({
                "error": "Invalid domain format",
                "code": "INVALID_DOMAIN"
            }), 400
        
        # Get requested checks (default to all)
        requested_checks = data.get('checks', ['all'])
        
        # Initialize DNS checker
        checker = DNSChecker(domain)
        
        # Run DNS checks
        try:
            results = asyncio.run(checker.run_all_checks(requested_checks))
            
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
    
    # Basic domain regex pattern
    domain_pattern = re.compile(
        r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$'
    )
    
    if not domain or len(domain) > 253:
        return False
    
    return bool(domain_pattern.match(domain))

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
