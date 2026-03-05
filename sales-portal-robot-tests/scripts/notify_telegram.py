"""Send Robot Framework test results notification to a Telegram channel."""
from __future__ import annotations

import asyncio
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from telegram import Bot


def _parse_output(output_xml: Path) -> tuple[int, int, int]:
    """Return (total, passed, failed) from output.xml."""
    tree = ET.parse(output_xml)
    root = tree.getroot()
    stats = root.find("./statistics/total/stat")
    if stats is None:
        return 0, 0, 0
    total = int(stats.get("pass", 0)) + int(stats.get("fail", 0))
    passed = int(stats.get("pass", 0))
    failed = int(stats.get("fail", 0))
    return total, passed, failed


async def send_notification(message: str) -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    await Bot(token=token).send_message(chat_id=chat_id, text=message, parse_mode="HTML")


def _build_message(status: str, report_url: str, total: int, passed: int, failed: int) -> str:
    icon = "✅" if status == "passed" else "❌"
    lines = [
        "🤖 <b>Robot Framework Tests</b>",
        f"Status: {icon} {'Passed' if status == 'passed' else 'Failed'}",
        f"Tests: {total} total, {passed} passed, {failed} failed",
    ]
    if report_url:
        lines.append(f"Report: {report_url}")
    return "\n".join(lines)


if __name__ == "__main__":
    _status = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    _report_url = sys.argv[2] if len(sys.argv) > 2 else ""
    _output_xml = Path(sys.argv[3]) if len(sys.argv) > 3 else Path("results/output.xml")

    _total, _passed, _failed = (0, 0, 0)
    if _output_xml.is_file():
        _total, _passed, _failed = _parse_output(_output_xml)

    _msg = _build_message(_status, _report_url, _total, _passed, _failed)
    asyncio.run(send_notification(_msg))
