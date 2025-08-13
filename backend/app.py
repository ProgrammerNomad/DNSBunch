import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
from datetime import datetime

from dns_checker import DNSChecker

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'DNSBunch API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/check', methods=['POST'])
def check_dns():
    """Check DNS records for a domain"""
    try:
        data = request.get_json()
        
        if not data or 'domain' not in data:
            return jsonify({'error': 'Domain is required'}), 400
        
        domain = data['domain'].strip().lower()
        requested_checks = data.get('checks', [])  # Get specific checks if provided
        
        # Validate domain
        if not domain or len(domain) > 253:
            return jsonify({'error': 'Invalid domain name'}), 400
        
        # Create DNS checker and run analysis
        checker = DNSChecker(domain)
        
        # Determine what checks to run based on the request
        if requested_checks and len(requested_checks) > 0:
            print(f"Running specific checks: {requested_checks} for domain: {domain}")
            result = asyncio.run(checker.run_all_checks(requested_checks))
        else:
            print(f"Running all checks for domain: {domain} (no specific checks requested)")
            result = asyncio.run(checker.run_all_checks())
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error checking DNS for domain: {str(e)}")
        return jsonify({'error': f'DNS check failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
