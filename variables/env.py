"""RF Variable file — loads .env and exports environment variables as RF variables."""
from __future__ import annotations

import json
import os

from dotenv import load_dotenv

load_dotenv(".env.dev" if os.getenv("TEST_ENV") == "dev" else ".env")

SALES_PORTAL_URL: str = os.environ.get("SALES_PORTAL_URL", "http://localhost:8585")
SALES_PORTAL_API_URL: str = os.environ.get("SALES_PORTAL_API_URL", "http://localhost:8686")
USER_NAME: str = os.environ.get("USER_NAME", "admin@example.com")
USER_PASSWORD: str = os.environ.get("USER_PASSWORD", "admin123")
MANAGER_IDS: list[str] = json.loads(os.environ.get("MANAGER_IDS", "[]"))
STORAGE_STATE_PATH: str = os.getenv("STORAGE_STATE_PATH", "src/.auth/user.json")
HEADLESS: bool = os.getenv("HEADLESS", "True").lower() == "true"
BROWSER: str = os.getenv("BROWSER", "chromium")
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

CREDENTIALS: dict[str, str] = {"username": USER_NAME, "password": USER_PASSWORD}
