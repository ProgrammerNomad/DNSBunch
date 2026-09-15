# Feature: Redirect Chain

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `redirect_chain` |

## Summary

Follow redirects up to N hops; show status codes and final URL.

## Architecture

Python httpx HEAD/GET chain. SSRF: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

## Acceptance criteria

- [ ] Loop detection; max hops enforced
