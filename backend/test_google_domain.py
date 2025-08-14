#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dns_checker import DNSChecker

async def test_google():
    """Test google.com (should have matching NS records)"""
    print("=== Testing google.com for NS Record Status ===\n")
    
    # Initialize DNS checker
    checker = DNSChecker("google.com")
    
    # Get parent delegation
    parent_result = await checker._get_parent_delegation()
    print("1. Parent Delegation:")
    print(f"   Status: {parent_result.get('status')}")
    print(f"   Records: {parent_result.get('records')}")
    print(f"   TLD Server: {parent_result.get('tld_server_used')}")
    print()
    
    # Get domain nameservers
    domain_ns_result = await checker._get_domain_nameservers()
    print("2. Domain Nameservers:")
    print(f"   Status: {domain_ns_result.get('status')}")
    print(f"   Records: {domain_ns_result.get('records')}")
    print()
    
    # Compare records
    comparison_result = checker._compare_ns_records(parent_result, domain_ns_result)
    print("3. Comparison:")
    print(f"   Parent records: {set(parent_result.get('records', []))}")
    print(f"   Domain records: {set(domain_ns_result.get('records', []))}")
    print(f"   Match: {comparison_result.get('match')}")
    print(f"   Only in parent: {comparison_result.get('only_in_parent')}")
    print(f"   Only in domain: {comparison_result.get('only_in_domain')}")
    print()
    
    # Full NS check
    print("4. Full NS Check:")
    result = await checker.run_all_checks(['ns'])
    
    if 'checks' in result and 'ns' in result['checks']:
        ns_result = result['checks']['ns']
        print(f"   Status: {ns_result.get('status')}")
        print(f"   Comparisons: {ns_result.get('comparisons')}")
    else:
        print(f"   Error: {result}")

if __name__ == "__main__":
    asyncio.run(test_google())
