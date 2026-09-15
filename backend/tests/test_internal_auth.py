import os
import sys
import time

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.internal_auth import compute_signature, verify_internal_request


class TestInternalAuth:
    def test_verify_missing_headers(self, monkeypatch):
        monkeypatch.setenv("INTERNAL_API_SECRET", "secret")
        ok, msg = verify_internal_request(None, None, b"{}")
        assert ok is False
        assert "Missing" in msg

    def test_verify_invalid_signature(self, monkeypatch):
        monkeypatch.setenv("INTERNAL_API_SECRET", "secret")
        ts = str(int(time.time()))
        ok, msg = verify_internal_request(ts, "bad-signature", b"{}")
        assert ok is False
        assert msg == "Invalid signature"

    def test_verify_valid_signature(self, monkeypatch):
        secret = "secret"
        monkeypatch.setenv("INTERNAL_API_SECRET", secret)
        body = b'{"domain":"example.com"}'
        ts = str(int(time.time()))
        sig = compute_signature(secret, ts, body)
        ok, msg = verify_internal_request(ts, sig, body)
        assert ok is True
        assert msg == ""
