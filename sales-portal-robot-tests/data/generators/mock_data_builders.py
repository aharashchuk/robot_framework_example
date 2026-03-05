"""Mock data builder functions for integration / network-interception tests."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone


def build_mock_customer(**overrides: object) -> dict[str, object]:
    """Return a minimal customer dict that mirrors the backend response shape."""
    return {
        "_id": str(uuid.uuid4()),
        "email": "mock.customer@example.com",
        "name": "Mock Customer",
        "country": "USA",
        "city": "MockCity",
        "street": "Mock Street 1",
        "house": 1,
        "flat": 1,
        "phone": "+10000000000",
        "createdOn": datetime.now(timezone.utc).isoformat(),
        "notes": None,
        **overrides,
    }


def build_mock_product(**overrides: object) -> dict[str, object]:
    """Return a minimal product dict that mirrors the backend response shape."""
    return {
        "_id": str(uuid.uuid4()),
        "name": "Mock Product",
        "amount": 10,
        "price": 100,
        "manufacturer": "Samsung",
        "createdOn": datetime.now(timezone.utc).isoformat(),
        "notes": "",
        **overrides,
    }


def build_mock_order(**overrides: object) -> dict[str, object]:
    """Return a minimal order dict that mirrors the backend response shape."""
    return {
        "_id": str(uuid.uuid4()),
        "status": "Draft",
        "customer": build_mock_customer(),
        "products": [],
        "total_price": 0,
        "createdOn": datetime.now(timezone.utc).isoformat(),
        "comments": [],
        "delivery": None,
        "assignedManager": None,
        **overrides,
    }


def build_mock_orders_response(
    count: int = 5,
    sort_field: str = "createdOn",
    sort_order: str = "desc",
) -> dict[str, object]:
    """Return an orders list response envelope with *count* generated mock orders."""
    orders = [build_mock_order() for _ in range(count)]
    return {
        "IsSuccess": True,
        "ErrorMessage": None,
        "Orders": orders,
        "total": count,
        "page": 1,
        "limit": 10,
        "search": "",
        "status": [],
        "sorting": {"sortField": sort_field, "sortOrder": sort_order},
    }
