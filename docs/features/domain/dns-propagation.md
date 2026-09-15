# Feature: DNS Propagation

## Metadata

| Field | Value |
|-------|--------|
| **status** | planned |
| **phase** | organic |
| **access** | free |
| **tool_id** | `dns_propagation` |

## Summary

Query multiple public resolvers (Google, Cloudflare, Quad9) for a record type; show agreement %.

## Architecture

Python parallel queries; maps to [FUTURE_IDEAS.md](../../../FUTURE_IDEAS.md) history/propagation themes.

## Acceptance criteria

- [ ] Per-resolver result grid
