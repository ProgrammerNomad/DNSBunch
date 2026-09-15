# Feature: HTTP Status Check

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `http_status` |

## Summary

Return status code and timing for URL.

## Architecture

Python or Next server fetch with timeout. SSRF: [ARCHITECTURE.md §20](../../ARCHITECTURE.md#20-http--website-tool-security-planned).

## Acceptance criteria

- [ ] 4xx/5xx/timeout distinct messages
