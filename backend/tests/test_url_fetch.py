import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.url_fetch import (
    FetchGetResult,
    assert_safe_fetch_url,
    fetch_get_with_redirect_cap,
    normalize_fetch_url,
)


class TestNormalizeFetchUrl:
    def test_adds_https_scheme(self):
        assert normalize_fetch_url("example.com") == "https://example.com"

    def test_preserves_path(self):
        assert normalize_fetch_url("https://Example.com/path") == "https://example.com/path"

    def test_empty_rejected(self):
        with pytest.raises(ValueError, match="URL is required"):
            normalize_fetch_url("")

    def test_invalid_scheme(self):
        with pytest.raises(ValueError, match="http or https"):
            normalize_fetch_url("ftp://example.com")

    def test_userinfo_rejected(self):
        with pytest.raises(ValueError, match="userinfo"):
            normalize_fetch_url("https://user:pass@example.com")


class TestAssertSafeFetchUrl:
    def test_localhost_blocked(self):
        with pytest.raises(ValueError, match="not allowed"):
            assert_safe_fetch_url("http://localhost/")

    def test_loopback_ip_blocked(self):
        with pytest.raises(ValueError, match="not allowed"):
            assert_safe_fetch_url("http://127.0.0.1/")

    def test_private_ip_literal_blocked(self):
        with pytest.raises(ValueError, match="not allowed"):
            assert_safe_fetch_url("http://192.168.1.1/")

    def test_zero_address_blocked(self):
        with pytest.raises(ValueError, match="not allowed"):
            assert_safe_fetch_url("http://0.0.0.0/")


class TestFetchGetWithRedirectCap:
    def test_follows_redirect_with_revalidation(self, monkeypatch):
        calls: list[str] = []

        class FakeResponse:
            def __init__(self, status_code: int, headers: dict[str, str] | None = None):
                self.status_code = status_code
                self.headers = headers or {}

            def close(self) -> None:
                pass

        def fake_get(*args, **kwargs):
            url = args[1] if len(args) > 1 else args[0]
            calls.append(url)
            if url == "https://example.com/":
                return FakeResponse(302, {"Location": "https://example.org/final"})
            if url == "https://example.org/final":
                return FakeResponse(200, {"Content-Type": "text/html"})
            raise AssertionError(f"unexpected url {url}")

        monkeypatch.setattr(
            "tools.url_fetch.assert_safe_fetch_url",
            lambda u: u if u.startswith("http") else f"https://{u}",
        )
        monkeypatch.setattr("tools.url_fetch.requests.Session.get", fake_get)

        result = fetch_get_with_redirect_cap("https://example.com/")
        assert isinstance(result, FetchGetResult)
        assert result.final_url == "https://example.org/final"
        assert result.status_code == 200
        assert len(calls) == 2

    def test_redirect_cap_exceeded(self, monkeypatch):
        class FakeResponse:
            status_code = 302
            headers = {"Location": "https://example.com/loop"}

            def close(self) -> None:
                pass

        monkeypatch.setattr("tools.url_fetch.assert_safe_fetch_url", lambda u: u)
        monkeypatch.setattr("tools.url_fetch.requests.Session.get", lambda *a, **k: FakeResponse())

        with pytest.raises(ValueError, match="Too many redirects"):
            fetch_get_with_redirect_cap("https://example.com/", max_redirects=2)
