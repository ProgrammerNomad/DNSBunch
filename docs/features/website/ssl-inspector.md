# Feature: SSL Inspector

## Metadata

| Field | Value |
|-------|--------|
| **priority** | P2 |
| **status** | shipped |
| **phase** | 1 |
| **access** | free |
| **tool_id** | `ssl_inspector` |
| **last_reviewed** | 2026-09-16 |

## Summary

Certificate expiry, issuer, chain, TLS versions for HTTPS host.

## Problem

Quick cert expiry and name mismatch checks for admins.

## Scope

**In scope:** Connect TLS on port 443; parse cert; SAN/CN vs input host; expiry warnings (&lt;30 days).

**Out of scope:** Full vulnerability scan; client cert auth.

## User flows

- **Anonymous:** Enter hostname → cert details table.
- **Logged-in (future):** Same.

## Architecture

Python `ssl` + `socket`; `assert_public_host` before connect; BFF [`validate-ssl-inspector`](../../../frontend/src/lib/validate-ssl-inspector.ts).

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

Shared host validation (`assert_public_host`).

## Implementation checklist

- [x] Host input validation
- [x] Expiry warning thresholds

## Acceptance criteria

- [x] Expiry date shown
- [x] Hostname mismatch warning
- [x] Connection failures explained

## References

None for v1.
