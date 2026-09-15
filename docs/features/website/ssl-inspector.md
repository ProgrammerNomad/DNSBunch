# Feature: SSL Inspector

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `ssl_inspector` |

## Summary

Certificate expiry, issuer, chain, TLS versions for HTTPS host.

## Architecture

Python (`ssl`/`cryptography`) or Next edge fetch with cert parse; prefer Python for consistency. SSRF rules: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

## Dependencies

Platform skeleton recommended.

## Implementation checklist

- [ ] Host input validation
- [ ] Expiry warning thresholds

## Acceptance criteria

- [ ] Valid/invalid/expired clearly shown
