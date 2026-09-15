# Feature: SPF Checker

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `spf_checker` |

## Summary

Standalone SPF record lookup and syntax validation for a domain (SEO: “check SPF record”).

## Scope

**In:** TXT at root, parse mechanisms, note DNS lookup count / common errors.  
**Out:** Sending live test mail (see mail-tester).

## Architecture

Python: dnspython TXT parse; optional reuse of `_check_spf_record` from [dns_checker.py](../../../backend/dns_checker.py). Next: `/tools/spf-checker`.

## API

Extend via [TOOL_PLUGIN_CONTRACT.md](../../TOOL_PLUGIN_CONTRACT.md); [API.md](../../API.md) when shipped.

## Dependencies

Platform skeleton recommended, not required.

## Implementation checklist

- [ ] Extract or wrap SPF logic from engine
- [ ] SEO page + event `tool_id=spf_checker`

## Acceptance criteria

- [ ] Output matches health check SPF section for same domain
