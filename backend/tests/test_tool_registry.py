import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.bootstrap import register_all_tools
from tools.registry import ToolNotFoundError, get, list_tool_ids, run_tool


class TestToolRegistry:
    @pytest.fixture(autouse=True)
    def _register_tools(self):
        register_all_tools()

    def test_unknown_tool_raises(self):
        with pytest.raises(ToolNotFoundError):
            get("not_a_real_tool")

    def test_dns_health_registered(self):
        assert "dns_health" in list_tool_ids()
        entry = get("dns_health")
        assert entry.meta.category == "dns_health"
        assert entry.meta.timeout_ms == 30_000

    def test_dmarc_checker_registered(self):
        assert "dmarc_checker" in list_tool_ids()
        entry = get("dmarc_checker")
        assert entry.meta.category == "email"

    def test_dmarc_checker_invalid_domain(self):
        with pytest.raises(ValueError, match="Domain is required"):
            run_tool("dmarc_checker", domain="")

    def test_dmarc_checker_smoke_mocked(self, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "dmarc": {
                        "status": "pass",
                        "record": "v=DMARC1; p=reject; rua=mailto:dm@example.com",
                        "parsed": {"p": "reject", "rua": "mailto:dm@example.com"},
                        "issues": [],
                    }
                },
                "summary": {"total": 1, "pass": 1, "warning": 0, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dmarc_checker.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        result = run_tool("dmarc_checker", domain="example.com")
        assert result["domain"] == "example.com"
        assert result["status"] == "pass"
        assert result["parsed"]["p"] == "reject"
        assert any(t["tag"] == "p" for t in result["tags"])

    def test_spf_checker_registered(self):
        assert "spf_checker" in list_tool_ids()
        entry = get("spf_checker")
        assert entry.meta.category == "email"

    def test_spf_checker_invalid_domain(self):
        with pytest.raises(ValueError, match="Domain is required"):
            run_tool("spf_checker", domain="")

    def test_spf_checker_smoke_mocked(self, monkeypatch):
        record = "v=spf1 include:_spf.google.com -all"

        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "spf": {
                        "status": "pass",
                        "record": record,
                        "issues": [],
                        "dns_lookups": 2,
                    }
                },
                "summary": {"total": 1, "pass": 1, "warning": 0, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.spf_checker.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        result = run_tool("spf_checker", domain="example.com")
        assert result["domain"] == "example.com"
        assert result["status"] == "pass"
        assert result["mechanisms"] == ["include:_spf.google.com", "-all"]
        assert result["dns_lookups"] == 2

    def test_dns_health_invalid_domain(self):
        with pytest.raises(ValueError, match="Domain is required"):
            run_tool("dns_health", domain="", checks=[])

    def test_dns_health_smoke_mocked(self, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {},
                "summary": {"total": 0, "pass": 0, "warning": 0, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dns_health.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        result = run_tool("dns_health", domain="example.com", checks=["ns"])
        assert result["domain"] == "example.com"
        assert "summary" in result
