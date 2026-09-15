# Feature: WHOIS Lookup

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `whois_lookup` |

## Summary

Registrar, dates, nameservers via WHOIS/RDAP.

## Architecture

Python python-whois or RDAP HTTP; rate limit heavily.

## Note

May cross-promote WhoisExtractor; keep DNSBunch read-only lookup.

## Acceptance criteria

- [ ] Parsed fields + raw snippet
