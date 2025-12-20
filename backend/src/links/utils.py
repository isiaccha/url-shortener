from __future__ import annotations

import hashlib
from urllib.parse import urlparse

import httpx
from fastapi import Request
from user_agents import parse


def get_referrer_host(request: Request) -> str | None:
    ref = request.headers.get("referer") or request.headers.get("referrer")
    if not ref:
        return None
    try:
        return urlparse(ref).hostname
    except Exception:
        return None


def get_ua_raw(request: Request) -> str | None:
    return request.headers.get("user-agent")


def get_client_ip(request: Request) -> str | None:
    """
    MVP version: uses direct client host.
    If you deploy behind a proxy, you’ll later adapt this to trusted X-Forwarded-For.
    """
    if request.client is None:
        return None
    return request.client.host


def make_visitor_hash(ip: str | None, ua: str | None) -> str | None:
    if not ip:
        return None
    raw = (ip + "|" + (ua or "")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def parse_user_agent(ua_string: str | None) -> dict[str, str | None]:
    """
    Parse user agent string and extract structured information.
    Returns a dict with: device_category, browser_name, browser_version,
    os_name, os_version, and engine.
    All values are None if parsing fails or UA is None.
    """
    if not ua_string:
        return {
            "device_category": None,
            "browser_name": None,
            "browser_version": None,
            "os_name": None,
            "os_version": None,
            "engine": None,
        }
    
    try:
        ua = parse(ua_string)
        
        # Device category: mobile, tablet, desktop, or bot
        if ua.is_bot:
            device_category = "bot"
        elif ua.is_mobile:
            device_category = "mobile"
        elif ua.is_tablet:
            device_category = "tablet"
        else:
            device_category = "desktop"
        
        # Browser info
        browser_name = ua.browser.family if ua.browser else None
        browser_version = None
        if ua.browser and (ua.browser.version_string or ua.browser.version):
            # Prefer version_string (e.g., "120.0.0"), fallback to version tuple
            browser_version = ua.browser.version_string or ".".join(map(str, ua.browser.version[:2]))
        
        # OS info
        os_name = ua.os.family if ua.os else None
        os_version = None
        if ua.os and (ua.os.version_string or ua.os.version):
            # Prefer version_string, fallback to version tuple
            os_version = ua.os.version_string or ".".join(map(str, ua.os.version[:2]))
        
        # Engine (rendering engine)
        device = ua.device.family if ua.device else None
        # user-agents library doesn't directly expose engine, but we can infer from browser
        engine = None
        if browser_name:
            browser_lower = browser_name.lower()
            if "chrome" in browser_lower or "edge" in browser_lower or "opera" in browser_lower:
                engine = "Blink"
            elif "firefox" in browser_lower:
                engine = "Gecko"
            elif "safari" in browser_lower and "chrome" not in browser_lower:
                engine = "WebKit"
            elif "safari" in browser_lower:
                engine = "Blink"  # Chrome-based Safari
        
        return {
            "device_category": device_category,
            "browser_name": browser_name,
            "browser_version": browser_version,
            "os_name": os_name,
            "os_version": os_version,
            "engine": engine,
        }
    except Exception:
        # Gracefully handle any parsing errors
        return {
            "device_category": None,
            "browser_name": None,
            "browser_version": None,
            "os_name": None,
            "os_version": None,
            "engine": None,
        }


def get_country_from_ip(ip: str | None) -> str | None:
    """
    Look up country code from IP address using free GeoIP service.
    Returns 2-letter ISO country code (e.g., 'US', 'GB') or None if lookup fails.
    Never blocks or raises exceptions - gracefully returns None on any error.
    """
    if not ip:
        return None
    
    # Skip localhost/private IPs
    if ip in ("127.0.0.1", "::1", "localhost") or ip.startswith(("10.", "172.16.", "192.168.")):
        return None
    
    try:
        # Using ip-api.com free tier (no API key required, 45 req/min limit)
        # Format: http://ip-api.com/json/{ip}?fields=countryCode
        with httpx.Client(timeout=2.0) as client:
            response = client.get(
                f"http://ip-api.com/json/{ip}",
                params={"fields": "countryCode"},
            )
            response.raise_for_status()
            data = response.json()
            country_code = data.get("countryCode")
            # Return None if countryCode is empty string or missing
            return country_code if country_code else None
    except Exception:
        # Silently fail - never block analytics due to GeoIP lookup issues
        return None

