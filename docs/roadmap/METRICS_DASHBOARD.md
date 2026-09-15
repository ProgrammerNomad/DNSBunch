# Metrics Dashboard (Planning)

What to measure before choosing Pro features. Anonymous v1: **no domain names** in aggregate tables.

## Funnel (per tool_id)

```text
tool_view → tool_run (success) → return_visit_7d → account_created → paid_conversion
```

## Storage (minimal v1)

| Field | Example |
|-------|---------|
| `day` | 2026-09-15 |
| `tool_id` | `dns_health` |
| `views` | 1200 |
| `runs` | 800 |
| `errors` | 12 |
| `unique_ips` | optional hash |

## Hypotheses (validate with data)

| tool_id | Usage (hypothesis) | Pro potential |
|---------|-------------------|---------------|
| `dns_health` | Very high | Medium |
| `mx_lookup` | High | Low |
| `dmarc_checker` | High | High |
| `dnsbl_lookup` | Medium | High |
| `smtp_test` | Medium | High |
| `mail_tester` | High | Very high |
| `ssl_inspector` | High | Medium |
| `dns_watch` | Lower | High if attached to high-traffic tools |

## Decisions

- Do **not** fix pricing on monitoring until `dns_health` return rate is known.
- First Pro experiment: tool with high **runs + return_visit_7d**.

## Related

[analytics-events.md](../features/platform/analytics-events.md), [PRODUCT_STRATEGY.md](../PRODUCT_STRATEGY.md)
