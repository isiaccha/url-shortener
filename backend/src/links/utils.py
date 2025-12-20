from __future__ import annotations

import hashlib
from urllib.parse import urlparse

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

