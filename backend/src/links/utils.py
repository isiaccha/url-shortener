from __future__ import annotations

import hashlib
from urllib.parse import urlparse

import httpx
from fastapi import Request


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
        return "US" # default to US for localhost/private IPs
    
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

