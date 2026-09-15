# Feature: HTTP Headers

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `http_headers` |

## Summary

Fetch URL, display response headers (security headers highlighted).

## Architecture

Python httpx/aiohttp with timeout; Next `/tools/http-headers`. SSRF: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

## Acceptance criteria

- [ ] Redirect follow limit; no SSRF to private IPs
