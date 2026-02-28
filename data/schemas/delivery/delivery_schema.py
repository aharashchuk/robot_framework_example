"""Delivery JSON schemas."""

from __future__ import annotations

from typing import Any

from data.enums.delivery_condition import DeliveryCondition

DELIVERY_ADDRESS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "country": {"type": "string"},
        "city": {"type": "string"},
        "street": {"type": "string"},
        "house": {"type": "number"},
        "flat": {"type": "number"},
    },
    "required": ["country", "city", "street", "house", "flat"],
    "additionalProperties": False,
}

DELIVERY_INFO_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "address": DELIVERY_ADDRESS_SCHEMA,
        "finalDate": {"type": "string"},
        "condition": {
            "type": "string",
            "enum": list(DeliveryCondition),
        },
    },
    "required": ["address", "condition", "finalDate"],
    "additionalProperties": False,
}
