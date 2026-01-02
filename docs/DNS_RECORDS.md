# DNS Record Types - Detailed Documentation

This document provides comprehensive information about all DNS record types checked by DNSBunch.

---

## 1. Domain Health Check

- **Information Returned:** Overall domain health assessment, DNS resolution status, authoritative response validation, suspicious pattern detection, parking/suspension indicators, detailed technical diagnostics.
- **Checks:** Nameserver resolution capability, authoritative DNS responses, domain suspension/expiration detection, parking service identification, DNS error pattern analysis, critical infrastructure validation.
- **Validations:** Domain accessibility verification, DNS configuration integrity, suspension/hold status detection, expired domain identification, parking service recognition, DNS server responsiveness.
- **Critical Issues Detected:** 
  - **Domain Suspended/Expired:** Identifies domains with clientHold status, expired registrations, or suspended services
  - **DNS Resolution Failure:** Detects NXDOMAIN responses, failed nameserver queries, and configuration issues  
  - **Authoritative Response Problems:** Identifies non-responsive or misconfigured authoritative servers
- **Recommendations Provided:** Domain registrar contact guidance, DNS provider troubleshooting steps, configuration fix suggestions, renewal payment verification steps.

---

## 2. NS (Nameserver) Records

- **Information Returned:** All authoritative nameservers for the domain, IPv4/IPv6 addresses, geolocation data, TTL values, response times.
- **Checks:** Valid IPs, reachability test, no duplicates, parent/child delegation consistency, geographical distribution, no single point of failure, authoritative response validation, recursive query handling.
- **Validations:** Nameserver accessibility, IP address validity, delegation consistency between parent and child zones, glue record requirements, response time analysis.

---

## 3. SOA (Start of Authority) Record

- **Information Returned:** Primary master nameserver (MNAME), responsible email address (RNAME), serial number, refresh interval, retry interval, expire time, minimum TTL values.
- **Checks:** Record exists, serial number consistency across all nameservers, recommended timing values validation, valid email format, MNAME exists in NS records.
- **Validations:** Serial number synchronization, refresh/retry/expire values within best practice ranges, responsible email accessibility, primary nameserver authority validation.

---

## 4. A (IPv4 Address) Records

- **Information Returned:** All IPv4 addresses assigned to the domain (root domain and www subdomain), TTL values, geographic location of IPs.
- **Checks:** Records exist for both root and www, no private/reserved/loopback IPs, IP reachability tests, load balancing configuration, CDN detection.
- **Validations:** Public IP address verification, connectivity tests, geographic distribution analysis, duplicate IP detection, hosting provider identification.

---

## 5. AAAA (IPv6 Address) Records

- **Information Returned:** All IPv6 addresses assigned to the domain (root domain and www subdomain), TTL values, IPv6 address blocks, dual-stack configuration.
- **Checks:** Records exist, no invalid/reserved IPv6 blocks, IPv6 connectivity tests, dual-stack compatibility, proper IPv6 configuration.
- **Validations:** Valid IPv6 address format, reserved address block detection, connectivity verification, IPv6 readiness assessment.

---

## 6. MX (Mail Exchange) Records

- **Information Returned:** Complete list of mail servers, priority values, resolved IPv4/IPv6 addresses, mail server software detection, anti-spam configurations.
- **Checks:** Records exist, no duplicate priorities, valid A/AAAA records (no CNAME for MX targets), mail server reachability, priority distribution, backup MX configuration.
- **Validations:** Mail server connectivity, priority ordering validation, target hostname resolution, redundancy analysis, mail server response testing.

---

## 7. SPF (Sender Policy Framework)

- **Information Returned:** Complete SPF record value, parsed mechanisms and modifiers, included domains, DNS lookup count, policy strictness.
- **Checks:** Record exists, valid syntax, maximum 10 DNS lookups, no deprecated mechanisms, proper policy configuration, include chain validation.
- **Validations:** Syntax compliance with RFC 7208, DNS lookup optimization, mechanism effectiveness, policy completeness, security strength assessment.

---

## 8. TXT Records

- **Information Returned:** All TXT records for the root domain, SPF/DKIM/DMARC identification, domain verification records, custom configurations.
- **Checks:** Presence of security records (SPF, DKIM, DMARC), valid syntax for each type, no conflicting records, proper formatting.
- **Validations:** Record syntax verification, security configuration completeness, conflicting record detection, best practice compliance.

---

## 9. CNAME (Canonical Name) Records

