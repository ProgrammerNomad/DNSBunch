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
from datetime import datetime
from typing import Dict, List, Any, Optional

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
            'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname', 
            'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
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
                
                if check_type == 'ns':
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
                        "details": f"ERROR: One or more of the nameservers listed at the parent servers are not listed as NS records at your nameservers. The problem NS records are: {', '.join(parent_records - domain_records)}"
                    })
                
                if domain_records - parent_records:
                    checks.append({
                        "type": "missing_at_parent",
                        "status": "error",
                        "message": "Missing nameservers reported by parent", 
                        "details": f"FAIL: The following nameservers are listed at your nameservers as nameservers for your domain, but are not listed at the parent nameservers. You need to make sure that these nameservers are working: {', '.join(domain_records - parent_records)}"
                    })
            
            # Build final result with frontend-compatible record structure
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

    async def _check_soa_record(self) -> Dict[str, Any]:
        """Check SOA (Start of Authority) record"""
        try:
            answers = self.resolver.resolve(self.domain, 'SOA')
            issues = []
            
            if len(answers) != 1:
                issues.append(f"Expected 1 SOA record, found {len(answers)}")
            
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
            
            # Validate SOA timings
            if soa.refresh < 3600:
                issues.append("Refresh interval too low (< 1 hour)")
            if soa.retry < 1800:
                issues.append("Retry interval too low (< 30 minutes)")
            if soa.expire < 604800:
                issues.append("Expire time too low (< 1 week)")
            if soa.minimum < 300:
                issues.append("Minimum TTL too low (< 5 minutes)")
            
            status = 'pass' if not issues else 'warning'
            
            return {
                'status': status,
                'record': soa_data,
                'issues': issues
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'record': {},
                'issues': [f"Failed to query SOA record: {str(e)}"]
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
        """Check MX (Mail Exchange) records"""
        try:
            answers = self.resolver.resolve(self.domain, 'MX')
            mx_records = []
            issues = []
            
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
                    
                    # Check if MX points to CNAME (should not)
                    try:
                        cname_answers = self.resolver.resolve(mx_host, 'CNAME')
                        if cname_answers:
                            issues.append(f"MX {mx_host} points to CNAME (RFC violation)")
                    except:
                        pass  # No CNAME is good
                        
                    if not mx_info['ips']:
                        issues.append(f"MX {mx_host} does not resolve to any IP")
                        
                except Exception as e:
                    issues.append(f"Failed to resolve MX {mx_host}: {str(e)}")
                
                mx_records.append(mx_info)
            
            # Sort by priority
            mx_records.sort(key=lambda x: x['priority'])
            
            # Check for duplicate priorities
            priorities = [mx['priority'] for mx in mx_records]
            if len(priorities) != len(set(priorities)):
                issues.append("Duplicate MX priorities found")
            
            status = 'pass' if mx_records and not issues else 'warning' if mx_records else 'info'
            
            return {
                'status': status,
                'records': mx_records,
                'issues': issues,
                'count': len(mx_records)
            }
            
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {
                'status': 'info',
                'records': [],
                'issues': ["No MX records found - email not configured"],
                'count': 0
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'records': [],
                'issues': [f"Failed to query MX records: {str(e)}"]
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
                "status": "warning",
                "message": "Parent delegation and domain NS records differ",
                "details": comparison_result
            })
        
        return checks
