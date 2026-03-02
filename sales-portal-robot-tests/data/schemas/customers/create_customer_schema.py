"""Customer CRUD response JSON schemas."""

from __future__ import annotations

from typing import Any

from data.schemas.core_schema import OBLIGATORY_FIELDS_SCHEMA, OBLIGATORY_REQUIRED_FIELDS
from data.schemas.customers.customer_schema import CUSTOMER_SCHEMA

CREATE_CUSTOMER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Customer": CUSTOMER_SCHEMA,
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Customer", *OBLIGATORY_REQUIRED_FIELDS],
}

GET_CUSTOMER_SCHEMA: dict[str, Any] = CREATE_CUSTOMER_SCHEMA

GET_ALL_CUSTOMERS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Customers": {
            "type": "array",
            "items": CUSTOMER_SCHEMA,
        },
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Customers", *OBLIGATORY_REQUIRED_FIELDS],
}