- **Information Returned:** CNAME records for key subdomains (www, mail, ftp, blog, shop), target domains, chain resolution, TTL values.
- **Checks:** No CNAME at zone apex, chain length validation, target existence and resolution, circular reference detection, subdomain coverage.
- **Validations:** Zone apex compliance, resolution chain integrity, target accessibility, performance impact assessment.

---

## 10. PTR (Reverse DNS) Records

- **Information Returned:** PTR records for each mail server IP address, reverse hostname resolution, forward-reverse consistency.
- **Checks:** PTR record exists for all MX server IPs, hostname matches forward lookup, not generic/default hostnames, proper domain alignment.
- **Validations:** Reverse DNS completeness, forward-reverse consistency, hostname authenticity, mail server reputation factors.

---

## 11. CAA (Certification Authority Authorization) Records

- **Information Returned:** Complete list of CAA records, authorized certificate authorities, policy tags, critical flags, wildcard permissions.
- **Checks:** Valid syntax according to RFC 6844, at least one CA authorized or explicit denial, no conflicting policies, proper flag usage.
- **Validations:** Syntax compliance, security policy effectiveness, CA authorization completeness, wildcard certificate controls.

---

## 12. DMARC (Domain-based Message Authentication, Reporting & Conformance)

- **Information Returned:** Complete DMARC policy record, alignment settings, reporting configuration, policy strictness, aggregate/forensic report addresses.
- **Checks:** Record exists at _dmarc subdomain, valid syntax, proper policy configuration, SPF/DKIM alignment settings, reporting setup.
- **Validations:** Policy effectiveness, alignment configuration, reporting mechanism setup, security level assessment, gradual deployment validation.

---

## 13. DKIM (DomainKeys Identified Mail)

- **Information Returned:** DKIM selector records (user-provided or common selectors), public key data, key algorithms, key length, service configuration.
- **Checks:** Records exist for provided/common selectors, valid public key format, appropriate key length (1024+ bits), proper algorithm usage.
- **Validations:** Key strength assessment, algorithm security, selector configuration, service integration verification.

---

## 14. Glue Records

- **Information Returned:** Presence and accuracy of glue records for in-zone nameservers, IPv4/IPv6 glue data, consistency across parent servers.
- **Checks:** Glue records present for all in-bailiwick nameservers, IP address consistency, parent-child synchronization, redundancy coverage.
- **Validations:** Delegation integrity, glue record necessity, consistency verification, resolution path optimization.

---

## 15. DNSSEC (Domain Name System Security Extensions)

- **Information Returned:** DS records in parent zone, DNSKEY records, RRSIG signatures, NSEC/NSEC3 records, chain of trust validation.
- **Checks:** DNSSEC signing status, valid signatures, proper key algorithms, signature expiration, chain of trust integrity.
- **Validations:** Cryptographic signature verification, key rollover status, algorithm strength, trust chain completeness, temporal validity.

---

## 16. AXFR (Zone Transfer)

- **Information Returned:** Zone transfer availability status, transfer restrictions, secondary server configuration, security assessment.
- **Checks:** AXFR requests properly restricted to authorized hosts, no open zone transfers, secondary nameserver access control.
- **Validations:** Transfer security, access control effectiveness, information disclosure prevention, authorized server verification.

---

## 17. Wildcard Records

- **Information Returned:** Detection of wildcard DNS entries for various record types, wildcard coverage, subdomain behavior analysis.
- **Checks:** Wildcard presence detection, appropriate usage assessment, security implications, subdomain resolution behavior.
- **Validations:** Wildcard necessity, security risk assessment, resolution behavior analysis, best practice compliance.

---

## 18. WWW (CNAME/A Records)

- **Information Returned:** Complete WWW subdomain analysis including CNAME chain resolution, final A record destinations, IP addresses, public/private IP validation.
- **Checks:** WWW subdomain existence, CNAME record presence and chain following, A record resolution through CNAME chain, IP address publicity validation, subdomain accessibility.
- **Validations:** CNAME chain integrity, A record resolution accuracy, public IP verification, subdomain configuration completeness, web accessibility assessment.
- **Output Format:** 
  - **WWW A Record**: Displays complete resolution chain (e.g., `www.domain.com -> domain.com -> [ 192.0.2.1 ]` with CNAME indication)
  - **IPs are public**: Validates all resolved IPs are public (not private/reserved/loopback)
  - **WWW CNAME**: Confirms CNAME record existence and proper A record resolution

---

*For implementation details, see `backend/dns_checker.py`*
