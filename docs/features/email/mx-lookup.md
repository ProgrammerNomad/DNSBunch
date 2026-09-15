# Feature: MX Lookup

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `mx_lookup` |

## Summary

Simple MX record list with priorities and resolved A/AAAA-lighter than full health check.

## Architecture

Python: MX query + resolution; may share helpers from `_check_mx_records`.

## Dependencies

None.

## Implementation checklist

- [ ] Tool module + page
- [ ] CTA to full DNS health check

## Acceptance criteria

- [ ] MX list matches health check MX section for domain
