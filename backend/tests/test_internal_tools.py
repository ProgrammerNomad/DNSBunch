import json
import os
import sys
import time

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TEST_SECRET = "unit-test-internal-api-secret"


@pytest.fixture(scope="module")
def flask_app():
    os.environ["INTERNAL_API_SECRET"] = TEST_SECRET
    from app import app

    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(flask_app):
    return flask_app.test_client()


def _signed_post(client, tool_id: str, payload: dict):
    body = json.dumps(payload).encode("utf-8")
    ts = str(int(time.time()))
    from tools.internal_auth import compute_signature

    sig = compute_signature(TEST_SECRET, ts, body)
    return client.post(
        f"/internal/v1/tools/{tool_id}",
        data=body,
        content_type="application/json",
        headers={
            "X-Internal-Timestamp": ts,
            "X-Internal-Signature": sig,
        },
    )


class TestInternalToolsRoute:
    def test_unsigned_returns_401(self, client):
        response = client.post(
            "/internal/v1/tools/dns_health",
            json={"domain": "example.com"},
        )
        assert response.status_code == 401

    def test_unknown_tool_returns_404(self, client):
        response = _signed_post(client, "unknown_tool", {"domain": "example.com"})
        assert response.status_code == 404

    def test_dns_health_valid_signature(self, client, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {},
                "summary": {"total": 1, "pass": 1, "warning": 0, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dns_health.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        response = _signed_post(
            client,
            "dns_health",
            {"domain": "example.com", "checks": ["ns"]},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["domain"] == "example.com"
        assert "summary" in data

    def test_dmarc_checker_valid_signature(self, client, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "dmarc": {
                        "status": "warning",
                        "record": "",
                        "parsed": {},
                        "issues": ["No DMARC record found."],
                    }
                },
                "summary": {"total": 1, "pass": 0, "warning": 1, "error": 0, "info": 0},
            }

        monkeypatch.setattr(
            "tools.dmarc_checker.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        response = _signed_post(client, "dmarc_checker", {"domain": "example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["domain"] == "example.com"
        assert data["status"] == "warning"
        assert "issues" in data

    def test_spf_checker_valid_signature(self, client, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "spf": {
                        "status": "info",
                        "record": "",
                        "issues": ["No SPF record found"],
                    }
                },
                "summary": {"total": 1, "pass": 0, "warning": 0, "error": 0, "info": 1},
            }

        monkeypatch.setattr(
            "tools.spf_checker.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        response = _signed_post(client, "spf_checker", {"domain": "example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["domain"] == "example.com"
        assert data["status"] == "info"
        assert data["mechanisms"] == []

    def test_dkim_checker_valid_signature(self, client, monkeypatch):
        async def fake_lookup(self, selector):
            return {
                "status": "warning",
                "record": "",
                "parsed": {},
                "issues": ["No DKIM record found."],
            }

        monkeypatch.setattr(
            "tools.dkim_checker.runner.DNSChecker.lookup_dkim_selector",
            fake_lookup,
        )
        response = _signed_post(
            client,
            "dkim_checker",
            {"domain": "example.com", "selector": "google"},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["selector"] == "google"
        assert data["host"] == "google._domainkey.example.com"

    def test_mx_lookup_valid_signature(self, client, monkeypatch):
        async def fake_run_all_checks(self, checks):
            return {
                "domain": self.domain,
                "timestamp": "2026-01-01T00:00:00Z",
                "checks": {
                    "mx": {
                        "status": "info",
                        "count": 0,
                        "records": [],
                        "checks": [
                            {
                                "type": "mx_records",
                                "status": "info",
                                "message": "No MX records found",
                                "details": [],
                            }
                        ],
                    }
                },
                "summary": {"total": 1, "pass": 0, "warning": 0, "error": 0, "info": 1},
            }

        monkeypatch.setattr(
            "tools.mx_lookup.runner.DNSChecker.run_all_checks",
            fake_run_all_checks,
        )
        response = _signed_post(client, "mx_lookup", {"domain": "example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 0
        assert data["rows"] == []

    def test_smtp_test_valid_signature(self, client, monkeypatch):
        def fake_probe(host, port):
            return {
                "status": "pass",
                "banner": "220 smtp.example.com",
                "ehlo_response": "250 OK",
                "issues": [],
                "error": None,
            }

        monkeypatch.setattr("tools.smtp_test.runner._probe_smtp", fake_probe)
        response = _signed_post(
            client,
            "smtp_test",
            {"host": "smtp.example.com", "port": 25},
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["host"] == "smtp.example.com"
        assert data["banner"].startswith("220")

    def test_whois_lookup_valid_signature(self, client, monkeypatch):
        def fake_rdap(domain):
            return {
                "domain": domain,
                "registrar": "Test",
                "created": "2020-01-01T00:00:00+00:00",
                "updated": None,
                "expires": "2030-01-01T00:00:00+00:00",
                "nameservers": [],
                "statuses": [],
            }

        monkeypatch.setattr("tools.whois_lookup.runner.fetch_domain_rdap", fake_rdap)
        response = _signed_post(client, "whois_lookup", {"domain": "example.com"})
        assert response.status_code == 200
        assert response.get_json()["domain"] == "example.com"

    def test_ssl_inspector_valid_signature(self, client, monkeypatch):
        def fake_inspect(host):
            return {
                "host": host,
                "status": "warning",
                "tls_version": "TLSv1.2",
                "subject_cn": "other.example",
                "issuer": "Test CA",
                "sans": ["other.example"],
                "not_before": "2026-01-01T00:00:00+00:00",
                "not_after": "2026-09-20T00:00:00+00:00",
                "days_until_expiry": 4,
                "hostname_match": False,
                "issues": ["Certificate does not match the requested hostname"],
                "error": None,
            }

        monkeypatch.setattr("tools.ssl_inspector.runner._inspect_tls", fake_inspect)
        response = _signed_post(client, "ssl_inspector", {"host": "example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "warning"
        assert data["hostname_match"] is False

    def test_http_status_valid_signature(self, client, monkeypatch):
        from tools.url_fetch import FetchGetResult

        def fake_fetch(url, **kwargs):
            return FetchGetResult(
                final_url="https://example.com/",
                status_code=200,
                headers={},
            )

        monkeypatch.setattr("tools.http_status.runner.fetch_get_with_redirect_cap", fake_fetch)
        response = _signed_post(client, "http_status", {"url": "https://example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["status_code"] == 200
        assert "latency_ms" in data

    def test_redirect_chain_valid_signature(self, client, monkeypatch):
        from tools.url_fetch import RedirectChainResult, RedirectHop

        def fake_chain(url, **kwargs):
            return RedirectChainResult(
                hops=(RedirectHop(1, "https://example.com/", 200, None),),
                final_url="https://example.com/",
                final_status_code=200,
                loop_detected=False,
                redirect_limit_exceeded=False,
                headers={},
            )

        monkeypatch.setattr("tools.redirect_chain.runner.fetch_redirect_chain", fake_chain)
        response = _signed_post(client, "redirect_chain", {"url": "https://example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["final_status_code"] == 200
        assert len(data["hops"]) == 1

    def test_http_headers_valid_signature(self, client, monkeypatch):
        from tools.url_fetch import FetchGetResult

        def fake_fetch(url, **kwargs):
            return FetchGetResult(
                final_url="https://example.com/",
                status_code=200,
                headers={"X-Frame-Options": "DENY"},
            )

        monkeypatch.setattr("tools.http_headers.runner.fetch_get_with_redirect_cap", fake_fetch)
        response = _signed_post(client, "http_headers", {"url": "https://example.com"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["status_code"] == 200
        assert data["final_url"] == "https://example.com/"

    def test_dnsbl_lookup_valid_signature(self, client, monkeypatch):
        def fake_query(ip, zone_meta):
            return {
                "rbl_id": zone_meta["rbl_id"],
                "label": zone_meta["label"],
                "zone": zone_meta["zone"],
                "ip": ip,
                "query": f"test.{zone_meta['zone']}",
                "result": "listed" if zone_meta["rbl_id"] == "spamhaus_zen" else "clean",
                "response": "127.0.0.2" if zone_meta["rbl_id"] == "spamhaus_zen" else None,
                "message": None,
            }

        monkeypatch.setattr("tools.dnsbl_lookup.runner._query_rbl", fake_query)
        response = _signed_post(client, "dnsbl_lookup", {"ip": "8.8.8.8"})
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "warning"
        assert len(data["rows"]) == 3
