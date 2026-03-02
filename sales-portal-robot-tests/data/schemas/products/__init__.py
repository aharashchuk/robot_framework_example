"""Products schema package."""

from data.schemas.products.create_product_schema import CREATE_PRODUCT_SCHEMA, GET_PRODUCT_SCHEMA
from data.schemas.products.get_all_products_schema import GET_ALL_PRODUCTS_SCHEMA
from data.schemas.products.product_schema import PRODUCT_SCHEMA

__all__ = [
    "CREATE_PRODUCT_SCHEMA",
    "GET_ALL_PRODUCTS_SCHEMA",
    "GET_PRODUCT_SCHEMA",
    "PRODUCT_SCHEMA",
]
