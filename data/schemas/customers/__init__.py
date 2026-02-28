"""Customers schema package."""

from data.schemas.customers.create_customer_schema import (
    CREATE_CUSTOMER_SCHEMA,
    GET_ALL_CUSTOMERS_SCHEMA,
    GET_CUSTOMER_SCHEMA,
)
from data.schemas.customers.customer_schema import CUSTOMER_SCHEMA

__all__ = [
    "CREATE_CUSTOMER_SCHEMA",
    "CUSTOMER_SCHEMA",
    "GET_ALL_CUSTOMERS_SCHEMA",
    "GET_CUSTOMER_SCHEMA",
]
