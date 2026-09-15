# Feature: SSL Inspector

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | planned |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `ssl_inspector` |
| **last_reviewed** | 2026-09-15 |

## Summary

Certificate expiry, issuer, chain, TLS versions for HTTPS host.

## Problem

Quick cert expiry and name mismatch checks for admins.

## Scope

**In scope:** Connect TLS; parse cert; SAN/CN vs input host.

**Out of scope:** Full vulnerability scan; client cert auth.

## User flows

- **Anonymous:** Enter hostname → cert details table.
- **Logged-in (future):** Same.

## Architecture

Python ssl/socket; SSRF rules [ARCHITECTURE §20](../../ARCHITECTURE.md).

## Data model

None for v1.

## API

POST `/api/tools/ssl_inspector` `{ "host" }`.

## UI

Template **T2**, `/tools/ssl-inspector`.

## Limits and abuse

Block private/reserved IPs; timeout 15s.

## Monetization

Free public tier by default ([PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md)). Paid experiments only after funnel metrics ([METRICS_DASHBOARD.md](../../roadmap/METRICS_DASHBOARD.md)).

## Dependencies

Platform skeleton recommended.

## Implementation checklist

- [ ] Host input validation
- [ ] Expiry warning thresholds

## Acceptance criteria

- [ ] Expiry date shown
- [ ] Hostname mismatch warning
- [ ] Connection failures explained

## References

None for v1.
