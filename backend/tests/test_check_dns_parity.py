import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.bootstrap import register_all_tools
from tools.registry import run_tool


class TestCheckDnsParity:
    """Legacy /api/check and registry share one runner after convergence."""

    @pytest.fixture(autouse=True)
    def _register_tools(self):
        register_all_tools()

    def test_empty_domain_error(self):
        with pytest.raises(ValueError, match="Domain is required"):
            run_tool("dns_health", domain="", checks=[])

    def test_invalid_domain_error(self):
        with pytest.raises(ValueError, match="Invalid domain format"):
            run_tool("dns_health", domain="not a domain!!!", checks=[])

    def test_same_engine_mocked(self, monkeypatch):
        calls = []

        async def fake_run_all_checks(self, checks):
            calls.append((self.domain, checks))
            return {"domain": self.domain, "checks": {}, "summary": {"total": 0}}

        monkeypatch.setattr(
            "tools.dns_health.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        result = run_tool("dns_health", domain="Example.COM", checks=["ns", "a"])
        assert result["domain"] == "example.com"
        assert calls == [("example.com", ["ns", "a"])]
