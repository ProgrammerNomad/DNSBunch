from dns_checker import DNSChecker
import json
import asyncio

# Test with asd.com to see if we detect the NS record differences
domain = "asd.com"
checker = DNSChecker(domain)

async def test_mismatched_ns():
    print(f"=== Testing {domain} for NS Record Differences ===")
    
    # Test the individual methods
    parent_result = await checker._get_parent_delegation()
    domain_result = await checker._get_domain_nameservers()
    
    print(f"\n1. Parent Delegation:")
    print(f"   Status: {parent_result.get('status')}")
    print(f"   Records: {parent_result.get('records', [])}")
    print(f"   TLD Server: {parent_result.get('tld_server_used')}")
    
    print(f"\n2. Domain Nameservers:")
    print(f"   Status: {domain_result.get('status')}")
    print(f"   Records: {domain_result.get('records', [])}")
    
    # Test comparison
    parent_records = set(parent_result.get("records", []))
    domain_records = set(domain_result.get("records", []))
    
    print(f"\n3. Comparison:")
    print(f"   Parent records: {parent_records}")
    print(f"   Domain records: {domain_records}")
    print(f"   Match: {parent_records == domain_records}")
    print(f"   Only in parent: {parent_records - domain_records}")
    print(f"   Only in domain: {domain_records - parent_records}")
    
    # Test full NS check
    print(f"\n4. Full NS Check:")
    full_result = await checker.run_all_checks(['ns'])
    ns_data = full_result['checks']['ns']
    print(f"   Status: {ns_data.get('status')}")
    print(f"   Comparisons: {ns_data.get('comparisons', {})}")
    
    return full_result

result = asyncio.run(test_mismatched_ns())
