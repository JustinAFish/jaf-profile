"""
/backend/app/core/rate_limit.py
Shared slowapi Limiter for the public API.

Lives in its own module so both `app.main` (which registers the limiter on
app.state and installs the RateLimitExceeded handler) and `app.api.chat`
(which decorates the chat route) can import it without a circular import.
Keying is per client IP; storage is in-memory, so limits are per-process —
adequate for the single-instance Railway/Lambda deployment.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

# Requests above this rate (per client IP) get a 429 from the chat endpoint.
CHAT_RATE_LIMIT = getattr(get_settings(), "CHAT_RATE_LIMIT", "10/minute")

limiter = Limiter(key_func=get_remote_address)
