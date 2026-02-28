"""Order object JSON schemas."""

from __future__ import annotations

from typing import Any

from data.enums.order_status import OrderHistoryAction, OrderStatus
from data.schemas.customers.customer_schema import CUSTOMER_SCHEMA
from data.schemas.delivery.delivery_schema import DELIVERY_INFO_SCHEMA
from data.schemas.users.user_schema import USER_SCHEMA

ORDER_PRODUCT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "name": {"type": "string"},
        "amount": {"type": "number"},
        "price": {"type": "number"},
        "manufacturer": {"type": "string"},
        "notes": {"type": "string"},
        "received": {"type": "boolean"},
    },
    "required": ["_id", "name", "amount", "price", "manufacturer", "notes", "received"],
    "additionalProperties": False,
}

COMMENT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "text": {"type": "string"},
        "createdOn": {"type": "string"},
    },
    "required": ["_id", "text", "createdOn"],
    "additionalProperties": False,
}

PERFORMER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "username": {"type": "string"},
        "firstName": {"type": "string"},
        "lastName": {"type": "string"},
        "roles": {
            "type": "array",
            "items": {"type": "string"},
        },
        "createdOn": {"type": "string"},
    },
    "required": ["_id", "username", "firstName", "lastName", "roles", "createdOn"],
    "additionalProperties": False,
}

ORDER_HISTORY_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "status": {
            "type": "string",
            "enum": list(OrderStatus),
        },
        "customer": {"type": "string"},
        "products": {
            "type": "array",
            "items": ORDER_PRODUCT_SCHEMA,
        },
        "total_price": {"type": "number"},
        "delivery": {
            "anyOf": [DELIVERY_INFO_SCHEMA, {"type": "null"}],
        },
        "assignedManager": {"anyOf": [USER_SCHEMA, {"type": "null"}]},
        "changedOn": {"type": "string"},
        "action": {
            "type": "string",
            "enum": list(OrderHistoryAction),
        },
        "performer": PERFORMER_SCHEMA,
    },
    "required": [
        "status",
        "customer",
        "products",
        "total_price",
        "delivery",
        "assignedManager",
        "changedOn",
        "action",
        "performer",
    ],
    "additionalProperties": False,
}

ORDER_FROM_RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "_id": {"type": "string"},
        "status": {
            "type": "string",
            "enum": list(OrderStatus),
        },
        "customer": CUSTOMER_SCHEMA,
        "products": {
            "type": "array",
            "items": ORDER_PRODUCT_SCHEMA,
        },
        "delivery": {
            "anyOf": [DELIVERY_INFO_SCHEMA, {"type": "null"}],
        },
        "total_price": {"type": "number"},
        "createdOn": {"type": "string"},
        "comments": {
            "type": "array",
            "items": COMMENT_SCHEMA,
        },
        "history": {
            "type": "array",
            "items": ORDER_HISTORY_SCHEMA,
        },
        "assignedManager": {
            "anyOf": [USER_SCHEMA, {"type": "null"}],
        },
    },
    "required": [
        "_id",
        "status",
        "customer",
        "products",
        "total_price",
        "createdOn",
        "comments",
        "history",
        "assignedManager",
        "delivery",
    ],
    "additionalProperties": False,
}
