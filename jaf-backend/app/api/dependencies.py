"""
/backend/app/api/dependencies.py
Dependencies for FastAPI routing.
"""

from functools import lru_cache
from app.config import get_settings

settings = get_settings()