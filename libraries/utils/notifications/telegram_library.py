"""RF keyword library for sending Telegram notifications (Phase 4)."""

from __future__ import annotations

import asyncio
import logging
import os

from robot.api.deco import keyword, library

logger = logging.getLogger(__name__)


@library(scope="GLOBAL")
class TelegramLibrary:
    """Keywords for sending CI build notifications via Telegram bot.

    If ``TELEGRAM_BOT_TOKEN`` or ``TELEGRAM_CHAT_ID`` are not configured the
    keywords silently skip the send so tests never fail because of a missing
    Telegram integration.
    """

    # ------------------------------------------------------------------
    # Public RF keywords
    # ------------------------------------------------------------------

    @keyword("Send Telegram Message")
    def send_telegram_message(
        self,
        message: str,
        token: str = "",
        chat_id: str = "",
    ) -> None:
        """Send *message* to a Telegram chat via Bot API.

        Falls back to environment variables ``TELEGRAM_BOT_TOKEN`` and
        ``TELEGRAM_CHAT_ID`` when *token* / *chat_id* are not provided.
        Silently skips (with an ``INFO`` log) when either value is still empty.

        Args:
            message: The text to send (Markdown supported by Telegram Bot API).
            token: Telegram Bot API token.  Overrides the env var when provided.
            chat_id: Target chat / channel ID.  Overrides the env var when provided.
        """
        from telegram import Bot

        _token = token or os.getenv("TELEGRAM_BOT_TOKEN", "")
        _chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID", "")

        if not _token or not _chat_id:
            logger.info("TelegramLibrary: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured — skipping send.")
            return

        asyncio.run(Bot(token=_token).send_message(chat_id=_chat_id, text=message))

    @keyword("Send Telegram HTML Message")
    def send_telegram_html_message(
        self,
        message: str,
        token: str = "",
        chat_id: str = "",
    ) -> None:
        """Send *message* formatted as HTML to a Telegram chat.

        Silently skips when credentials are not configured.

        Args:
            message: The HTML text to send.
            token: Telegram Bot API token (falls back to env var).
            chat_id: Target chat / channel ID (falls back to env var).
        """
        from telegram import Bot
        from telegram.constants import ParseMode

        _token = token or os.getenv("TELEGRAM_BOT_TOKEN", "")
        _chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID", "")

        if not _token or not _chat_id:
            logger.info("TelegramLibrary: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured — skipping send.")
            return

        asyncio.run(Bot(token=_token).send_message(chat_id=_chat_id, text=message, parse_mode=ParseMode.HTML))
