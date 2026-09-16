import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.validation import (
    assert_public_host,
    normalize_dkim_selector,
    normalize_ipv4,
    parse_dnsbl_target,
    parse_smtp_target,
)


class TestDkimSelectorValidation:
    def test_valid_selector(self):
        assert normalize_dkim_selector("Google") == "google"
        assert normalize_dkim_selector("selector1") == "selector1"

    def test_empty_selector(self):
        with pytest.raises(ValueError, match="Selector is required"):
            normalize_dkim_selector("")

    def test_invalid_selector(self):
        with pytest.raises(ValueError, match="Invalid selector format"):
            normalize_dkim_selector("_bad")
        with pytest.raises(ValueError, match="Invalid selector format"):
            normalize_dkim_selector("bad space")


class TestSmtpTargetValidation:
    def test_domain_only(self):
        target = parse_smtp_target(domain="Example.COM")
        assert target.domain == "example.com"
        assert target.host is None
        assert target.port == 25

    def test_host_only_port_587(self):
        target = parse_smtp_target(host="mail.example.com", port=587)
        assert target.domain is None
        assert target.host == "mail.example.com"
        assert target.port == 587

    def test_both_domain_and_host(self):
        with pytest.raises(ValueError, match="not both"):
            parse_smtp_target(domain="example.com", host="mail.example.com")

    def test_neither(self):
        with pytest.raises(ValueError, match="Domain or host is required"):
            parse_smtp_target()

    def test_invalid_port(self):
        with pytest.raises(ValueError, match="Port must be"):
            parse_smtp_target(host="mail.example.com", port=2525)

    def test_private_ip_literal(self):
        with pytest.raises(ValueError, match="not allowed"):
            assert_public_host("127.0.0.1")


class TestDnsblTargetValidation:
    def test_ip_only(self):
        target = parse_dnsbl_target(ip="8.8.8.8")
        assert target.ip == "8.8.8.8"
        assert target.domain is None

    def test_domain_only(self):
        target = parse_dnsbl_target(domain="example.com")
        assert target.domain == "example.com"
        assert target.ip is None

    def test_both_rejected(self):
        with pytest.raises(ValueError, match="not both"):
            parse_dnsbl_target(domain="example.com", ip="8.8.8.8")

    def test_invalid_ipv4(self):
        with pytest.raises(ValueError, match="Invalid IPv4"):
            normalize_ipv4("999.1.1.1")

    def test_private_ipv4(self):
        with pytest.raises(ValueError, match="Private or reserved"):
            normalize_ipv4("10.0.0.1")
