import dns.resolver
import dns.query
import dns.zone
import dns.rdatatype
import dns.reversename
import asyncio
import logging
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
import socket
import ipaddress

logger = logging.getLogger(__name__)

class DNSChecker:
    """
    Comprehensive DNS checker that performs all DNS record validations
    as specified in the DNSBunch requirements.
    """
    
    def __init__(self, domain: str):
        self.domain = domain.lower().strip()
        self.results = {}
        self.resolver = dns.resolver.Resolver()
        self.resolver.timeout = 10
        self.resolver.lifetime = 30
        
    async def run_all_checks(self, requested_checks: List[str] = None) -> Dict[str, Any]:
        """Run all DNS checks for the domain"""
        
        if requested_checks is None or 'all' in requested_checks:
            checks_to_run = [
                'ns', 'soa', 'a', 'aaaa', 'mx', 'spf', 'txt', 'cname',
                'ptr', 'caa', 'dmarc', 'dkim', 'glue', 'dnssec', 'axfr', 'wildcard'
            ]
        else:
            checks_to_run = requested_checks
        
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'checks': {},
            'summary': {'total': 0, 'passed': 0, 'warnings': 0, 'errors': 0}
        }
        
        # Run each check
        for check_type in checks_to_run:
            try:
                logger.info(f"Running {check_type} check for {self.domain}")
                
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
                    results['checks']['wildcard'] = await self._check_wildcard()
                    
            except Exception as e:
                logger.error(f"Error in {check_type} check: {str(e)}")
                results['checks'][check_type] = {
                    'status': 'error',
                    'error': str(e),
                    'records': [],
                    'issues': [f"Failed to perform {check_type} check: {str(e)}"]
                }
        
        # Calculate summary
        self._calculate_summary(results)
        
        return results
    
    async def _check_ns_records(self) -> Dict[str, Any]:
        """Check NS (Nameserver) records"""
        try:
            answers = self.resolver.resolve(self.domain, 'NS')
            ns_records = []
            issues = []
            
            for rdata in answers:
                ns_host = str(rdata).rstrip('.')
                ns_info = {'host': ns_host, 'ips': []}
                
                # Resolve NS to IPs
                try:
                    # IPv4
                    try:
                        a_answers = self.resolver.resolve(ns_host, 'A')
                        for a_rdata in a_answers:
                            ns_info['ips'].append({'type': 'A', 'ip': str(a_rdata)})
                    except:
                        pass
                    
                    # IPv6
                    try:
                        aaaa_answers = self.resolver.resolve(ns_host, 'AAAA')
                        for aaaa_rdata in aaaa_answers:
                            ns_info['ips'].append({'type': 'AAAA', 'ip': str(aaaa_rdata)})
                    except:
                        pass
                        
                    if not ns_info['ips']:
                        issues.append(f"Nameserver {ns_host} does not resolve to any IP")
                        
                except Exception as e:
                    issues.append(f"Failed to resolve nameserver {ns_host}: {str(e)}")
                
                ns_records.append(ns_info)
            
            # Validations
            if len(ns_records) < 2:
                issues.append("Less than 2 nameservers found - single point of failure")
            
            # Check for duplicates
            ns_hosts = [ns['host'] for ns in ns_records]
            if len(ns_hosts) != len(set(ns_hosts)):
                issues.append("Duplicate nameserver entries found")
            
            status = 'pass' if not issues else 'warning' if len(issues) <= 2 else 'error'
            
            return {
                'status': status,
                'records': ns_records,
                'issues': issues,
                'count': len(ns_records)
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'records': [],
                'issues': [f"Failed to query NS records: {str(e)}"]
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
    
    # Placeholder methods for remaining checks
    async def _check_caa_records(self) -> Dict[str, Any]:
        """Check CAA records - placeholder"""
        return {'status': 'info', 'records': [], 'issues': ["CAA check not implemented yet"]}
    
    async def _check_dmarc_record(self) -> Dict[str, Any]:
        """Check DMARC record - placeholder"""
        return {'status': 'info', 'record': '', 'issues': ["DMARC check not implemented yet"]}
    
    async def _check_dkim_records(self) -> Dict[str, Any]:
        """Check DKIM records - placeholder"""
        return {'status': 'info', 'records': [], 'issues': ["DKIM check not implemented yet"]}
    
    async def _check_glue_records(self) -> Dict[str, Any]:
        """Check glue records - placeholder"""
        return {'status': 'info', 'records': [], 'issues': ["Glue records check not implemented yet"]}
    
    async def _check_dnssec(self) -> Dict[str, Any]:
        """Check DNSSEC - placeholder"""
        return {'status': 'info', 'records': [], 'issues': ["DNSSEC check not implemented yet"]}
    
    async def _check_axfr(self) -> Dict[str, Any]:
        """Check AXFR (zone transfer) - placeholder"""
        return {'status': 'info', 'open': False, 'issues': ["AXFR check not implemented yet"]}
    
    async def _check_wildcard(self) -> Dict[str, Any]:
        """Check wildcard records - placeholder"""
        return {'status': 'info', 'records': [], 'issues': ["Wildcard check not implemented yet"]}
    
    def _calculate_summary(self, results: Dict[str, Any]) -> None:
        """Calculate summary statistics"""
        summary = {'total': 0, 'passed': 0, 'warnings': 0, 'errors': 0, 'info': 0}
        
        for check_name, check_result in results['checks'].items():
            summary['total'] += 1
            status = check_result.get('status', 'unknown')
            
            if status == 'pass':
                summary['passed'] += 1
            elif status == 'warning':
                summary['warnings'] += 1
            elif status == 'error':
                summary['errors'] += 1
            elif status == 'info':
                summary['info'] += 1
        
        results['summary'] = summary
