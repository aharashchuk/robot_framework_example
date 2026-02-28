"""Product JSON schemas."""

from __future__ import annotations

from typing import Any

from data.enums.manufacturers import Manufacturers

# --------------------------------------------------------------------------- #
# Shared product object schema
# --------------------------------------------------------------------------- #
PRODUCT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "name": {"type": "string"},
        "amount": {"type": "number"},
        "price": {"type": "number"},
        "createdOn": {"type": "string"},
        "notes": {"type": "string"},
        "manufacturer": {
            "type": "string",
            "enum": list(Manufacturers),
        },
    },
    "required": ["_id", "name", "amount", "price", "manufacturer", "createdOn"],
    "additionalProperties": False,
}
