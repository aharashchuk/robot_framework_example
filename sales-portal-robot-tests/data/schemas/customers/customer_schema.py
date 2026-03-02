"""Customer object JSON schema."""

from __future__ import annotations

from typing import Any

from data.enums.country import Country

CUSTOMER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "email": {"type": "string"},
        "name": {"type": "string"},
        "country": {"type": "string", "enum": list(Country)},
        "city": {"type": "string"},
        "street": {"type": "string"},
        "house": {"type": "number"},
        "flat": {"type": "number"},
        "phone": {"type": "string"},
        "createdOn": {"type": "string"},
        "notes": {"type": "string"},
    },
    "required": ["_id", "email", "name", "country", "city", "street", "house", "flat", "phone", "createdOn"],
}
