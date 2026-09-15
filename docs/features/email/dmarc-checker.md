# Feature: DMARC Checker

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dmarc_checker` |

## Summary

Query `_dmarc.domain` TXT, parse policy (none/quarantine/reject), alignment hints.

## Architecture

Python: `_check_dmarc_record` or dedicated tool. High SEO value per [PRODUCT_STRATEGY.md](../../PRODUCT_STRATEGY.md).

## Dependencies

Platform skeleton recommended.

## Implementation checklist

- [ ] Standalone page `/tools/dmarc-checker`
- [ ] Link from health results when `dmarc` category present

## Acceptance criteria

- [ ] Policy and rua/ruf displayed when present
