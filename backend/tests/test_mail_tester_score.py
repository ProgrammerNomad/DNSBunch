import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mail_tester.score import score_raw_message

FIXTURE = Path(__file__).parent / "fixtures" / "sample_mail.eml"


def test_score_fixture_message_v2(monkeypatch):
    def fake_dns_cfg(from_domain, raw):
        return {
            "spf": {"record": "v=spf1 ~all", "status": "success"},
            "dkim": {"selectors": []},
            "dmarc": {"record": "v=DMARC1; p=none", "status": "success"},
        }

    def fake_msg_auth(msg, raw):
        return {
            "spf": {"result": "pass", "detail": "test"},
            "dkim": {"result": "none", "detail": "test"},
            "dmarc": {"result": "pass", "detail": "test"},
        }

    def fake_dnsbl(**kwargs):
        return {"rows": [{"result": "clean", "label": "zen"}], "status": "pass"}

    monkeypatch.setattr("mail_tester.score.build_dns_configuration", fake_dns_cfg)
    monkeypatch.setattr("mail_tester.score.build_message_authentication", fake_msg_auth)
    monkeypatch.setattr("mail_tester.score.run_dnsbl_lookup", fake_dnsbl)
    monkeypatch.setattr("mail_tester.score.analyze_spamassassin", lambda raw: {"available": False, "score": None, "rules": []})

    raw = FIXTURE.read_bytes()
    result = score_raw_message(raw)

    assert 0 <= result["score"] <= 10
    assert result["summary"]["verdict"]
    assert "message_authentication" in result
    assert "dns_configuration" in result
    assert result["from_domain"] == "example.com"


def test_score_rejects_empty():
    with pytest.raises(ValueError, match="empty"):
        score_raw_message(b"")


@pytest.fixture(scope="module")
def flask_app():
    os.environ["INTERNAL_API_SECRET"] = "test-secret"
    from app import app

    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(flask_app):
    return flask_app.test_client()


def test_internal_route(client, monkeypatch):
    def fake_score(data):
        return {"score": 8.5, "summary": {"status": "good", "verdict": "test"}}

    monkeypatch.setattr("mail_tester.score.score_from_payload", fake_score)

    import json
    import time
    import hmac
    import hashlib

    body = json.dumps({"raw": "aGVsbG8="}).encode()
    ts = str(int(time.time()))
    sig = hmac.new(b"test-secret", f"{ts}.".encode() + body, hashlib.sha256).hexdigest()

    response = client.post(
        "/internal/v1/mail-test/score",
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-Internal-Timestamp": ts,
            "X-Internal-Signature": sig,
        },
    )
    assert response.status_code == 200
    assert response.get_json()["score"] == 8.5
