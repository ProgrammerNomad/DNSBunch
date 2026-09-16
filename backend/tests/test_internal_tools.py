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
