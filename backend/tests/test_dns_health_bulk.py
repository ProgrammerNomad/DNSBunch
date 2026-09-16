import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.dns_health.bulk import bulk_analyze, rollup_for_bulk, run_dns_health_bulk


class TestRollupForBulk:
    def test_overall_error_when_summary_has_errors(self):
        full = {
            "domain": "example.com",
            "checks": {
                "ns": {"status": "pass"},
                "soa": {"status": "warning"},
                "mx": {"status": "pass"},
                "www": {"status": "pass"},
            },
            "summary": {"total": 4, "passed": 2, "warnings": 1, "errors": 1, "info": 0},
        }
        row = rollup_for_bulk(full)
        assert row["overall"] == "error"
        assert row["soa"] == "warning"
        assert row["error"] is None

    def test_missing_check_columns_dash(self):
        row = rollup_for_bulk({"domain": "x.com", "checks": {}, "summary": {"total": 0}})
        assert row["ns"] == "-"
        assert row["overall"] in ("info", "pass", "warning", "error")


class TestRunDnsHealthBulk:
    def test_empty_list_raises(self):
        with pytest.raises(ValueError, match="At least one domain"):
            run_dns_health_bulk([])

    def test_max_domains_raises(self, monkeypatch):
        monkeypatch.setattr("tools.dns_health.bulk.BULK_MAX_DOMAINS", 2)
        with pytest.raises(ValueError, match="Maximum 2"):
            run_dns_health_bulk(["a.com", "b.com", "c.com"])

    def test_dedupe_and_meta(self, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "checks": {"ns": {"status": "pass"}},
                "summary": {"total": 1, "passed": 1, "warnings": 0, "errors": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dns_health.bulk.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        out = run_dns_health_bulk(["Example.COM", "example.com", "other.org"])
        assert out["surface"] == "bulk"
        assert out["meta"]["requested"] == 2
        assert len(out["rows"]) == 2
        assert out["rows"][0]["domain"] == "example.com"

    def test_invalid_domain_error_row(self, monkeypatch):
        out = run_dns_health_bulk(["not!!!valid"])
        assert len(out["rows"]) == 1
        assert out["rows"][0]["error"] is not None
        assert out["meta"]["failed"] == 1


class TestBulkAnalyzeConcurrency:
    def test_returns_row_per_domain(self, monkeypatch):
        import asyncio

        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "checks": {},
                "summary": {"total": 0, "passed": 0, "warnings": 0, "errors": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dns_health.bulk.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        rows = asyncio.run(bulk_analyze(["a.com", "b.com"], concurrency=1))
        assert len(rows) == 2
