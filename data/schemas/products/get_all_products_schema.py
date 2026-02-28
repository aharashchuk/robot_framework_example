"""Get all products response JSON schema."""

from __future__ import annotations

from typing import Any

from data.schemas.core_schema import OBLIGATORY_FIELDS_SCHEMA, OBLIGATORY_REQUIRED_FIELDS
from data.schemas.products.product_schema import PRODUCT_SCHEMA

GET_ALL_PRODUCTS_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "Products": {
            "type": "array",
            "items": PRODUCT_SCHEMA,
        },
        **OBLIGATORY_FIELDS_SCHEMA,
    },
    "required": ["Products", *OBLIGATORY_REQUIRED_FIELDS],
}
