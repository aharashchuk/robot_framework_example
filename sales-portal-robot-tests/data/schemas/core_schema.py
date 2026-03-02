"""Core JSON Schema shared building blocks."""

from __future__ import annotations

from typing import Any

# Shared property definitions (IsSuccess / ErrorMessage)
OBLIGATORY_FIELDS_SCHEMA: dict[str, Any] = {
    "IsSuccess": {"type": "boolean"},
    "ErrorMessage": {"type": ["string", "null"]},
}

OBLIGATORY_REQUIRED_FIELDS: list[str] = ["IsSuccess", "ErrorMessage"]
