import pytest
import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dns_checker import DNSChecker

class TestDNSChecker:
    """Test cases for DNSChecker"""
    
    @pytest.fixture
    def checker(self):
        """Create a DNSChecker instance for testing"""
        return DNSChecker("google.com")
    
    def test_domain_initialization(self, checker):
        """Test that domain is properly initialized"""
        assert checker.domain == "google.com"
    
    @pytest.mark.asyncio
    async def test_ns_check(self, checker):
        """Test NS record checking"""
        result = await checker._check_ns_records()
        assert result['status'] in ['pass', 'warning', 'error']
        assert 'records' in result
        assert 'issues' in result
    
    @pytest.mark.asyncio
    async def test_soa_check(self, checker):
        """Test SOA record checking"""
        result = await checker._check_soa_record()
        assert result['status'] in ['pass', 'warning', 'error']
        assert 'record' in result
    
    @pytest.mark.asyncio
    async def test_a_records_check(self, checker):
        """Test A record checking"""
        result = await checker._check_a_records()
        assert result['status'] in ['pass', 'warning', 'error']
        assert 'records' in result
    
    @pytest.mark.asyncio
    async def test_mx_records_check(self, checker):
        """Test MX record checking"""
        result = await checker._check_mx_records()
        assert result['status'] in ['pass', 'warning', 'error', 'info']
        assert 'records' in result
    
    @pytest.mark.asyncio
    async def test_full_check(self, checker):
        """Test running all checks"""
        result = await checker.run_all_checks(['ns', 'soa', 'a'])
        assert 'timestamp' in result
        assert 'checks' in result
        assert 'summary' in result
        assert result['summary']['total'] > 0
    
    def test_invalid_domain(self):
        """Test handling of invalid domain"""
        with pytest.raises(Exception):
            checker = DNSChecker("")
    
    @pytest.mark.asyncio
    async def test_nonexistent_domain(self):
        """Test handling of non-existent domain"""
        checker = DNSChecker("thisisanonexistentdomainfortesting12345.com")
        result = await checker._check_ns_records()
        assert result['status'] == 'error'

if __name__ == "__main__":
    pytest.main([__file__])
