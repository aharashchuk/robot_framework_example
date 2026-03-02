"""Order CRUD response JSON schemas."""

from __future__ import annotations

from typing import Any

from data.schemas.core_schema import OBLIGATORY_FIELDS_SCHEMA, OBLIGATORY_REQUIRED_FIELDS
from data.schemas.orders.order_schema import ORDER_FROM_RESPONSE_SCHEMA

CREATE_ORDER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Order": ORDER_FROM_RESPONSE_SCHEMA,
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Order", *OBLIGATORY_REQUIRED_FIELDS],
    "additionalProperties": False,
}

GET_ORDER_SCHEMA: dict[str, Any] = CREATE_ORDER_SCHEMA

GET_ALL_ORDERS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Orders": {
            "type": "array",
            "items": ORDER_FROM_RESPONSE_SCHEMA,
        },
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Orders", *OBLIGATORY_REQUIRED_FIELDS],
}
