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

    def test_dkim_checker_registered(self):
        assert "dkim_checker" in list_tool_ids()
        entry = get("dkim_checker")
        assert entry.meta.category == "email"

    def test_dkim_checker_invalid_selector(self):
        with pytest.raises(ValueError, match="Selector is required"):
            run_tool("dkim_checker", domain="example.com", selector="")

    def test_dkim_checker_smoke_mocked(self, monkeypatch):
        async def fake_lookup(self, selector):
            return {
                "status": "pass",
                "record": "v=DKIM1; k=rsa; p=abc",
                "parsed": {"v": "DKIM1", "k": "rsa", "p": "abc"},
                "issues": [],
            }

        monkeypatch.setattr(
            "tools.dkim_checker.runner.DNSChecker.lookup_dkim_selector",
            fake_lookup,
        )
        result = run_tool("dkim_checker", domain="example.com", selector="google")
        assert result["domain"] == "example.com"
        assert result["selector"] == "google"
        assert result["host"] == "google._domainkey.example.com"
        assert result["status"] == "pass"

    def test_mx_lookup_registered(self):
        assert "mx_lookup" in list_tool_ids()
        entry = get("mx_lookup")
        assert entry.meta.category == "email"

    def test_mx_lookup_invalid_domain(self):
        with pytest.raises(ValueError, match="Domain is required"):
            run_tool("mx_lookup", domain="")

    def test_mx_lookup_smoke_mocked(self, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "mx": {
                        "status": "pass",
                        "count": 1,
                        "records": [
                            {
                                "host": "mail.example.com",
                                "priority": 10,
                                "ips": [{"type": "A", "ip": "93.184.216.34"}],
                            }
                        ],
                        "checks": [],
                    }
                },
                "summary": {"total": 1, "pass": 1, "warning": 0, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.mx_lookup.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        result = run_tool("mx_lookup", domain="example.com")
        assert result["domain"] == "example.com"
        assert result["count"] == 1
        assert result["rows"][0]["host"] == "mail.example.com"
        assert result["rows"][0]["ips"] == ["93.184.216.34"]

    def test_smtp_test_registered(self):
        assert "smtp_test" in list_tool_ids()
        entry = get("smtp_test")
        assert entry.meta.category == "email"

    def test_smtp_test_invalid_target(self):
        with pytest.raises(ValueError, match="Domain or host is required"):
            run_tool("smtp_test")

    def test_smtp_test_smoke_mocked(self, monkeypatch):
        def fake_probe(host, port):
            return {
                "status": "pass",
                "banner": "220 mail.example.com ESMTP",
                "ehlo_response": "250-mail.example.com\r\n250 SIZE",
                "issues": [],
                "error": None,
            }

        monkeypatch.setattr("tools.smtp_test.runner._probe_smtp", fake_probe)
        result = run_tool("smtp_test", host="mail.example.com", port=25)
        assert result["host"] == "mail.example.com"
        assert result["banner"].startswith("220")

    def test_dnsbl_lookup_registered(self):
        assert "dnsbl_lookup" in list_tool_ids()
        entry = get("dnsbl_lookup")
        assert entry.meta.category == "email"

    def test_dnsbl_lookup_smoke_mocked(self, monkeypatch):
        def fake_query(ip, zone_meta):
            return {
                "rbl_id": zone_meta["rbl_id"],
                "label": zone_meta["label"],
                "zone": zone_meta["zone"],
                "ip": ip,
                "query": f"test.{zone_meta['zone']}",
                "result": "clean",
                "response": None,
                "message": None,
            }

        monkeypatch.setattr("tools.dnsbl_lookup.runner._query_rbl", fake_query)
        result = run_tool("dnsbl_lookup", ip="8.8.8.8")
        assert result["ips_checked"] == ["8.8.8.8"]
        assert len(result["rows"]) == 3
        assert result["status"] == "pass"

    def test_http_headers_registered(self):
        assert "http_headers" in list_tool_ids()
        entry = get("http_headers")
        assert entry.meta.category == "website"
        assert entry.meta.timeout_ms == 20_000

    def test_http_headers_invalid_url(self):
        with pytest.raises(ValueError, match="URL is required"):
            run_tool("http_headers", url="")

    def test_redirect_chain_registered(self):
        assert "redirect_chain" in list_tool_ids()
        entry = get("redirect_chain")
        assert entry.meta.category == "website"
        assert entry.meta.timeout_ms == 20_000

    def test_redirect_chain_invalid_url(self):
        with pytest.raises(ValueError, match="URL is required"):
            run_tool("redirect_chain", url="")

    def test_redirect_chain_smoke_mocked(self, monkeypatch):
        from tools.url_fetch import RedirectChainResult, RedirectHop

        def fake_chain(url, **kwargs):
            return RedirectChainResult(
                hops=(
                    RedirectHop(1, "https://example.com", 301, "https://example.com/"),
                    RedirectHop(2, "https://example.com/", 200, None),
                ),
                final_url="https://example.com/",
                final_status_code=200,
                loop_detected=False,
                redirect_limit_exceeded=False,
                headers={},
            )

        monkeypatch.setattr("tools.redirect_chain.runner.fetch_redirect_chain", fake_chain)
        result = run_tool("redirect_chain", url="https://example.com")
        assert result["status"] == "pass"
        assert len(result["hops"]) == 2
        assert result["final_status_code"] == 200

    def test_http_headers_smoke_mocked(self, monkeypatch):
        from tools.url_fetch import FetchGetResult

        def fake_fetch(url, **kwargs):
            return FetchGetResult(
                final_url="https://example.com/",
                status_code=200,
                headers={
                    "Content-Type": "text/html",
                    "Strict-Transport-Security": "max-age=31536000",
                },
            )

        monkeypatch.setattr("tools.http_headers.runner.fetch_get_with_redirect_cap", fake_fetch)
        result = run_tool("http_headers", url="https://example.com")
        assert result["status_code"] == 200
        assert result["status"] == "warning"
        assert any(h["name"] == "strict-transport-security" and h["present"] for h in result["security_headers"])

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
