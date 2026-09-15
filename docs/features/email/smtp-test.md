# Feature: SMTP Test

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `smtp_test` |

## Summary

TCP connect to MX hosts, read banner, optional STARTTLS-timeout capped.

## Scope

**In:** Banner, TLS support hint.  
**Out:** Auth, sending message body.

## Architecture

Python asyncio/socket; strict timeouts and rate limits.

## Dependencies

[mx-lookup.md](mx-lookup.md) or inline MX resolve.

## Implementation checklist

- [ ] Connect to port 25/587 with timeout
- [ ] Abuse limits per IP

## Acceptance criteria

- [ ] No hung connections; errors surfaced clearly
