# Feature: DNSBL / Blacklist Check

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dnsbl_lookup` |

## Summary

Query major DNSBLs for domain or IP (reverse DNSBL format)-respect list provider usage policies.

## Architecture

Python dnspython; configurable list set.

## Dependencies

Platform rate limits.

## Implementation checklist

- [ ] IP + domain input modes
- [ ] Document which lists are queried

## Acceptance criteria

- [ ] Listed/not listed per zone with list name
