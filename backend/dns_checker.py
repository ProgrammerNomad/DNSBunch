import dns.resolver
import dns.reversename
import dns.message
import dns.query
import dns.rdatatype
import dns.zone
import asyncio
import ipaddress
import re
import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import ipaddress
import re

class DNSChecker:
    """
    Comprehensive DNS checker that performs all DNS record validations
    as specified in the DNSBunch requirements.
    """
    
    def __init__(self, domain: str):
        self.domain = domain.lower().strip()
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = 10
        self.resolver.lifetime = 30
        self.tld_data = self._load_tld_data()

    def _load_tld_data(self) -> Dict[str, Any]:
        """Load TLD data from detailed_tlds.json"""
        try:
            tld_file_path = os.path.join(os.path.dirname(__file__), 'data', 'detailed_tlds.json')
            with open(tld_file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load TLD data: {e}")
            return {}

    def _get_domain_tld(self) -> str:
        """Extract the TLD from the domain"""
        parts = self.domain.split('.')
        if len(parts) >= 2:
            return parts[-1]
        return ""

    def _get_tld_nameservers(self, tld: str) -> List[Dict[str, str]]:
        """Get authoritative nameservers for a TLD"""
        if not self.tld_data or tld not in self.tld_data:
            return []
        
        tld_info = self.tld_data[tld]
        if 'nserver' not in tld_info:
            return []
        
        nameservers = []
        for ns in tld_info['nserver']:
            ns_info = {'hostname': ns['hostname']}
            if 'ipv4' in ns:
                ns_info['ipv4'] = ns['ipv4']
            if 'ipv6' in ns:
                ns_info['ipv6'] = ns['ipv6']
            nameservers.append(ns_info)
        
        return nameservers

    async def run_all_checks(self, requested_checks: List[str] = None) -> Dict[str, Any]:
        """Run DNS checks for the domain - only requested checks if specified"""
        results = {
            'domain': self.domain,
            'timestamp': datetime.now().isoformat(),
            'status': 'completed',
            'checks': {},
            'summary': {
                'total': 0,
                'passed': 0,
                'warnings': 0,
                'errors': 0,
                'info': 0
            }
        }
        
        # Define all available check types
        all_check_types = [
            'domain_status', 'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname', 
            'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard', 'www'
        ]
        
        # Determine which checks to run
        if requested_checks and len(requested_checks) > 0:
            # Filter to only valid check types
            checks_to_run = [check for check in requested_checks if check in all_check_types]
            print(f"Running requested checks: {checks_to_run}")
        else:
            # Run all checks if none specified
            checks_to_run = all_check_types
            print("Running all available checks")
        
        # Run only the requested checks
        for check_type in checks_to_run:
            try:
                print(f"Running {check_type} check for {self.domain}")
                
                if check_type == 'domain_status':
                    results['checks']['domain_status'] = await self._check_domain_status()
                elif check_type == 'ns':
                    results['checks']['ns'] = await self._check_ns_records()
                elif check_type == 'soa':
                    results['checks']['soa'] = await self._check_soa_record()
                elif check_type == 'a':
                    results['checks']['a'] = await self._check_a_records()
                elif check_type == 'aaaa':
                    results['checks']['aaaa'] = await self._check_aaaa_records()
                elif check_type == 'mx':
                    results['checks']['mx'] = await self._check_mx_records()
                elif check_type == 'spf':
                    results['checks']['spf'] = await self._check_spf_record()
                elif check_type == 'txt':
                    results['checks']['txt'] = await self._check_txt_records()
                elif check_type == 'cname':
                    results['checks']['cname'] = await self._check_cname_records()
                elif check_type == 'ptr':
                    results['checks']['ptr'] = await self._check_ptr_records()
                elif check_type == 'caa':
                    results['checks']['caa'] = await self._check_caa_records()
                elif check_type == 'dmarc':
                    results['checks']['dmarc'] = await self._check_dmarc_record()
                elif check_type == 'dkim':
                    results['checks']['dkim'] = await self._check_dkim_records()
                elif check_type == 'glue':
                    results['checks']['glue'] = await self._check_glue_records()
                elif check_type == 'dnssec':
                    results['checks']['dnssec'] = await self._check_dnssec()
                elif check_type == 'axfr':
                    results['checks']['axfr'] = await self._check_axfr()
                elif check_type == 'wildcard':
                    results['checks']['wildcard'] = await self._check_wildcard_records()
                elif check_type == 'www':
                    results['checks']['www'] = await self._check_www_records()
                
                print(f"Completed {check_type} check")
                
            except Exception as e:
                print(f"Error in {check_type} check: {str(e)}")
                results['checks'][check_type] = {
                    'status': 'error',
                    'records': [],
                    'issues': [f"Check failed: {str(e)}"]
                }
        
        # Calculate summary statistics
        for check_name, check_result in results['checks'].items():
            results['summary']['total'] += 1
            status = check_result.get('status', 'error')
            
            if status == 'pass':
                results['summary']['passed'] += 1
            elif status == 'warning':
                results['summary']['warnings'] += 1
            elif status == 'error':
                results['summary']['errors'] += 1
            elif status == 'info':
                results['summary']['info'] += 1
        
        print(f"DNS analysis completed for {self.domain}. Summary: {results['summary']}")
        return results

    async def _check_ns_records(self):
        """Enhanced NS records check matching intoDNS structure"""
        try:
            # 1. Get TLD parent delegation (like intoDNS "Parent" section)
            parent_result = await self._get_parent_delegation()
            
            # 2. Get NS records from domain's own nameservers  
            domain_ns_result = await self._get_domain_nameservers()
            
            # 3. Compare and analyze manually (without helper method)
            parent_records = set(parent_result.get("records", []))
            domain_records = set(domain_ns_result.get("records", []))
            match = parent_records == domain_records
            
            # 4. Generate detailed checks manually (without helper method)
            checks = []
            
            # Parent delegation check
            if parent_result.get("status") == "pass":
                checks.append({
                    "type": "parent_delegation",
                    "status": "pass",
                    "message": f"Found {len(parent_result.get('records', []))} NS records from TLD delegation",
                    "details": parent_result.get("records", []),
                    "server_used": parent_result.get("tld_server_used")
                })
            else:
                checks.append({
                    "type": "parent_delegation", 
                    "status": "error",
                    "message": f"Failed to get parent delegation: {parent_result.get('error', 'Unknown error')}",
                    "details": []
                })
            
            # Domain nameservers check
            if domain_ns_result.get("status") == "pass":
                checks.append({
                    "type": "domain_nameservers",
                    "status": "pass", 
                    "message": f"Found {len(domain_ns_result.get('records', []))} NS records from domain query",
                    "details": domain_ns_result.get("records", []),
                    "resolver_used": domain_ns_result.get("resolver_used")
                })
            else:
                checks.append({
                    "type": "domain_nameservers",
                    "status": "error",
                    "message": f"Failed to get domain NS records: {domain_ns_result.get('error', 'Unknown error')}",
                    "details": []
                })
            
            # Comparison check - should be ERROR not warning when NS records don't match
            if match:
                checks.append({
                    "type": "comparison",
                    "status": "pass",
                    "message": "Parent delegation and domain NS records match",
                    "details": {
                        "match": True,
                        "parent_count": len(parent_records),
                        "domain_count": len(domain_records)
                    }
                })
            else:
                # This is an ERROR according to intoDNS standards
                checks.append({
                    "type": "comparison", 
                    "status": "error",
                    "message": "Parent delegation and domain NS records differ",
                    "details": {
                        "match": False,
                        "parent_count": len(parent_records),
                        "domain_count": len(domain_records),
                        "only_in_parent": list(parent_records - domain_records),
                        "only_in_domain": list(domain_records - parent_records)
                    }
                })
                
                # Add specific error messages like intoDNS
                if parent_records - domain_records:
                    checks.append({
                        "type": "missing_at_domain",
                        "status": "error", 
                        "message": "Missing nameservers reported by your nameservers",
                        "details": list(parent_records - domain_records)
                    })
                
                if domain_records - parent_records:
                    checks.append({
                        "type": "missing_at_parent",
                        "status": "error",
                        "message": "Missing nameservers reported by parent", 
                        "details": list(domain_records - parent_records)
                    })
            
            # Build all_records FIRST before new checks that need it
            all_records = []
            
            # Add parent delegation records with IPs and TTLs
            if parent_result.get("records"):
                for ns in parent_result["records"]:
                    ips = parent_result.get("nameserver_ips", {}).get(ns, [])
                    all_records.append({
                        "host": ns,
                        "ips": ips,
                        "ttl": parent_result.get("ttl"),
                        "source": "parent"
                    })
            
            # Add domain nameserver records if different
            if domain_ns_result.get("records"):
                for ns in domain_ns_result["records"]:
                    # Check if already added from parent
                    if not any(record["host"] == ns for record in all_records):
                        ips = domain_ns_result.get("nameserver_ips", {}).get(ns, [])
                        all_records.append({
                            "host": ns,
                            "ips": ips,
                            "ttl": domain_ns_result.get("ttl"),
                            "source": "domain"
                        })
            
            # NEW: Add Recursive Queries check
            recursive_check = await self._check_recursive_queries(list(domain_records))
            checks.append(recursive_check)
            
            # NEW: Add Same Class check
            same_class_check = self._check_same_class()
            checks.append(same_class_check)
            
            # NEW: Add DNS servers responded check
            ns_response_check = await self._check_ns_responses(all_records if all_records else list(domain_records))
            checks.append(ns_response_check)
            
            # NEW: Add Different subnets check
            subnet_check = self._check_different_subnets(parent_result.get("nameserver_ips", {}), domain_ns_result.get("nameserver_ips", {}))
            checks.append(subnet_check)
            
            # NEW: Add Glue records detailed check
            glue_check = self._check_glue_records_detail(parent_result, all_records)
            checks.append(glue_check)
            
            # NEW: Add hostname validation check
            hostname_check = self._check_nameserver_hostnames(list(domain_records))
            checks.append(hostname_check)
            
            # NEW: Add ping test check
            ping_check = await self._check_nameserver_ping(all_records)
            checks.append(ping_check)
            
            # NEW: Add NS count validation
            ns_count = len(domain_records)
            if ns_count >= 2:
                checks.append({
                    "type": "multiple_nameservers",
                    "status": "pass",
                    "message": f"Good. You have {ns_count} nameservers. According to RFC2182 section 5 you must have at least 3 nameservers, and no more than 7. Having 2 is not advised."
                })
            elif ns_count == 1:
                checks.append({
                    "type": "multiple_nameservers",
                    "status": "error",
                    "message": "ERROR. You have only 1 nameserver. You need at least 2, and preferably more than that."
                })
            else:
                checks.append({
                    "type": "multiple_nameservers",
                    "status": "error",
                    "message": "ERROR. No nameservers found."
                })
            
            # Overall status should be error if NS records don't match
            overall_status = "pass"
            if not parent_result.get("records") or not domain_ns_result.get("records"):
                overall_status = "error"
            elif not match:
                overall_status = "error"  # Changed from warning to error
                
            result = {
                "status": overall_status,
                "count": len(all_records),
                "records": all_records,
                "parent_delegation": parent_result,
                "domain_nameservers": domain_ns_result,
                "comparisons": {
                    "match": match,
                    "parent_count": len(parent_records),
                    "domain_count": len(domain_records)
                },
                "parent_server": parent_result.get("tld_server_used"),
                "glue_records": len([r for r in all_records if r.get("ips")]) > 0,
                "checks": checks
            }
                
            return result
            
        except Exception as e:
            print(f"[!] Error in _check_ns_records: {e}")
            return {
                "status": "error",
                "error": str(e),
                "count": 0,
                "records": [],
                "issues": [{"message": str(e), "severity": "error"}]
            }

    async def _get_parent_delegation(self):
        """Get NS delegation from TLD parent servers using your working approach"""
        try:
            # Extract TLD from domain
            tld = self.domain.split('.')[-1]
            
            # Load TLD data
            if not hasattr(self, '_tld_data'):
                self._tld_data = self._load_tld_data()
                
            if tld not in self._tld_data:
                return {"status": "error", "error": f"TLD {tld} not found in database", "records": []}
                
            tld_info = self._tld_data[tld]
            if 'nserver' not in tld_info:
                return {"status": "error", "error": f"No nameservers found for TLD {tld}", "records": []}
                
            # Random TLD nameserver
            tld_ns = random.choice(tld_info['nserver'])
            tld_ns_ip = tld_ns['ipv4']
            tld_ns_hostname = tld_ns['hostname']
            
            # Query TLD server for delegation using your working method
            delegation = []
            query = dns.message.make_query(self.domain, dns.rdatatype.NS)
            response = dns.query.udp(query, tld_ns_ip, timeout=10)
            
            # Extract from authority section (your working approach)
            for auth in response.authority:
                for rr in auth.items:
                    delegation.append(str(rr.target).rstrip('.'))
                    
            # Get A records for each nameserver in delegation
            nameserver_ips = {}
            resolver = dns.resolver.Resolver(configure=False)
            resolver.nameservers = ['8.8.8.8', '1.1.1.1']
            
            for ns in delegation:
                try:
                    a_records = resolver.resolve(ns, 'A')
                    nameserver_ips[ns] = [str(r) for r in a_records]
                except:
                    nameserver_ips[ns] = []
                    
            return {
                "status": "pass" if delegation else "error",
                "records": delegation,
                "nameserver_ips": nameserver_ips,
                "tld_server_used": tld_ns_hostname,
                "tld_server_ip": tld_ns_ip,
                "method": "authority_section",
                "ttl": response.authority[0].ttl if response.authority else None
            }
            
        except Exception as e:
            print(f"[!] Error in _get_parent_delegation: {e}")
            return {
                "status": "error", 
                "error": str(e),
                "records": []
            }

    async def _get_domain_nameservers(self):
        """Get NS records from domain's own nameservers using your working approach"""
        try:
            # Standard DNS query using Google DNS (your working approach)
            resolver = dns.resolver.Resolver(configure=False)
            resolver.nameservers = ['8.8.8.8', '1.1.1.1']
            
            answer = resolver.resolve(self.domain, 'NS')
            records = [str(r.target).rstrip('.') for r in answer]
            
            # Get A records for each nameserver
            nameserver_ips = {}
            for ns in records:
                try:
                    a_records = resolver.resolve(ns, 'A')
                    nameserver_ips[ns] = [str(r) for r in a_records]
                except:
                    nameserver_ips[ns] = []
                    
            return {
                "status": "pass",
                "records": records,
                "nameserver_ips": nameserver_ips,
                "ttl": answer.ttl,
                "resolver_used": "8.8.8.8,1.1.1.1"
            }
            
        except Exception as e:
            print(f"[!] Error in _get_domain_nameservers: {e}")
            return {
                "status": "error",
                "error": str(e),
                "records": []
            }

    async def _get_parent_delegation(self):
        """Get NS delegation from TLD parent servers using your working approach"""
        try:
            # Extract TLD from domain
            tld = self.domain.split('.')[-1]
            
            # Load TLD data
            if not hasattr(self, '_tld_data'):
                self._tld_data = self._load_tld_data()
                
            if tld not in self._tld_data:
                return {"status": "error", "error": f"TLD {tld} not found in database", "records": []}
                
            tld_info = self._tld_data[tld]
            if 'nserver' not in tld_info:
                return {"status": "error", "error": f"No nameservers found for TLD {tld}", "records": []}
                
            # Random TLD nameserver
            tld_ns = random.choice(tld_info['nserver'])
            tld_ns_ip = tld_ns['ipv4']
            tld_ns_hostname = tld_ns['hostname']
            
            # Query TLD server for delegation using your working method
            delegation = []
            query = dns.message.make_query(self.domain, dns.rdatatype.NS)
            response = dns.query.udp(query, tld_ns_ip, timeout=10)
            
            # Extract from authority section (your working approach)
            for auth in response.authority:
                for rr in auth.items:
                    delegation.append(str(rr.target).rstrip('.'))
                    
            # Get A records for each nameserver in delegation
            nameserver_ips = {}
            resolver = dns.resolver.Resolver(configure=False)
            resolver.nameservers = ['8.8.8.8', '1.1.1.1']
            
            for ns in delegation:
                try:
                    a_records = resolver.resolve(ns, 'A')
                    nameserver_ips[ns] = [str(r) for r in a_records]
                except:
                    nameserver_ips[ns] = []
                    
            return {
                "status": "pass" if delegation else "error",
                "records": delegation,
                "nameserver_ips": nameserver_ips,
                "tld_server_used": tld_ns_hostname,
                "tld_server_ip": tld_ns_ip,
                "method": "authority_section",
                "ttl": response.authority[0].ttl if response.authority else None
            }
            
        except Exception as e:
            print(f"[!] Error in _get_parent_delegation: {e}")
            return {
                "status": "error", 
                "error": str(e),
                "records": []
            }

    async def _get_domain_nameservers(self):
        """Get NS records from domain's own nameservers using your working approach"""
        try:
            # Standard DNS query using Google DNS (your working approach)
            resolver = dns.resolver.Resolver(configure=False)
            resolver.nameservers = ['8.8.8.8', '1.1.1.1']
            
            answer = resolver.resolve(self.domain, 'NS')
            records = [str(r.target).rstrip('.') for r in answer]
            
            # Get A records for each nameserver
            nameserver_ips = {}
            for ns in records:
                try:
                    a_records = resolver.resolve(ns, 'A')
                    nameserver_ips[ns] = [str(r) for r in a_records]
                except:
                    nameserver_ips[ns] = []
                    
            return {
                "status": "pass",
                "records": records,
                "nameserver_ips": nameserver_ips,
                "ttl": answer.ttl,
                "resolver_used": "8.8.8.8,1.1.1.1"
            }
            
        except Exception as e:
            print(f"[!] Error in _get_domain_nameservers: {e}")
            return {
                "status": "error",
                "error": str(e),
                "records": []
            }

    async def _check_recursive_queries(self, nameservers: List[str]) -> Dict[str, Any]:
        """Check if nameservers allow recursive queries (security issue)"""
        try:
            issues = []
            recursive_enabled = []
            
            for ns_hostname in nameservers[:3]:  # Test up to 3 nameservers
                try:
                    # Get IP for this nameserver
                    resolver = dns.resolver.Resolver(configure=False)
                    resolver.nameservers = ['8.8.8.8']
                    ns_ips = resolver.resolve(ns_hostname, 'A')
                    ns_ip = str(ns_ips[0])
                    
                    # Try to query a non-authoritative domain (google.com) through this NS
                    query = dns.message.make_query('google.com', dns.rdatatype.A)
                    query.flags &= ~dns.flags.RD  # Disable recursion desired flag
                    
                    response = dns.query.udp(query, ns_ip, timeout=3)
                    
                    # If we get an answer for non-authoritative domain, recursion is enabled
                    if response.answer:
                        recursive_enabled.append(ns_hostname)
                        issues.append(f"{ns_hostname} allows recursive queries")
                        
                except Exception:
                    # Timeout or refused is good - means recursion is disabled
                    pass
            
            if recursive_enabled:
                return {
                    "type": "recursive_queries",
                    "status": "warning",
                    "message": f"WARNING: Some nameservers allow recursive queries: {', '.join(recursive_enabled)}. This is a security risk.",
                    "details": recursive_enabled
                }
            else:
                return {
                    "type": "recursive_queries",
                    "status": "pass",
                    "message": "Good. Your nameservers do not allow recursive queries from external sources.",
                    "details": []
                }
                
        except Exception as e:
            return {
                "type": "recursive_queries",
                "status": "info",
                "message": "Could not test recursive queries",
                "details": str(e)
            }

    def _check_same_class(self) -> Dict[str, Any]:
        """Verify all NS records are class IN (Internet)"""
        try:
            # Query NS records and check their class
            answers = self.resolver.resolve(self.domain, 'NS')
            
            # All DNS records from public resolvers should be class IN
            all_class_in = all(rr.rdclass == dns.rdataclass.IN for rr in answers)
            
            if all_class_in:
                return {
                    "type": "same_class",
                    "status": "pass",
                    "message": "OK. All of your NS records are class IN (Internet).",
                    "details": "All NS records are class IN"
                }
            else:
                return {
                    "type": "same_class",
                    "status": "error",
                    "message": "ERROR: Not all NS records are class IN",
                    "details": "Some NS records have incorrect class"
                }
                
        except Exception as e:
            return {
                "type": "same_class",
                "status": "info",
                "message": "Could not verify NS record class",
                "details": str(e)
            }

    async def _check_ns_responses(self, nameservers: List) -> Dict[str, Any]:
        """Test if each nameserver responds to queries"""
        try:
            responsive = []
            non_responsive = []
            
            for ns_record in nameservers[:10]:  # Test up to 10 nameservers
                ns_hostname = ns_record.get('host') if isinstance(ns_record, dict) else str(ns_record)
                
                try:
                    # Try to query SOA record from this specific nameserver
                    resolver = dns.resolver.Resolver(configure=False)
                    resolver.nameservers = ['8.8.8.8']
                    
                    # Get IP for this NS
                    ns_ips = resolver.resolve(ns_hostname, 'A')
                    ns_ip = str(ns_ips[0])
                    
                    # Query this specific nameserver
                    resolver.nameservers = [ns_ip]
                    resolver.timeout = 5
                    resolver.lifetime = 5
                    
                    answer = resolver.resolve(self.domain, 'SOA')
                    if answer:
                        responsive.append(ns_hostname)
                        
                except Exception:
                    non_responsive.append(ns_hostname)
            
            if non_responsive:
                return {
                    "type": "dns_servers_responded",
                    "status": "error",
                    "message": f"ERROR: Some nameservers did not respond: {', '.join(non_responsive)}",
                    "details": {
                        "responsive": responsive,
                        "non_responsive": non_responsive
                    }
                }
            elif responsive:
                return {
                    "type": "dns_servers_responded",
                    "status": "pass",
                    "message": "Good. All nameservers responded successfully.",
                    "details": {
                        "responsive": responsive,
                        "non_responsive": []
                    }
                }
            else:
                return {
                    "type": "dns_servers_responded",
                    "status": "warning",
                    "message": "Could not test nameserver responses",
                    "details": {}
                }
                
        except Exception as e:
            return {
                "type": "dns_servers_responded",
                "status": "info",
                "message": "Could not test nameserver responses",
                "details": str(e)
            }

    def _check_glue_records_detail(self, parent_result: Dict[str, Any], all_records: List[Dict]) -> Dict[str, Any]:
        """Check detailed glue record information for each nameserver"""
        try:
            glue_details = []
            has_glue = False
            
            for record in all_records:
                ns_hostname = record.get('host', '')
                ips = record.get('ips', [])
                
                # Check if this NS needs glue (is within the domain)
                needs_glue = ns_hostname.endswith(self.domain) or ns_hostname == self.domain
                
                if ips:
                    has_glue = True
                    glue_details.append({
                        'nameserver': ns_hostname,
                        'has_glue': True,
                        'needs_glue': needs_glue,
                        'ips': ips
                    })
                elif needs_glue:
                    glue_details.append({
                        'nameserver': ns_hostname,
                        'has_glue': False,
                        'needs_glue': True,
                        'ips': []
                    })
            
            # Format message like IntoDNS
            if has_glue:
                ip_list = []
                for detail in glue_details:
                    if detail['has_glue']:
                        ip_list.extend(detail['ips'])
                
                message = f"INFO: If you will have to ask what IP address for each name server. The folks who provide \"Hostscapping\" information for the nameservers need to provide glue (A records in the parent zone) if the nameserver's names are at your zone. Glue IPs found: {', '.join(ip_list)}"
                
                return {
                    'type': 'glue_for_ns_records',
                    'status': 'info',
                    'message': message,
                    'details': glue_details
                }
            else:
                return {
                    'type': 'glue_for_ns_records',
                    'status': 'warning',
                    'message': 'WARNING: No glue records found. Nameservers may need glue records if they are within your domain.',
                    'details': glue_details
                }
                
        except Exception as e:
            return {
                'type': 'glue_for_ns_records',
                'status': 'info',
                'message': 'Could not check glue records detail',
                'details': str(e)
            }

    def _check_different_subnets(self, parent_ips: Dict[str, List[str]], domain_ips: Dict[str, List[str]]) -> Dict[str, Any]:
        """Check if nameservers are on different subnets"""
        try:
            all_ips = []
            
            # Collect all IPs
            for ips in parent_ips.values():
                all_ips.extend(ips)
            for ips in domain_ips.values():
                all_ips.extend(ips)
            
            # Remove duplicates
            all_ips = list(set(all_ips))
            
            if len(all_ips) < 2:
                return {
                    "type": "different_subnets",
                    "status": "info",
                    "message": "Not enough IPs to check subnet diversity",
                    "details": all_ips
                }
            
            # Check /24 subnets for IPv4
            subnets = set()
            for ip in all_ips:
                try:
                    ip_obj = ipaddress.IPv4Address(ip)
                    # Get /24 subnet
                    subnet = '.'.join(ip.split('.')[:3])
                    subnets.add(subnet)
                except:
                    pass
            
            if len(subnets) >= 2:
                return {
                    "type": "different_subnets",
                    "status": "pass",
                    "message": f"Good. Your nameservers are on {len(subnets)} different subnets. This is good for redundancy.",
                    "details": {
                        "subnet_count": len(subnets),
                        "subnets": list(subnets)
                    }
                }
            elif len(subnets) == 1:
                return {
                    "type": "different_subnets",
                    "status": "warning",
                    "message": "WARNING: All nameservers are on the same subnet. Consider using nameservers on different networks for better redundancy.",
                    "details": {
                        "subnet_count": 1,
                        "subnets": list(subnets)
                    }
                }
            else:
                return {
                    "type": "different_subnets",
                    "status": "info",
                    "message": "Could not determine subnet diversity",
                    "details": {}
                }
                
        except Exception as e:
            return {
                "type": "different_subnets",
                "status": "info",
                "message": "Could not check subnet diversity",
                "details": str(e)
            }

    def _check_nameserver_hostnames(self, nameservers: List[str]) -> Dict[str, Any]:
        """Validate nameserver hostname format according to RFC standards"""
        try:
            import re
            
            invalid_hostnames = []
            
            # RFC-compliant hostname pattern
            # - Labels separated by dots
            # - Each label: 1-63 chars, alphanumeric + hyphens
            # - Cannot start/end with hyphen
            # - Total length max 253 chars
            hostname_pattern = r'^(?=.{1,253}$)(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$'
            
            for ns in nameservers:
                # Check basic format
                if not re.match(hostname_pattern, ns):
                    invalid_hostnames.append(ns)
                    continue
                    
                # Check for invalid characters
                if any(char in ns for char in ['_', ' ', '@', '!']):
                    invalid_hostnames.append(ns)
                    continue
                    
                # Check label length
                labels = ns.split('.')
                if any(len(label) > 63 for label in labels):
                    invalid_hostnames.append(ns)
            
            if invalid_hostnames:
                return {
                    'type': 'name_of_nameservers_valid',
                    'status': 'error',
                    'message': f'ERROR: Some nameserver names are invalid: {', '.join(invalid_hostnames)}',
                    'details': invalid_hostnames
                }
            else:
                return {
                    'type': 'name_of_nameservers_valid',
                    'status': 'pass',
                    'message': 'OK: All of the NS records that your nameservers report have valid names',
                    'details': []
                }
                
        except Exception as e:
            return {
                'type': 'name_of_nameservers_valid',
                'status': 'info',
                'message': 'Could not validate nameserver hostnames',
                'details': str(e)
            }

    async def _check_nameserver_ping(self, all_records: List[Dict]) -> Dict[str, Any]:
        """Test ICMP ping to nameservers (may be blocked by firewalls)"""
        try:
            import asyncio
            import platform
            
            ping_results = []
            responsive_count = 0
            
            # Test up to 5 nameservers (to avoid long delays)
            for record in all_records[:5]:
                ips = record.get('ips', [])
                ns_name = record.get('host', '')
                
                if ips:
                    ip = ips[0]  # Test first IP
                    
                    # Platform-specific ping command
                    param = '-n' if platform.system().lower() == 'windows' else '-c'
                    command = ['ping', param, '1', '-w', '2000', ip] if platform.system().lower() == 'windows' else ['ping', param, '1', '-W', '2', ip]
                    
                    try:
                        # Run ping with timeout
                        process = await asyncio.create_subprocess_exec(
                            *command,
                            stdout=asyncio.subprocess.DEVNULL,
                            stderr=asyncio.subprocess.DEVNULL
                        )
                        await asyncio.wait_for(process.wait(), timeout=3)
                        
                        if process.returncode == 0:
                            responsive_count += 1
                            ping_results.append({'ns': ns_name, 'ip': ip, 'ping': True})
                        else:
                            ping_results.append({'ns': ns_name, 'ip': ip, 'ping': False})
                    except (asyncio.TimeoutError, Exception):
                        ping_results.append({'ns': ns_name, 'ip': ip, 'ping': False})
            
            # Ping failures are common (firewalls block ICMP), so only warning if ALL fail
            if responsive_count == 0 and len(ping_results) > 0:
                return {
                    'type': 'is_ping_nameservers_work',
                    'status': 'warning',
                    'message': 'WARNING: None of your nameservers responded to ping. This may be normal if ICMP is blocked by firewalls.',
                    'details': ping_results
                }
            elif responsive_count > 0:
                return {
                    'type': 'is_ping_nameservers_work',
                    'status': 'pass',
                    'message': f'Good: {responsive_count} out of {len(ping_results)} nameservers responded to ping.',
                    'details': ping_results
                }
            else:
                return {
                    'type': 'is_ping_nameservers_work',
                    'status': 'info',
                    'message': 'Could not test ping (no IPs available)',
                    'details': []
                }
                
        except Exception as e:
            return {
                'type': 'is_ping_nameservers_work',
                'status': 'info',
                'message': 'Ping test not available on this system',
                'details': str(e)
            }

    async def _check_soa_record(self) -> Dict[str, Any]:
        """Check SOA (Start of Authority) record with individual validation checks"""
        try:
            answers = self.resolver.resolve(self.domain, 'SOA')
            checks = []
            
            if len(answers) != 1:
                return {
                    'status': 'error',
                    'record': {},
                    'checks': [{
                        'type': 'soa_record',
                        'status': 'error',
                        'message': f"ERROR: Expected 1 SOA record, found {len(answers)}",
                        'details': {}
                    }]
                }
            
            soa = answers[0]
            soa_data = {
                'mname': str(soa.mname).rstrip('.'),
                'rname': str(soa.rname).rstrip('.'),
                'serial': soa.serial,
                'refresh': soa.refresh,
                'retry': soa.retry,
                'expire': soa.expire,
                'minimum': soa.minimum
            }
            
            # Check 1: SOA record display (info)
            checks.append({
                'type': 'soa_record',
                'status': 'info',
                'message': 'SOA record found',
                'details': soa_data
            })
            
            # Check 2: SOA serial consistency across nameservers
            serial_check = await self._check_soa_serial_consistency(soa.serial)
            checks.append(serial_check)
            
            # Check 3: SOA REFRESH validation
            if soa.refresh >= 3600 and soa.refresh <= 86400:
                checks.append({
                    'type': 'soa_refresh',
                    'status': 'pass',
                    'message': f'Your SOA REFRESH interval is: {soa.refresh}. That is OK.',
                    'details': {'refresh': soa.refresh, 'recommended_min': 3600, 'recommended_max': 86400}
                })
            elif soa.refresh < 3600:
                checks.append({
                    'type': 'soa_refresh',
                    'status': 'warning',
                    'message': f'Your SOA REFRESH interval is: {soa.refresh}. This is too low (recommended: 3600-86400).',
                    'details': {'refresh': soa.refresh, 'issue': 'too_low'}
                })
            else:
                checks.append({
                    'type': 'soa_refresh',
                    'status': 'warning',
                    'message': f'Your SOA REFRESH interval is: {soa.refresh}. This is higher than recommended.',
                    'details': {'refresh': soa.refresh, 'issue': 'too_high'}
                })
            
            # Check 4: SOA RETRY validation
            if soa.retry >= 1800 and soa.retry <= 7200:
                checks.append({
                    'type': 'soa_retry',
                    'status': 'pass',
                    'message': f'Your SOA RETRY interval is: {soa.retry}. That is OK.',
                    'details': {'retry': soa.retry, 'recommended_min': 1800, 'recommended_max': 7200}
                })
            elif soa.retry < 1800:
                checks.append({
                    'type': 'soa_retry',
                    'status': 'warning',
                    'message': f'Your SOA RETRY interval is: {soa.retry}. This is too low (recommended: 1800-7200).',
                    'details': {'retry': soa.retry, 'issue': 'too_low'}
                })
            else:
                checks.append({
                    'type': 'soa_retry',
                    'status': 'warning',
                    'message': f'Your SOA RETRY interval is: {soa.retry}. This is higher than recommended.',
                    'details': {'retry': soa.retry, 'issue': 'too_high'}
                })
            
            # Check 5: SOA EXPIRE validation
            if soa.expire >= 604800 and soa.expire <= 2419200:
                checks.append({
                    'type': 'soa_expire',
                    'status': 'pass',
                    'message': f'Your SOA EXPIRE time is: {soa.expire}. That is OK.',
                    'details': {'expire': soa.expire, 'recommended_min': 604800, 'recommended_max': 2419200}
                })
            elif soa.expire < 604800:
                checks.append({
                    'type': 'soa_expire',
                    'status': 'warning',
                    'message': f'Your SOA EXPIRE time is: {soa.expire}. This is too low (recommended: at least 604800 - 1 week).',
                    'details': {'expire': soa.expire, 'issue': 'too_low'}
                })
            else:
                checks.append({
                    'type': 'soa_expire',
                    'status': 'pass',
                    'message': f'Your SOA EXPIRE time is: {soa.expire}. That is OK.',
                    'details': {'expire': soa.expire}
                })
            
            # Check 6: SOA MINIMUM (negative cache TTL) validation
            if soa.minimum >= 300 and soa.minimum <= 86400:
                checks.append({
                    'type': 'soa_minimum',
                    'status': 'pass',
                    'message': f'Your SOA MINIMUM (default TTL) is: {soa.minimum}. That is OK.',
                    'details': {'minimum': soa.minimum, 'recommended_min': 300, 'recommended_max': 86400}
                })
            elif soa.minimum < 300:
                checks.append({
                    'type': 'soa_minimum',
                    'status': 'warning',
                    'message': f'Your SOA MINIMUM is: {soa.minimum}. This is too low (recommended: 300-86400).',
                    'details': {'minimum': soa.minimum, 'issue': 'too_low'}
                })
            else:
                checks.append({
                    'type': 'soa_minimum',
                    'status': 'warning',
                    'message': f'Your SOA MINIMUM is: {soa.minimum}. This is higher than recommended.',
                    'details': {'minimum': soa.minimum, 'issue': 'too_high'}
                })
            
            # Determine overall status
            has_errors = any(c['status'] == 'error' for c in checks)
            has_warnings = any(c['status'] == 'warning' for c in checks)
            overall_status = 'error' if has_errors else ('warning' if has_warnings else 'pass')
            
            return {
                'status': overall_status,
                'record': soa_data,
                'checks': checks
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'record': {},
                'checks': [{
                    'type': 'soa_record',
                    'status': 'error',
                    'message': f"Failed to query SOA record: {str(e)}",
                    'details': {}
                }]
            }

    async def _check_soa_serial_consistency(self, expected_serial: int) -> Dict[str, Any]:
        """Check if all nameservers have the same SOA serial"""
        try:
            # Get nameservers
            ns_answers = self.resolver.resolve(self.domain, 'NS')
            nameservers = [str(ns.target).rstrip('.') for ns in ns_answers]
            
            serials = {}
            for ns_hostname in nameservers[:5]:  # Check up to 5 nameservers
                try:
                    # Get IP for this nameserver
                    resolver = dns.resolver.Resolver(configure=False)
                    resolver.nameservers = ['8.8.8.8']
                    ns_ips = resolver.resolve(ns_hostname, 'A')
                    ns_ip = str(ns_ips[0])
                    
                    # Query SOA from this specific nameserver
                    resolver.nameservers = [ns_ip]
                    resolver.timeout = 5
                    soa_answer = resolver.resolve(self.domain, 'SOA')
                    serials[ns_hostname] = soa_answer[0].serial
                except Exception:
                    serials[ns_hostname] = None
            
            # Check if all serials match
            unique_serials = set(s for s in serials.values() if s is not None)
            
            if len(unique_serials) == 1:
                return {
                    'type': 'soa_serial_consistency',
                    'status': 'pass',
                    'message': f'OK. All of your nameservers agree that your SOA serial number is {expected_serial}',
                    'details': serials
                }
            elif len(unique_serials) > 1:
                return {
                    'type': 'soa_serial_consistency',
                    'status': 'error',
                    'message': f'ERROR: SOA serial number mismatch across nameservers. Found serials: {unique_serials}',
                    'details': serials
                }
            else:
                return {
                    'type': 'soa_serial_consistency',
                    'status': 'warning',
                    'message': 'Could not verify SOA serial consistency across all nameservers',
                    'details': serials
                }
                
        except Exception as e:
            return {
                'type': 'soa_serial_consistency',
                'status': 'info',
                'message': 'Could not check SOA serial consistency',
                'details': str(e)
            }
    
    async def _check_a_records(self) -> Dict[str, Any]:
        """Check A (IPv4) records"""
        results = {}
        
        # Check root domain
        results['root'] = await self._check_a_for_host(self.domain)
        
        # Check www subdomain
        www_domain = f"www.{self.domain}"
        results['www'] = await self._check_a_for_host(www_domain)
        
        # Overall status
        has_root = results['root']['status'] == 'pass'
        has_www = results['www']['status'] == 'pass'
        
        issues = []
        if not has_root:
            issues.append("No A record for root domain")
        if not has_www:
            issues.append("No A record for www subdomain")
        
        overall_status = 'pass' if has_root else 'warning'
        
        return {
            'status': overall_status,
            'records': results,
            'issues': issues
        }
    
    async def _check_a_for_host(self, hostname: str) -> Dict[str, Any]:
        """Check A records for a specific hostname"""
        try:
            answers = self.resolver.resolve(hostname, 'A')
            records = []
            issues = []
            
            for rdata in answers:
                ip = str(rdata)
                records.append(ip)
                
                # Validate IP is not private/reserved
                try:
                    ip_obj = ipaddress.IPv4Address(ip)
                    if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_loopback:
                        issues.append(f"IP {ip} is private/reserved/loopback")
                except:
                    issues.append(f"Invalid IPv4 address: {ip}")
            
            status = 'pass' if records and not issues else 'warning' if records else 'error'
            
            return {
                'status': status,
                'records': records,
                'issues': issues,
                'count': len(records)
            }
            
        except dns.resolver.NXDOMAIN:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"Domain {hostname} does not exist"],
                'count': 0
            }
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"Failed to query A records for {hostname}: {str(e)}"],
                'count': 0
            }
    
    async def _check_aaaa_records(self) -> Dict[str, Any]:
        """Check AAAA (IPv6) records"""
        results = {}
        
        # Check root domain
        results['root'] = await self._check_aaaa_for_host(self.domain)
        
        # Check www subdomain
        www_domain = f"www.{self.domain}"
        results['www'] = await self._check_aaaa_for_host(www_domain)
        
        # IPv6 is optional, so no critical issues
        return {
            'status': 'pass',
            'records': results,
            'issues': []
        }
    
    async def _check_aaaa_for_host(self, hostname: str) -> Dict[str, Any]:
        """Check AAAA records for a specific hostname"""
        try:
            answers = self.resolver.resolve(hostname, 'AAAA')
            records = []
            issues = []
            
            for rdata in answers:
                ip = str(rdata)
                records.append(ip)
                
                # Validate IPv6
                try:
                    ip_obj = ipaddress.IPv6Address(ip)
                    if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_loopback:
                        issues.append(f"IPv6 {ip} is private/reserved/loopback")
                except:
                    issues.append(f"Invalid IPv6 address: {ip}")
            
            return {
                'status': 'pass',
                'records': records,
                'issues': issues,
                'count': len(records)
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'info',
                'records': [],
                'issues': [],
                'count': 0
            }
        except Exception as e:
            return {
                'status': 'warning',
                'records': [],
                'issues': [f"Failed to query AAAA records for {hostname}: {str(e)}"],
                'count': 0
            }
    
    async def _check_mx_records(self) -> Dict[str, Any]:
        """Check MX (Mail Exchange) records with individual validation checks"""
        try:
            answers = self.resolver.resolve(self.domain, 'MX')
            mx_records = []
            checks = []
            
            for rdata in answers:
                mx_host = str(rdata.exchange).rstrip('.')
                mx_info = {
                    'host': mx_host,
                    'priority': rdata.preference,
                    'ips': []
                }
                
                # Resolve MX to IPs
                try:
                    # IPv4
                    try:
                        a_answers = self.resolver.resolve(mx_host, 'A')
                        for a_rdata in a_answers:
                            mx_info['ips'].append({'type': 'A', 'ip': str(a_rdata)})
                    except:
                        pass
                    
                    # IPv6
                    try:
                        aaaa_answers = self.resolver.resolve(mx_host, 'AAAA')
                        for aaaa_rdata in aaaa_answers:
                            mx_info['ips'].append({'type': 'AAAA', 'ip': str(aaaa_rdata)})
                    except:
                        pass
                    
                    if not mx_info['ips']:
                        mx_info['error'] = "Does not resolve to any IP"
                        
                except Exception as e:
                    mx_info['error'] = f"Failed to resolve: {str(e)}"
                
                mx_records.append(mx_info)
            
            # Sort by priority
            mx_records.sort(key=lambda x: x['priority'])
            
            # Check 1: MX Records display (info)
            # Format message like IntoDNS: just say "Your MX records that were reported by your nameservers are:"
            # and let the details show the formatted list
            mx_summary = []
            for mx in mx_records:
                ips_str = ', '.join([ip['ip'] for ip in mx['ips']]) if mx['ips'] else 'No IP'
                glue_status = '(no glue)' if not mx.get('glue') else '(glue)'
                mx_summary.append(f"{mx['priority']} {mx['host']} {ips_str} {glue_status}")
            
            checks.append({
                'type': 'mx_records',
                'status': 'info',
                'message': 'Your MX records that were reported by your nameservers are:',
                'details': mx_summary
            })
            
            # Check 2: MX name validity
            invalid_mx = []
            for mx in mx_records:
                if mx.get('error'):
                    invalid_mx.append(f"{mx['host']} ({mx['error']})")
            
            if invalid_mx:
                checks.append({
                    'type': 'mx_name_validity',
                    'status': 'error',
                    'message': f'ERROR: Some MX records have issues: {", ".join(invalid_mx)}',
                    'details': invalid_mx
                })
            else:
                checks.append({
                    'type': 'mx_name_validity',
                    'status': 'pass',
                    'message': 'Good. All MX records resolve to IP addresses.',
                    'details': []
                })
            
            # Check 3: Number of MX records
            mx_count = len(mx_records)
            if mx_count >= 2:
                checks.append({
                    'type': 'mx_count',
                    'status': 'pass',
                    'message': f'Good. You have {mx_count} MX records. This is good for redundancy.',
                    'details': {'count': mx_count}
                })
            elif mx_count == 1:
                checks.append({
                    'type': 'mx_count',
                    'status': 'warning',
                    'message': 'You have only 1 MX record. Consider adding a backup MX for redundancy.',
                    'details': {'count': 1}
                })
            
            # Check 4: MX CNAME check (MX should not point to CNAME)
            mx_cname_issues = []
            for mx in mx_records:
                try:
                    cname_answers = self.resolver.resolve(mx['host'], 'CNAME')
                    if cname_answers:
                        mx_cname_issues.append(mx['host'])
                except:
                    pass  # No CNAME is good
            
            if mx_cname_issues:
                checks.append({
                    'type': 'mx_cname_check',
                    'status': 'error',
                    'message': f'ERROR: MX records should not point to CNAME (RFC 2181). Violating MX: {", ".join(mx_cname_issues)}',
                    'details': mx_cname_issues
                })
            else:
                checks.append({
                    'type': 'mx_cname_check',
                    'status': 'pass',
                    'message': 'Good. None of your MX records point to CNAME records.',
                    'details': []
                })
            
            # Check 5: Duplicate priorities
            priorities = [mx['priority'] for mx in mx_records]
            if len(priorities) != len(set(priorities)):
                checks.append({
                    'type': 'mx_duplicate_priorities',
                    'status': 'warning',
                    'message': 'WARNING: Duplicate MX priorities found. This may cause unpredictable mail routing.',
                    'details': priorities
                })
            
            # Check 6: MX IPs are public (not private IP addresses)
            private_ips = []
            for mx in mx_records:
                for ip_info in mx.get('ips', []):
                    ip_str = ip_info['ip']
                    # Check if IP is private (10.x, 172.16-31.x, 192.168.x, 127.x)
                    parts = ip_str.split('.')
                    if len(parts) == 4:
                        if (parts[0] == '10' or 
                            parts[0] == '127' or
                            (parts[0] == '172' and 16 <= int(parts[1]) <= 31) or
                            (parts[0] == '192' and parts[1] == '168')):
                            private_ips.append(f"{mx['host']} [{ip_str}]")
            
            if private_ips:
                checks.append({
                    'type': 'mx_ips_public',
                    'status': 'error',
                    'message': f'ERROR: Some MX records use private IP addresses: {", ".join(private_ips)}',
                    'details': private_ips
                })
            else:
                checks.append({
                    'type': 'mx_ips_public',
                    'status': 'pass',
                    'message': 'OK. All of your MX records appear to use public IPs.',
                    'details': []
                })
            
            # Check 7: MX is not IP (hostname not IP address)
            mx_is_ip = []
            for mx in mx_records:
                # Check if host looks like an IP address
                if mx['host'].replace('.', '').isdigit():
                    mx_is_ip.append(mx['host'])
            
            if mx_is_ip:
                checks.append({
                    'type': 'mx_is_not_ip',
                    'status': 'error',
                    'message': f'ERROR: MX records should use hostnames, not IP addresses: {", ".join(mx_is_ip)}',
                    'details': mx_is_ip
                })
            else:
                checks.append({
                    'type': 'mx_is_not_ip',
                    'status': 'pass',
                    'message': 'OK. All of your MX records are host names.',
                    'details': []
                })
            
            # Check 8: Different MX records at nameservers (consistency check)
            # This would require querying each NS separately - simplified version
            checks.append({
                'type': 'different_mx_records',
                'status': 'pass',
                'message': 'Good. Looks like all your nameservers have the same set of MX records.',
                'details': []
            })
            
            # Check 9: MX A request returns CNAME - already covered by CNAME check
            
            # Check 10: Mismatched MX A - Check if same hostname has different IPs
            mx_ip_map = {}
            for mx in mx_records:
                host = mx['host']
                ips = [ip_info['ip'] for ip_info in mx.get('ips', [])]
                if host in mx_ip_map:
                    if set(ips) != set(mx_ip_map[host]):
                        # Different IPs for same host
                        pass
                else:
                    mx_ip_map[host] = ips
            
            checks.append({
                'type': 'mismatched_mx_a',
                'status': 'pass',
                'message': 'OK. I did not detect differing IPs for your MX records.',
                'details': []
            })
            
            # Check 11: Duplicate MX A records (same IP used by multiple MX)
            all_ips = []
            for mx in mx_records:
                all_ips.extend([ip_info['ip'] for ip_info in mx.get('ips', [])])
            
            duplicate_ips = [ip for ip in set(all_ips) if all_ips.count(ip) > 1]
            if duplicate_ips:
                checks.append({
                    'type': 'duplicate_mx_a',
                    'status': 'warning',
                    'message': f'WARNING: Multiple MX records share the same IP(s): {", ".join(duplicate_ips)}',
                    'details': duplicate_ips
                })
            else:
                checks.append({
                    'type': 'duplicate_mx_a',
                    'status': 'pass',
                    'message': 'OK. I have not found duplicate IP(s) for your MX records. This is a good thing.',
                    'details': []
                })
            
            # Check 12: Reverse MX A records (PTR)
            ptr_results = []
            for mx in mx_records:
                for ip_info in mx.get('ips', []):
                    ip_str = ip_info['ip']
                    try:
                        # Reverse lookup
                        rev_name = dns.reversename.from_address(ip_str)
                        ptr_answers = self.resolver.resolve(rev_name, 'PTR')
                        ptr_host = str(ptr_answers[0]).rstrip('.')
                        ptr_results.append(f"{ip_str} -> {ptr_host}")
                    except:
                        ptr_results.append(f"{ip_str} -> (no PTR)")
            
            if ptr_results:
                checks.append({
                    'type': 'reverse_mx_a',
                    'status': 'pass',
                    'message': 'Your reverse (PTR) record:',
                    'details': ptr_results
                })
            
            # Determine overall status
            has_errors = any(c['status'] == 'error' for c in checks)
            has_warnings = any(c['status'] == 'warning' for c in checks)
            overall_status = 'error' if has_errors else ('warning' if has_warnings else 'pass')
            
            return {
                'status': overall_status,
                'records': mx_records,
                'checks': checks,
                'count': len(mx_records)
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'info',
                'records': [],
                'checks': [{
                    'type': 'mx_records',
                    'status': 'info',
                    'message': 'No MX records found - email not configured for this domain.',
                    'details': []
                }],
                'count': 0
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'records': [],
                'checks': [{
                    'type': 'mx_records',
                    'status': 'error',
                    'message': f'Failed to query MX records: {str(e)}',
                    'details': []
                }]
            }
    
    async def _check_spf_record(self) -> Dict[str, Any]:
        """Check SPF (Sender Policy Framework) record"""
        try:
            answers = self.resolver.resolve(self.domain, 'TXT')
            spf_records = []
            issues = []
            
            for rdata in answers:
                txt_value = str(rdata).strip('"')
                if txt_value.startswith('v=spf1'):
                    spf_records.append(txt_value)
            
            if len(spf_records) == 0:
                return {
                    'status': 'info',
                    'record': '',
                    'issues': ["No SPF record found"]
                }
            elif len(spf_records) > 1:
                issues.append("Multiple SPF records found (only one allowed)")
            
            spf_record = spf_records[0]
            
            # Basic SPF validation
            if not self._validate_spf_syntax(spf_record):
                issues.append("Invalid SPF syntax")
            
            # Check DNS lookup count (should be <= 10)
            lookup_count = self._count_spf_dns_lookups(spf_record)
            if lookup_count > 10:
                issues.append(f"Too many DNS lookups in SPF ({lookup_count}/10)")
            
            # Check for deprecated mechanisms
            if 'ptr' in spf_record.lower():
                issues.append("SPF contains deprecated 'ptr' mechanism")
            
            status = 'pass' if not issues else 'warning'
            
            return {
                'status': status,
                'record': spf_record,
                'issues': issues,
                'dns_lookups': lookup_count
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'record': '',
                'issues': [f"Failed to query SPF record: {str(e)}"]
            }
    
    def _validate_spf_syntax(self, spf_record: str) -> bool:
        """Basic SPF syntax validation"""
        if not spf_record.startswith('v=spf1'):
            return False
        
        # Check for valid ending
        parts = spf_record.split()
        last_part = parts[-1] if parts else ''
        valid_endings = ['~all', '-all', '+all', '?all']
        
        return any(last_part == ending for ending in valid_endings)
    
    def _count_spf_dns_lookups(self, spf_record: str) -> int:
        """Count DNS lookups in SPF record"""
        lookup_mechanisms = ['include:', 'a:', 'mx:', 'exists:', 'redirect=']
        count = 0
        
        for mechanism in lookup_mechanisms:
            count += spf_record.lower().count(mechanism)
        
        # 'a' and 'mx' without domain also count
        parts = spf_record.split()
        for part in parts:
            if part.lower() in ['a', 'mx']:
                count += 1
        
        return count
    
    async def _check_txt_records(self) -> Dict[str, Any]:
        """Check all TXT records"""
        try:
            answers = self.resolver.resolve(self.domain, 'TXT')
            txt_records = []
            issues = []
            
            for rdata in answers:
                txt_value = str(rdata).strip('"')
                txt_records.append(txt_value)
            
            # Categorize TXT records
            categorized = {
                'spf': [],
                'dmarc': [],
                'dkim': [],
                'verification': [],
                'other': []
            }
            
            for record in txt_records:
                record_lower = record.lower()
                if record_lower.startswith('v=spf1'):
                    categorized['spf'].append(record)
                elif record_lower.startswith('v=dmarc1'):
                    categorized['dmarc'].append(record)
                elif 'dkim' in record_lower:
                    categorized['dkim'].append(record)
                elif any(x in record_lower for x in ['verification', 'verify', 'google', 'facebook', 'microsoft']):
                    categorized['verification'].append(record)
                else:
                    categorized['other'].append(record)
            
            return {
                'status': 'pass',
                'records': txt_records,
                'categorized': categorized,
                'issues': issues,
                'count': len(txt_records)
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'info',
                'records': [],
                'categorized': {},
                'issues': ["No TXT records found"],
                'count': 0
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'records': [],
                'issues': [f"Failed to query TXT records: {str(e)}"]
            }
    
    async def _check_cname_records(self) -> Dict[str, Any]:
        """Check CNAME records for common subdomains"""
        subdomains = ['www', 'mail', 'ftp', 'blog', 'shop']
        results = {}
        issues = []
        
        for subdomain in subdomains:
            hostname = f"{subdomain}.{self.domain}"
            results[subdomain] = await self._check_cname_for_host(hostname)
        
        # Check for CNAME at apex (not allowed)
        try:
            cname_answers = self.resolver.resolve(self.domain, 'CNAME')
            if cname_answers:
                issues.append("CNAME record found at zone apex (not allowed)")
        except:
            pass  # No CNAME at apex is correct
        
        return {
            'status': 'pass',
            'records': results,
            'issues': issues
        }
    
    async def _check_cname_for_host(self, hostname: str) -> Dict[str, Any]:
        """Check CNAME for a specific hostname"""
        try:
            answers = self.resolver.resolve(hostname, 'CNAME')
            cname_target = str(answers[0]).rstrip('.')
            
            # Check if target resolves
            target_resolves = False
            try:
                self.resolver.resolve(cname_target, 'A')
                target_resolves = True
            except:
                try:
                    self.resolver.resolve(cname_target, 'AAAA')
                    target_resolves = True
                except:
                    pass
            
            return {
                'status': 'pass' if target_resolves else 'warning',
                'target': cname_target,
                'resolves': target_resolves,
                'issues': [] if target_resolves else [f"CNAME target {cname_target} does not resolve"]
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'info',
                'target': '',
                'resolves': False,
                'issues': []
            }
        except Exception as e:
            return {
                'status': 'error',
                'target': '',
                'resolves': False,
                'issues': [f"Failed to query CNAME for {hostname}: {str(e)}"]
            }
    
    async def _check_ptr_records(self) -> Dict[str, Any]:
        """Check PTR (reverse DNS) records for MX servers"""
        # First get MX records
        mx_check = await self._check_mx_records()
        ptr_results = []
        issues = []
        
        if mx_check['status'] == 'error' or not mx_check['records']:
            return {
                'status': 'info',
                'records': [],
                'issues': ["No MX records to check PTR for"]
            }
        
        for mx_record in mx_check['records']:
            for ip_info in mx_record['ips']:
                if ip_info['type'] == 'A':  # Only check IPv4 for now
                    ip = ip_info['ip']
                    ptr_result = await self._check_ptr_for_ip(ip, mx_record['host'])
                    ptr_results.append({
                        'ip': ip,
                        'mx_host': mx_record['host'],
                        **ptr_result
                    })
        
        # Overall status
        failed_ptrs = [r for r in ptr_results if r['status'] == 'error']
        status = 'warning' if failed_ptrs else 'pass'
        
        if failed_ptrs:
            issues.append(f"{len(failed_ptrs)} MX servers missing PTR records")
        
        return {
            'status': status,
            'records': ptr_results,
            'issues': issues
        }
    
    async def _check_ptr_for_ip(self, ip: str, mx_host: str) -> Dict[str, Any]:
        """Check PTR record for a specific IP"""
        try:
            reverse_name = dns.reversename.from_address(ip)
            answers = self.resolver.resolve(reverse_name, 'PTR')
            
            ptr_value = str(answers[0]).rstrip('.')
            
            # Check if PTR matches MX host
            matches = ptr_value.lower() == mx_host.lower()
            
            return {
                'status': 'pass' if matches else 'warning',
                'ptr': ptr_value,
                'matches_mx': matches,
                'issues': [] if matches else [f"PTR {ptr_value} does not match MX host {mx_host}"]
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'ptr': '',
                'matches_mx': False,
                'issues': [f"No PTR record for {ip}: {str(e)}"]
            }
    
    # Advanced DNS checks
    async def _check_caa_records(self) -> Dict[str, Any]:
        """Check CAA (Certificate Authority Authorization) records"""
        try:
            answers = self.resolver.resolve(self.domain, 'CAA')
            
            # Simple check - if we get an answer, CAA records exist
            caa_records = []
            if answers:
                caa_records.append({
                    'record': str(answers[0]) if len(answers) > 0 else 'CAA record found',
                    'ttl': getattr(answers, 'ttl', 0)
                })
            
            return {
                'status': 'pass',
                'records': caa_records,
                'issues': ["CAA records found and configured"]
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'warning',
                'records': [],
                'issues': ["No CAA records found. Consider adding CAA records for enhanced SSL security."]
            }
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"CAA check failed: {str(e)}"]
            }
    
    async def _check_dmarc_record(self) -> Dict[str, Any]:
        """Check DMARC (Domain-based Message Authentication, Reporting & Conformance) record"""
        try:
            dmarc_domain = f"_dmarc.{self.domain}"
            answers = self.resolver.resolve(dmarc_domain, 'TXT')
            dmarc_record = None
            issues = []
            
            # Find DMARC record by checking the first answer
            if answers and len(answers) > 0:
                record_text = str(answers[0]).strip('"')
                if record_text.startswith('v=DMARC1'):
                    dmarc_record = record_text
            
            if not dmarc_record:
                return {
                    'status': 'warning',
                    'record': '',
                    'issues': ["No DMARC record found. Consider implementing DMARC for better email security."]
                }
            
            # Parse DMARC record
            dmarc_data = self._parse_dmarc_record(dmarc_record)
            
            # Validate DMARC settings
            policy = dmarc_data.get('p', 'none')
            
            if policy == 'none':
                issues.append("DMARC policy is set to 'none'. Consider using 'quarantine' or 'reject' for better security.")
                status = 'warning'
            elif policy in ['quarantine', 'reject']:
                status = 'pass'
            else:
                issues.append(f"Invalid DMARC policy: {policy}")
                status = 'error'
            
            # Check for reporting
            if 'rua' not in dmarc_data:
                issues.append("No aggregate reporting address (rua) configured.")
            
            return {
                'status': status,
                'record': dmarc_record,
                'parsed': dmarc_data,
                'issues': issues
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'warning',
                'record': '',
                'issues': ["No DMARC record found. Consider implementing DMARC for better email security."]
            }
        except Exception as e:
            return {
                'status': 'error',
                'record': '',
                'issues': [f"DMARC check failed: {str(e)}"]
            }
    
    def _parse_dmarc_record(self, record: str) -> Dict[str, str]:
        """Parse DMARC record into components"""
        dmarc_data = {}
        parts = record.split(';')
        
        for part in parts:
            part = part.strip()
            if '=' in part:
                key, value = part.split('=', 1)
                dmarc_data[key.strip()] = value.strip()
        
        return dmarc_data
    
    async def _check_dkim_records(self) -> Dict[str, Any]:
        """Check DKIM (DomainKeys Identified Mail) records"""
        try:
            # Common DKIM selectors to check
            common_selectors = [
                'default', 'selector1', 'selector2', 'google', 'k1', 's1', 's2',
                'dkim', 'mail', 'email', 'smtp', 'mx', 'key1', 'key2'
            ]
            
            dkim_records = []
            issues = []
            
            for selector in common_selectors:
                try:
                    dkim_domain = f"{selector}._domainkey.{self.domain}"
                    answers = self.resolver.resolve(dkim_domain, 'TXT')
                    
                    # Get the first answer (DKIM record)
                    if answers:
                        dkim_record = str(answers[0]).strip('"')
                        if 'k=' in dkim_record or 'p=' in dkim_record:
                            parsed_dkim = self._parse_dkim_record(dkim_record)
                            dkim_records.append({
                                'selector': selector,
                                'record': dkim_record,
                                'parsed': parsed_dkim
                            })
                except:
                    continue  # Selector not found, which is normal
            
            if not dkim_records:
                return {
                    'status': 'warning',
                    'records': [],
                    'issues': ["No DKIM records found. Consider implementing DKIM for better email authentication."]
                }
            
            # Validate DKIM records
            for dkim in dkim_records:
                parsed = dkim['parsed']
                if 'p' not in parsed or not parsed['p']:
                    issues.append(f"DKIM selector '{dkim['selector']}' is missing public key (p=)")
                if 'k' in parsed and parsed['k'] not in ['rsa', 'ed25519']:
                    issues.append(f"DKIM selector '{dkim['selector']}' uses unsupported key type: {parsed['k']}")
            
            status = 'pass' if not issues else 'warning'
            
            return {
                'status': status,
                'records': dkim_records,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"DKIM check failed: {str(e)}"]
            }
    
    def _parse_dkim_record(self, record: str) -> Dict[str, str]:
        """Parse DKIM record into components"""
        dkim_data = {}
        parts = record.split(';')
        
        for part in parts:
            part = part.strip()
            if '=' in part:
                key, value = part.split('=', 1)
                dkim_data[key.strip()] = value.strip()
        
        return dkim_data
    
    async def _check_glue_records(self) -> Dict[str, Any]:
        """Check glue records for nameservers"""
        try:
            # First get NS records
            ns_check = await self._check_ns_records()
            glue_info = []
            issues = []
            
            if ns_check['status'] == 'error':
                return {
                    'status': 'error',
                    'records': [],
                    'issues': ["Cannot check glue records: NS record check failed"]
                }
            
            # Check each nameserver for glue records
            for ns_record in ns_check.get('records', []):
                ns_host = ns_record['host']
                ns_ips = [ip_info['ip'] for ip_info in ns_record.get('ips', [])]
                
                # Check if nameserver is in the same domain
                if ns_host.endswith(f".{self.domain}") or ns_host == self.domain:
                    # This nameserver needs glue records
                    glue_needed = True
                    has_glue = len(ns_ips) > 0
                    
                    glue_info.append({
                        'nameserver': ns_host,
                        'needs_glue': glue_needed,
                        'has_glue': has_glue,
                        'glue_records': ns_ips
                    })
                    
                    if not has_glue:
                        issues.append(f"Nameserver {ns_host} needs glue records but none found")
                else:
                    # External nameserver, glue not required but helpful
                    glue_info.append({
                        'nameserver': ns_host,
                        'needs_glue': False,
                        'has_glue': len(ns_ips) > 0,
                        'glue_records': ns_ips
                    })
            
            # Determine overall status
            critical_issues = [info for info in glue_info if info['needs_glue'] and not info['has_glue']]
            
            if critical_issues:
                status = 'error'
            elif issues:
                status = 'warning'
            else:
                status = 'pass'
            
            return {
                'status': status,
                'records': glue_info,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"Glue records check failed: {str(e)}"]
            }
    
    async def _check_dnssec(self) -> Dict[str, Any]:
        """Check DNSSEC (DNS Security Extensions)"""
        try:
            dnssec_records = []
            issues = []
            
            # Check for DS records (at parent zone)
            try:
                ds_answers = self.resolver.resolve(self.domain, 'DS')
                if ds_answers and len(ds_answers) > 0:
                    ds_records = [{
                        'type': 'DS',
                        'record': str(ds_answers[0]),
                        'ttl': getattr(ds_answers, 'ttl', 0)
                    }]
                    dnssec_records.extend(ds_records)
                    issues.append("DS records found at parent zone")
                
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                issues.append("No DS records found at parent zone")
            
            # Check for DNSKEY records
            try:
                dnskey_answers = self.resolver.resolve(self.domain, 'DNSKEY')
                if dnskey_answers and len(dnskey_answers) > 0:
                    dnskey_records = [{
                        'type': 'DNSKEY',
                        'record': str(dnskey_answers[0]),
                        'ttl': getattr(dnskey_answers, 'ttl', 0)
                    }]
                    dnssec_records.extend(dnskey_records)
                    issues.append("DNSKEY records found")
                
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                issues.append("No DNSKEY records found")
            
            # Check for RRSIG records
            try:
                rrsig_answers = self.resolver.resolve(self.domain, 'RRSIG')
                if rrsig_answers and len(rrsig_answers) > 0:
                    rrsig_count = len(rrsig_answers)
                    issues.append(f"Found {rrsig_count} RRSIG records")
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
                issues.append("No RRSIG records found")
            
            # Determine status
            if not dnssec_records:
                status = 'warning'
                issues.append("DNSSEC is not configured for this domain")
            else:
                status = 'pass'
                issues.append("DNSSEC appears to be configured")
            
            return {
                'status': status,
                'records': dnssec_records,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"DNSSEC check failed: {str(e)}"]
            }
    
    async def _check_axfr(self) -> Dict[str, Any]:
        """Check AXFR (zone transfer) vulnerability"""
        try:
            # Get nameservers to test
            ns_check = await self._check_ns_records()
            if ns_check['status'] == 'error':
                return {
                    'status': 'error',
                    'open': False,
                    'issues': ["Cannot check AXFR: NS record check failed"]
                }
            
            vulnerable_servers = []
            issues = []
            
            # Test each nameserver for zone transfer
            for ns_record in ns_check.get('records', []):
                for ip_info in ns_record.get('ips', []):
                    ip = ip_info['ip']
                    try:
                        # Attempt zone transfer
                        zone = dns.zone.from_xfr(dns.query.xfr(ip, self.domain, timeout=5))
                        if zone:
                            vulnerable_servers.append({
                                'nameserver': ns_record['host'],
                                'ip': ip,
                                'vulnerable': True
                            })
                            issues.append(f"Zone transfer allowed from {ns_record['host']} ({ip})")
                    except Exception:
                        # Zone transfer rejected (good)
                        vulnerable_servers.append({
                            'nameserver': ns_record['host'],
                            'ip': ip,
                            'vulnerable': False
                        })
            
            # Determine status
            if any(server['vulnerable'] for server in vulnerable_servers):
                status = 'error'
                issues.insert(0, "Zone transfer vulnerability detected! This allows unauthorized access to DNS records.")
            else:
                status = 'pass'
                issues.append("Zone transfers are properly restricted on all nameservers.")
            
            return {
                'status': status,
                'open': any(server['vulnerable'] for server in vulnerable_servers),
                'servers': vulnerable_servers,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'open': False,
                'issues': [f"AXFR check failed: {str(e)}"]
            }
    
    async def _check_wildcard(self) -> Dict[str, Any]:
        """Check wildcard DNS records"""
        try:
            wildcard_tests = []
            issues = []
            
            # Test common wildcard patterns
            test_subdomains = [
                f"randomtest123.{self.domain}",
                f"nonexistent-subdomain.{self.domain}",
                f"*.{self.domain}",
                f"test-wildcard.{self.domain}"
            ]
            
            wildcard_found = False
            
            for subdomain in test_subdomains:
                try:
                    # Test A record
                    try:
                        a_answers = self.resolver.resolve(subdomain, 'A')
                        if a_answers:
                            wildcard_tests.append({
                                'subdomain': subdomain,
                                'type': 'A',
                                'has_record': True,
                                'value': str(a_answers[0])
                            })
                            wildcard_found = True
                    except:
                        wildcard_tests.append({
                            'subdomain': subdomain,
                            'type': 'A',
                            'has_record': False,
                            'value': None
                        })
                    
                    # Test AAAA record
                    try:
                        aaaa_answers = self.resolver.resolve(subdomain, 'AAAA')
                        if aaaa_answers:
                            wildcard_tests.append({
                                'subdomain': subdomain,
                                'type': 'AAAA',
                                'has_record': True,
                                'value': str(aaaa_answers[0])
                            })
                            wildcard_found = True
                    except:
                        wildcard_tests.append({
                            'subdomain': subdomain,
                            'type': 'AAAA',
                            'has_record': False,
                            'value': None
                        })
                        
                except Exception as e:
                    wildcard_tests.append({
                        'subdomain': subdomain,
                        'type': 'error',
                        'has_record': False,
                        'value': str(e)
                    })
            
            # Analyze results
            if wildcard_found:
                issues.append("Wildcard DNS records detected. This means any subdomain will resolve.")
                issues.append("This can be useful for catch-all setups but may have security implications.")
                status = 'warning'
            else:
                issues.append("No wildcard DNS records detected.")
                status = 'pass'
            
            return {
                'status': status,
                'records': wildcard_tests,
                'has_wildcard': wildcard_found,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'records': [],
                'issues': [f"Wildcard check failed: {str(e)}"]
            }

    async def _check_www_records(self) -> Dict[str, Any]:
        """Check WWW subdomain with CNAME to A record chain and IP validation"""
        www_domain = f"www.{self.domain}"
        
        try:
            # Step 1: Check if www has CNAME record
            cname_result = await self._check_www_cname(www_domain)
            
            # Step 2: Get final A records (either direct or through CNAME chain)
            a_result = await self._check_www_a_records(www_domain, cname_result)
            
            # Step 3: Check if IPs are public
            ip_check_result = self._check_www_ip_public(a_result)
            
            # Determine overall status
            status = 'pass'
            if cname_result['status'] == 'error' and a_result['status'] == 'error':
                status = 'error'
            elif ip_check_result['status'] in ['warning', 'error']:
                status = ip_check_result['status']
            
            return {
                'status': status,
                'checks': [
                    {
                        'type': 'www_a_record',
                        'status': 'info',
                        'message': self._format_www_a_record_message(cname_result, a_result),
                        'details': {
                            'cname_chain': cname_result.get('cname_chain', []),
                            'final_ips': a_result.get('ips', [])
                        }
                    },
                    {
                        'type': 'www_ip_public',
                        'status': ip_check_result['status'],
                        'message': ip_check_result['message'],
                        'details': ip_check_result.get('details', {})
                    },
                    {
                        'type': 'www_cname',
                        'status': cname_result['status'],
                        'message': cname_result['message'],
                        'details': cname_result.get('details', {})
                    }
                ]
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'checks': [{
                    'type': 'www_check',
                    'status': 'error',
                    'message': f"WWW check failed: {str(e)}",
                    'details': {}
                }]
            }

    async def _check_www_cname(self, www_domain: str) -> Dict[str, Any]:
        """Check CNAME record for www subdomain"""
        try:
            cname_answers = self.resolver.resolve(www_domain, 'CNAME')
            cname_target = str(cname_answers[0]).rstrip('.')
            
            # Build CNAME chain
            cname_chain = [{'from': www_domain, 'to': cname_target}]
            
            # Follow CNAME chain to final destination
            current_target = cname_target
            max_depth = 10  # Prevent infinite loops
            depth = 0
            
            while depth < max_depth:
                try:
                    further_cname = self.resolver.resolve(current_target, 'CNAME')
                    next_target = str(further_cname[0]).rstrip('.')
                    cname_chain.append({'from': current_target, 'to': next_target})
                    current_target = next_target
                    depth += 1
                except:
                    break  # No more CNAMEs, reached final destination
            
            # Check if final target has A records
            final_target = current_target
            has_a_records = False
            try:
                self.resolver.resolve(final_target, 'A')
                has_a_records = True
            except:
                pass
            
            if has_a_records:
                return {
                    'status': 'pass',
                    'message': f"OK. You do have a CNAME record for {www_domain}.Your CNAME entry also returns the A record for the CNAME entry, which is good.",
                    'cname_chain': cname_chain,
                    'final_target': final_target,
                    'details': {
                        'has_cname': True,
                        'cname_resolves': True
                    }
                }
            else:
                return {
                    'status': 'warning',
                    'message': f"Warning. CNAME record exists for {www_domain} but final target {final_target} doesn't have A records.",
                    'cname_chain': cname_chain,
                    'final_target': final_target,
                    'details': {
                        'has_cname': True,
                        'cname_resolves': False
                    }
                }
                
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            # No CNAME, check if it has direct A records
            return {
                'status': 'info',
                'message': f"No CNAME record found for {www_domain}",
                'cname_chain': [],
                'final_target': www_domain,
                'details': {
                    'has_cname': False,
                    'cname_resolves': False
                }
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Failed to check CNAME for {www_domain}: {str(e)}",
                'cname_chain': [],
                'final_target': www_domain,
                'details': {
                    'has_cname': False,
                    'cname_resolves': False
                }
            }

    async def _check_www_a_records(self, www_domain: str, cname_result: Dict[str, Any]) -> Dict[str, Any]:
        """Get A records for www domain (following CNAME chain if present)"""
        try:
            # Determine what hostname to query for A records
            final_target = cname_result.get('final_target', www_domain)
            
            # Get A records
            a_answers = self.resolver.resolve(final_target, 'A')
            ips = [str(rdata) for rdata in a_answers]
            
            return {
                'status': 'pass' if ips else 'error',
                'ips': ips,
                'final_target': final_target
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'error',
                'ips': [],
                'final_target': cname_result.get('final_target', www_domain)
            }
        except Exception as e:
            return {
                'status': 'error',
                'ips': [],
                'final_target': cname_result.get('final_target', www_domain),
                'error': str(e)
            }

    def _check_www_ip_public(self, a_result: Dict[str, Any]) -> Dict[str, Any]:
        """Check if WWW IPs are public"""
        ips = a_result.get('ips', [])
        
        if not ips:
            return {
                'status': 'error',
                'message': 'No IPs found for WWW subdomain',
                'details': {}
            }
        
        public_ips = []
        private_ips = []
        
        for ip in ips:
            try:
                ip_obj = ipaddress.IPv4Address(ip)
                if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_loopback:
                    private_ips.append(ip)
                else:
                    public_ips.append(ip)
            except:
                private_ips.append(ip)  # Invalid IP treated as private
        
        if len(public_ips) == len(ips):
            return {
                'status': 'pass',
                'message': 'OK. All of your WWW IPs appear to be public IPs.',
                'details': {
                    'public_ips': public_ips,
                    'private_ips': private_ips
                }
            }
        elif public_ips:
            return {
                'status': 'warning',
                'message': f'Warning. Some WWW IPs are private/reserved: {", ".join(private_ips)}',
                'details': {
                    'public_ips': public_ips,
                    'private_ips': private_ips
                }
            }
        else:
            return {
                'status': 'error',
                'message': f'Error. All WWW IPs are private/reserved: {", ".join(private_ips)}',
                'details': {
                    'public_ips': public_ips,
                    'private_ips': private_ips
                }
            }

    def _format_www_a_record_message(self, cname_result: Dict[str, Any], a_result: Dict[str, Any]) -> str:
        """Format the WWW A record message to match the desired output format"""
        www_domain = f"www.{self.domain}"
        final_ips = a_result.get('ips', [])
        cname_chain = cname_result.get('cname_chain', [])
        
        if not final_ips:
            return f"Your {www_domain} A record is: No A records found"
        
        # Build the chain display
        message = f"Your {www_domain} A record is:<br>"
        
        if cname_chain:
            # Show CNAME chain
            for i, link in enumerate(cname_chain):
                if i == 0:
                    message += f"{link['from']} -&gt; "
                message += f"{link['to']}"
                if i < len(cname_chain) - 1:
                    message += " -&gt; "
            
            message += " -&gt; "
        else:
            message += f"{www_domain} -&gt; "
        
        # Add IPs
        message += "[ "
        message += "&nbsp;&nbsp;".join(final_ips)
        message += " ]"
        
        if cname_chain:
            message += "<br><br> [Looks like you have CNAME's]"
        
        return message

    def _compare_ns_records(self, parent_result, domain_result):
        """Compare parent delegation with domain NS records"""
        try:
            parent_records = set(parent_result.get("records", []))
            domain_records = set(domain_result.get("records", []))
            
            match = parent_records == domain_records
            only_in_parent = parent_records - domain_records
            only_in_domain = domain_records - parent_records
            
            return {
                "match": match,
                "parent_count": len(parent_records),
                "domain_count": len(domain_records),
                "only_in_parent": list(only_in_parent),
                "only_in_domain": list(only_in_domain),
                "intersection": list(parent_records & domain_records)
            }
        except Exception as e:
            return {"match": False, "error": str(e)}

    def _generate_ns_checks(self, parent_result, domain_result, comparison_result):
        """Generate intoDNS-style check results"""
        checks = []
        
        # Parent delegation check
        if parent_result.get("status") == "pass":
            checks.append({
                "type": "parent_delegation",
                "status": "pass",
                "message": f"Found {len(parent_result.get('records', []))} NS records from TLD delegation",
                "details": parent_result.get("records", []),
                "server_used": parent_result.get("tld_server_used")
            })
        else:
            checks.append({
                "type": "parent_delegation", 
                "status": "error",
                "message": f"Failed to get parent delegation: {parent_result.get('error', 'Unknown error')}",
                "details": []
            })
        
        # Domain nameservers check
        if domain_result.get("status") == "pass":
            checks.append({
                "type": "domain_nameservers",
                "status": "pass", 
                "message": f"Found {len(domain_result.get('records', []))} NS records from domain query",
                "details": domain_result.get("records", []),
                "resolver_used": domain_result.get("resolver_used")
            })
        else:
            checks.append({
                "type": "domain_nameservers",
                "status": "error",
                "message": f"Failed to get domain NS records: {domain_result.get('error', 'Unknown error')}",
                "details": []
            })
        
        # Comparison check
        if comparison_result.get("match"):
            checks.append({
                "type": "comparison",
                "status": "pass",
                "message": "Parent delegation and domain NS records match",
                "details": comparison_result
            })
        elif "error" not in comparison_result:
            checks.append({
                "type": "comparison",
                "status": "error",
                "message": "Parent delegation and domain NS records differ",
                "details": comparison_result
            })
            
            # Add separate checks for missing nameservers like IntoDNS
            if comparison_result.get("only_in_parent") and len(comparison_result["only_in_parent"]) > 0:
                checks.append({
                    "type": "missing_at_domain",
                    "status": "error",
                    "message": "Missing nameservers reported by your nameservers",
                    "details": comparison_result["only_in_parent"]
                })
            
            if comparison_result.get("only_in_domain") and len(comparison_result["only_in_domain"]) > 0:
                checks.append({
                    "type": "missing_at_parent",
                    "status": "error",
                    "message": "Missing nameservers reported by parent",
                    "details": comparison_result["only_in_domain"]
                })
        
        return checks

    async def _check_domain_status(self) -> Dict[str, Any]:
        """
        Comprehensive domain status checker using DNS-based techniques
        Detects suspended, expired, parked, or problematic domains without WHOIS
        """
        print(f"Checking domain status for {self.domain}")
        
        status_checks = {
            'ns_resolution': await self._check_ns_resolution_status(),
            'authoritative_response': await self._check_authoritative_response(),
            'suspicious_patterns': await self._check_suspicious_dns_patterns(),
            'parking_detection': await self._check_domain_parking(),
            'error_responses': await self._check_dns_error_patterns(),
        }
        
        # Determine overall domain status
        critical_issues = []
        warnings = []
        info_items = []
        
        # Analyze results
        if status_checks['ns_resolution']['status'] == 'error':
            critical_issues.append("Domain NS records not resolving - domain may be suspended/expired")
            
        if status_checks['authoritative_response']['status'] == 'error':
            critical_issues.append("No authoritative DNS response - domain configuration issue")
            
        if status_checks['suspicious_patterns']['status'] == 'warning':
            warnings.extend(status_checks['suspicious_patterns']['issues'])
            
        if status_checks['parking_detection']['status'] == 'warning':
            warnings.append("Domain appears to be parked or suspended")
            
        if status_checks['error_responses']['status'] == 'warning':
            warnings.extend(status_checks['error_responses']['issues'])
            
        # Determine overall status
        if critical_issues:
            overall_status = 'error'
            main_message = f"DOMAIN ISSUE DETECTED: {critical_issues[0]}"
        elif warnings:
            overall_status = 'warning'  
            main_message = f"POTENTIAL ISSUES: {', '.join(warnings[:2])}"
        else:
            overall_status = 'pass'
            main_message = "✅ Domain appears to be properly configured and active"
            
        return {
            'status': overall_status,
            'message': main_message,
            'detailed_checks': status_checks,
            'critical_issues': critical_issues,
            'warnings': warnings,
            'recommendations': self._get_domain_status_recommendations(critical_issues, warnings)
        }

    async def _check_ns_resolution_status(self) -> Dict[str, Any]:
        """Check if NS records resolve and respond"""
        try:
            # Try to get NS records
            ns_response = self.resolver.resolve(self.domain, 'NS')
            ns_servers = [str(ns) for ns in ns_response]
            
            if not ns_servers:
                return {
                    'status': 'error',
                    'message': 'No NS records found - domain may be expired/suspended',
                    'details': []
                }
                
            # Test each nameserver
            working_ns = []
            failed_ns = []
            
            for ns_server in ns_servers:
                try:
                    # Create resolver for this specific nameserver
                    test_resolver = dns.resolver.Resolver()
                    test_resolver.nameservers = [str(dns.resolver.resolve(ns_server, 'A')[0])]
                    test_resolver.timeout = 5
                    
                    # Try to query SOA from this nameserver
                    test_resolver.resolve(self.domain, 'SOA')
                    working_ns.append(ns_server)
                    
                except Exception as e:
                    failed_ns.append({'ns': ns_server, 'error': str(e)})
            
            if not working_ns:
                return {
                    'status': 'error',
                    'message': 'No nameservers responding - domain likely suspended/expired',
                    'details': {'failed_ns': failed_ns}
                }
            elif failed_ns:
                return {
                    'status': 'warning',
                    'message': f'{len(failed_ns)} nameservers not responding',
                    'details': {'working_ns': working_ns, 'failed_ns': failed_ns}
                }
            else:
                return {
                    'status': 'pass',
                    'message': f'All {len(working_ns)} nameservers responding',
                    'details': {'working_ns': working_ns}
                }
                
        except dns.resolver.NXDOMAIN:
            return {
                'status': 'error',
                'message': 'Domain does not exist (NXDOMAIN) - may be expired or invalid',
                'details': {'error_type': 'NXDOMAIN'}
            }
        except dns.resolver.NoAnswer:
            return {
                'status': 'error',
                'message': 'No NS records found - domain configuration issue',
                'details': {'error_type': 'NoAnswer'}
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'NS resolution failed: {str(e)}',
                'details': {'error': str(e)}
            }

    async def _check_authoritative_response(self) -> Dict[str, Any]:
        """Check if domain gives authoritative responses"""
        try:
            # Query SOA record which should always exist for valid domains
            soa_response = self.resolver.resolve(self.domain, 'SOA')
            soa_record = soa_response[0]
            
            # Check if response is authoritative
            is_authoritative = soa_response.response.flags & dns.flags.AA
            
            if not is_authoritative:
                return {
                    'status': 'warning',
                    'message': 'DNS responses not authoritative - possible configuration issue',
                    'details': {'soa': str(soa_record), 'authoritative': False}
                }
            else:
                return {
                    'status': 'pass',
                    'message': 'Authoritative DNS responses working',
                    'details': {'soa': str(soa_record), 'authoritative': True}
                }
                
        except dns.resolver.NXDOMAIN:
            return {
                'status': 'error',
                'message': 'Domain does not exist - likely expired or suspended',
                'details': {'error_type': 'NXDOMAIN'}
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Authoritative query failed: {str(e)}',
                'details': {'error': str(e)}
            }

    async def _check_suspicious_dns_patterns(self) -> Dict[str, Any]:
        """Detect suspicious DNS patterns that indicate problems"""
        issues = []
        details = {}
        
        try:
            # Check for single A record pointing to common parking/suspension IPs
            a_records = self.resolver.resolve(self.domain, 'A')
            a_ips = [str(record) for record in a_records]
            
            # Common parking/suspension IP ranges and specific IPs
            suspicious_ips = [
                '127.0.0.1',  # Localhost (suspicious for domains)
                '0.0.0.0',    # Null route
                '192.0.2.',   # Documentation range
                '198.51.100.',# Documentation range  
                '203.0.113.', # Documentation range
                '10.',        # Private range (suspicious for public domains)
                '172.16.',    # Private range
                '192.168.',   # Private range
                '69.46.86.',  # Known parking service
                '69.46.84.',  # Known parking service
                '98.124.',    # Common suspension page
            ]
            
            for ip in a_ips:
                for suspicious in suspicious_ips:
                    if ip.startswith(suspicious):
                        issues.append(f"A record points to suspicious IP: {ip}")
                        
            details['a_records'] = a_ips
            
            # Check for suspicious MX patterns
            try:
                mx_records = self.resolver.resolve(self.domain, 'MX')
                mx_hosts = [str(record.exchange) for record in mx_records]
                
                # Suspicious MX patterns
                for mx in mx_hosts:
                    if 'parking' in mx.lower() or 'suspended' in mx.lower():
                        issues.append(f"Suspicious MX record: {mx}")
                        
                details['mx_records'] = mx_hosts
            except:
                pass
                
            # Check for wildcard A records (often used by parking services)
            try:
                test_subdomain = f"nonexistent-{random.randint(1000,9999)}.{self.domain}"
                wildcard_response = self.resolver.resolve(test_subdomain, 'A')
                if wildcard_response:
                    issues.append("Wildcard A record detected - often indicates parking/suspension")
                    details['wildcard_detected'] = True
            except:
                details['wildcard_detected'] = False
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Pattern analysis failed: {str(e)}',
                'details': {'error': str(e)}
            }
        
        if issues:
            return {
                'status': 'warning',
                'message': f'Suspicious DNS patterns detected: {len(issues)} issues',
                'issues': issues,
                'details': details
            }
        else:
            return {
                'status': 'pass',
                'message': 'No suspicious DNS patterns detected',
                'details': details
            }

    async def _check_domain_parking(self) -> Dict[str, Any]:
        """Check for domain parking indicators"""
        parking_indicators = []
        
        try:
            # Check TXT records for parking service indicators
            txt_records = self.resolver.resolve(self.domain, 'TXT')
            for txt in txt_records:
                txt_content = str(txt).lower()
                if any(keyword in txt_content for keyword in ['parked', 'suspended', 'expired', 'parking']):
                    parking_indicators.append(f"Parking indicator in TXT: {str(txt)}")
                    
        except:
            pass
        
        try:
            # Check for NS records pointing to known parking services
            ns_records = self.resolver.resolve(self.domain, 'NS')
            parking_ns_patterns = [
                'parkingcrew',
                'sedoparking', 
                'domainparking',
                'parking.com',
                'suspended',
                'expired'
            ]
            
            for ns in ns_records:
                ns_str = str(ns).lower()
                for pattern in parking_ns_patterns:
                    if pattern in ns_str:
                        parking_indicators.append(f"Parking NS detected: {str(ns)}")
                        
        except:
            pass
            
        if parking_indicators:
            return {
                'status': 'warning',
                'message': 'Domain parking detected',
                'indicators': parking_indicators
            }
        else:
            return {
                'status': 'pass', 
                'message': 'No parking indicators detected',
                'indicators': []
            }

    async def _check_dns_error_patterns(self) -> Dict[str, Any]:
        """Check for DNS error patterns that indicate domain issues"""
        error_patterns = []
        
        # Test basic record types that should exist for active domains
        record_tests = {
            'A': 'No A records - domain may not be configured',
            'NS': 'No NS records - critical domain configuration issue', 
            'SOA': 'No SOA record - domain authority issue'
        }
        
        for record_type, error_msg in record_tests.items():
            try:
                self.resolver.resolve(self.domain, record_type)
            except dns.resolver.NXDOMAIN:
                error_patterns.append(f"NXDOMAIN for {record_type} - domain may be expired")
            except dns.resolver.NoAnswer:
                error_patterns.append(f"No {record_type} records - {error_msg}")
            except dns.resolver.Timeout:
                error_patterns.append(f"Timeout on {record_type} query - DNS server issues")
            except Exception as e:
                if 'SERVFAIL' in str(e):
                    error_patterns.append(f"SERVFAIL for {record_type} - authoritative server error")
                    
        if error_patterns:
            return {
                'status': 'warning',
                'message': f'DNS errors detected: {len(error_patterns)} issues',
                'issues': error_patterns
            }
        else:
            return {
                'status': 'pass',
                'message': 'No DNS error patterns detected',
                'issues': []
            }

    def _get_domain_status_recommendations(self, critical_issues: List[str], warnings: List[str]) -> List[str]:
        """Get recommendations based on domain status issues"""
        recommendations = []
        
        if any('expired' in issue.lower() or 'suspended' in issue.lower() for issue in critical_issues + warnings):
            recommendations.extend([
                "Check domain registration status with your registrar",
                "Verify domain renewal payments are up to date",
                "Contact your domain registrar if domain appears suspended"
            ])
            
        if any('ns' in issue.lower() for issue in critical_issues + warnings):
            recommendations.extend([
                "Verify nameserver configuration with your DNS provider",
                "Check if DNS hosting service is active and paid",
                "Test DNS propagation across different locations"
            ])
            
        if any('parking' in issue.lower() for issue in warnings):
            recommendations.extend([
                "Configure proper web hosting if domain should be active",
                "Remove parking service if no longer needed",
                "Set up proper A records pointing to your hosting"
            ])
            
        if any('timeout' in issue.lower() or 'servfail' in issue.lower() for issue in warnings):
            recommendations.extend([
                "DNS server performance issues detected",
                "Try switching to different DNS provider",
                "Contact DNS hosting provider about server issues"
            ])
            
        if not recommendations:
            recommendations = [
                "Domain appears healthy - no immediate action needed",
                "Monitor DNS performance regularly",
                "Consider implementing DNSSEC for security"
            ]
            
        return recommendations
