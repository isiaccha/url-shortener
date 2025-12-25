"""
Unit tests for utility functions in links/utils.py.
Tests functions that don't require database but may require mocking.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from starlette.datastructures import Headers

from src.links.utils import (
    get_referrer_host,
    get_ua_raw,
    get_client_ip,
    make_visitor_hash,
    parse_user_agent,
    get_country_from_ip,
)


class TestGetReferrerHost:
    """Test get_referrer_host function."""
    
    def test_no_referrer_header(self):
        """Test when no referrer header is present."""
        request = Mock()
        request.headers = {}
        assert get_referrer_host(request) is None
    
    def test_referer_header_present(self):
        """Test with 'referer' header."""
        request = Mock()
        request.headers = {"referer": "https://example.com/page"}
        assert get_referrer_host(request) == "example.com"
    
    def test_referrer_header_present(self):
        """Test with 'referrer' header (alternative spelling)."""
        request = Mock()
        request.headers = {"referrer": "https://google.com/search"}
        assert get_referrer_host(request) == "google.com"
    
    def test_referer_takes_precedence(self):
        """Test that 'referer' takes precedence over 'referrer'."""
        request = Mock()
        request.headers = {
            "referer": "https://example.com/page",
            "referrer": "https://google.com/search"
        }
        assert get_referrer_host(request) == "example.com"
    
    def test_referrer_with_path(self):
        """Test referrer with full URL path."""
        request = Mock()
        request.headers = {"referer": "https://example.com/path/to/page?query=test"}
        assert get_referrer_host(request) == "example.com"
    
    def test_invalid_referrer_url(self):
        """Test with invalid URL in referrer header."""
        request = Mock()
        request.headers = {"referer": "not a valid url"}
        # Should return None on parsing error
        assert get_referrer_host(request) is None
    
    def test_referrer_with_port(self):
        """Test referrer with port number."""
        request = Mock()
        request.headers = {"referer": "https://example.com:8080/page"}
        assert get_referrer_host(request) == "example.com"


class TestGetUaRaw:
    """Test get_ua_raw function."""
    
    def test_user_agent_present(self):
        """Test when user-agent header is present."""
        request = Mock()
        request.headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        assert get_ua_raw(request) == "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    
    def test_no_user_agent(self):
        """Test when user-agent header is missing."""
        request = Mock()
        request.headers = {}
        assert get_ua_raw(request) is None


class TestGetClientIP:
    """Test get_client_ip function."""
    
    def test_client_ip_present(self):
        """Test when client IP is available."""
        request = Mock()
        request.client = Mock()
        request.client.host = "192.168.1.100"
        assert get_client_ip(request) == "192.168.1.100"
    
    def test_client_is_none(self):
        """Test when request.client is None."""
        request = Mock()
        request.client = None
        assert get_client_ip(request) is None
    
    def test_ipv6_address(self):
        """Test with IPv6 address."""
        request = Mock()
        request.client = Mock()
        request.client.host = "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
        assert get_client_ip(request) == "2001:0db8:85a3:0000:0000:8a2e:0370:7334"


class TestMakeVisitorHash:
    """Test make_visitor_hash function."""
    
    def test_hash_with_ip_and_ua(self):
        """Test hash generation with both IP and user agent."""
        ip = "192.168.1.100"
        ua = "Mozilla/5.0"
        result = make_visitor_hash(ip, ua)
        
        assert result is not None
        assert isinstance(result, str)
        assert len(result) == 64  # SHA256 hex digest length
    
    def test_hash_with_ip_only(self):
        """Test hash generation with IP only."""
        ip = "192.168.1.100"
        result = make_visitor_hash(ip, None)
        
        assert result is not None
        assert isinstance(result, str)
        assert len(result) == 64
    
    def test_hash_deterministic(self):
        """Test that same input produces same hash."""
        ip = "192.168.1.100"
        ua = "Mozilla/5.0"
        hash1 = make_visitor_hash(ip, ua)
        hash2 = make_visitor_hash(ip, ua)
        
        assert hash1 == hash2
    
    def test_hash_different_inputs(self):
        """Test that different inputs produce different hashes."""
        ip1 = "192.168.1.100"
        ip2 = "192.168.1.101"
        ua = "Mozilla/5.0"
        
        hash1 = make_visitor_hash(ip1, ua)
        hash2 = make_visitor_hash(ip2, ua)
        
        assert hash1 != hash2
    
    def test_hash_no_ip(self):
        """Test that None IP returns None."""
        assert make_visitor_hash(None, "Mozilla/5.0") is None
        assert make_visitor_hash(None, None) is None
    
    def test_hash_includes_both_values(self):
        """Test that hash includes both IP and UA in the input."""
        ip = "192.168.1.100"
        ua1 = "Mozilla/5.0"
        ua2 = "Chrome/120.0"
        
        hash1 = make_visitor_hash(ip, ua1)
        hash2 = make_visitor_hash(ip, ua2)
        
        # Different UAs should produce different hashes
        assert hash1 != hash2


class TestParseUserAgent:
    """Test parse_user_agent function."""
    
    def test_none_ua_string(self):
        """Test with None user agent string."""
        result = parse_user_agent(None)
        assert result == {
            "device_category": None,
            "browser_name": None,
            "browser_version": None,
            "os_name": None,
            "os_version": None,
            "engine": None,
        }
    
    def test_empty_ua_string(self):
        """Test with empty user agent string."""
        result = parse_user_agent("")
        # Empty string should still try to parse, might return None values
        assert isinstance(result, dict)
        assert "device_category" in result
    
    def test_chrome_desktop(self):
        """Test parsing Chrome on Windows desktop."""
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        result = parse_user_agent(ua)
        
        assert result["device_category"] == "desktop"
        assert "Chrome" in result["browser_name"] or "chrome" in result["browser_name"].lower()
        assert result["browser_version"] is not None
        assert result["os_name"] is not None
        assert result["engine"] == "Blink"
    
    def test_firefox_mobile(self):
        """Test parsing Firefox on mobile."""
        ua = "Mozilla/5.0 (Android 11; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0"
        result = parse_user_agent(ua)
        
        assert result["device_category"] == "mobile"
        assert "Firefox" in result["browser_name"] or "firefox" in result["browser_name"].lower()
        assert result["engine"] == "Gecko"
    
    def test_safari_tablet(self):
        """Test parsing Safari on iPad."""
        ua = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        result = parse_user_agent(ua)
        
        assert result["device_category"] == "tablet"
        assert "Safari" in result["browser_name"] or "safari" in result["browser_name"].lower()
        assert result["engine"] in ["WebKit", "Blink"]  # Could be either
    
    def test_bot_user_agent(self):
        """Test parsing bot user agent."""
        ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        result = parse_user_agent(ua)
        
        assert result["device_category"] == "bot"
    
    def test_invalid_ua_string(self):
        """Test with invalid/malformed user agent string."""
        # Should not raise exception, should return dict with None values
        result = parse_user_agent("This is not a valid UA string")
        assert isinstance(result, dict)
        assert "device_category" in result


class TestGetCountryFromIP:
    """Test get_country_from_ip function."""
    
    def test_none_ip(self):
        """Test with None IP."""
        assert get_country_from_ip(None) is None
    
    def test_localhost_ip(self):
        """Test with localhost IP (should return US for testing)."""
        assert get_country_from_ip("127.0.0.1") == "US"
        assert get_country_from_ip("::1") == "US"
        assert get_country_from_ip("localhost") == "US"
    
    def test_private_ip_ranges(self):
        """Test with private IP ranges (should return None)."""
        assert get_country_from_ip("10.0.0.1") is None
        assert get_country_from_ip("172.16.0.1") is None
        assert get_country_from_ip("192.168.1.1") is None
    
    @patch('src.links.utils.httpx.Client')
    def test_successful_country_lookup(self, mock_client_class):
        """Test successful country lookup from API."""
        # Mock successful API response
        mock_response = Mock()
        # The API returns countryCode directly when using fields=countryCode
        mock_response.json.return_value = {"countryCode": "GB"}
        mock_response.raise_for_status.return_value = None
        
        # Mock the client instance that will be used inside the context manager
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        
        # When httpx.Client() is called, return a context manager that yields our mock_client_instance
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result == "GB"
    
    @patch('src.links.utils.httpx.Client')
    def test_api_error_status(self, mock_client_class):
        """Test when API returns error status."""
        mock_response = Mock()
        mock_response.json.return_value = {"status": "fail", "message": "invalid query"}
        mock_response.raise_for_status.return_value = None
        
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result is None
    
    @patch('src.links.utils.httpx.Client')
    def test_api_http_error(self, mock_client_class):
        """Test when API returns HTTP error."""
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = Exception("HTTP 500")
        
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result is None
    
    @patch('src.links.utils.httpx.Client')
    def test_api_timeout(self, mock_client_class):
        """Test when API request times out."""
        mock_client_instance = MagicMock()
        mock_client_instance.get.side_effect = Exception("Timeout")
        
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result is None
    
    @patch('src.links.utils.httpx.Client')
    def test_country_code_uppercase(self, mock_client_class):
        """Test that country code is returned in uppercase."""
        mock_response = Mock()
        # The API returns countryCode directly when using fields=countryCode
        mock_response.json.return_value = {"countryCode": "gb"}
        mock_response.raise_for_status.return_value = None
        
        # Mock the client instance that will be used inside the context manager
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        
        # When httpx.Client() is called, return a context manager that yields our mock_client_instance
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result == "GB"
    
    @patch('src.links.utils.httpx.Client')
    def test_invalid_country_code_length(self, mock_client_class):
        """Test when country code is not 2 characters."""
        mock_response = Mock()
        mock_response.json.return_value = {"countryCode": "USA"}  # 3 chars
        mock_response.raise_for_status.return_value = None
        
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        
        mock_context_manager = MagicMock()
        mock_context_manager.__enter__.return_value = mock_client_instance
        mock_context_manager.__exit__.return_value = False
        mock_client_class.return_value = mock_context_manager
        
        result = get_country_from_ip("8.8.8.8")
        assert result is None

