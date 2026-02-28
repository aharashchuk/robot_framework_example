"""Create product response JSON schema."""

from __future__ import annotations

from typing import Any

from data.schemas.core_schema import OBLIGATORY_FIELDS_SCHEMA, OBLIGATORY_REQUIRED_FIELDS
from data.schemas.products.product_schema import PRODUCT_SCHEMA

CREATE_PRODUCT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Product": PRODUCT_SCHEMA,
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Product", *OBLIGATORY_REQUIRED_FIELDS],
}

# GET response has the same structure as CREATE
GET_PRODUCT_SCHEMA: dict[str, Any] = CREATE_PRODUCT_SCHEMA
