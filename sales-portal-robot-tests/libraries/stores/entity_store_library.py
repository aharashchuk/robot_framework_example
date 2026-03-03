"""RF keyword library for tracking entity IDs during test execution."""
from __future__ import annotations

from robot.api.deco import keyword, library


@library(scope="TEST")
class EntityStoreLibrary:
    """Per-test entity ID store for deterministic cleanup in teardown."""

    def __init__(self) -> None:
        self._products: set[str] = set()
        self._customers: set[str] = set()
        self._orders: set[str] = set()

    @keyword("Track Product")
    def track_product(self, product_id: str) -> None:
        self._products.add(product_id)

    @keyword("Track Customer")
    def track_customer(self, customer_id: str) -> None:
        self._customers.add(customer_id)

    @keyword("Track Order")
    def track_order(self, order_id: str) -> None:
        self._orders.add(order_id)

    @keyword("Get Tracked Products")
    def get_tracked_products(self) -> list[str]:
        return list(self._products)

    @keyword("Get Tracked Customers")
    def get_tracked_customers(self) -> list[str]:
        return list(self._customers)

    @keyword("Get Tracked Orders")
    def get_tracked_orders(self) -> list[str]:
        return list(self._orders)

    @keyword("Clear Entity Store")
    def clear_entity_store(self) -> None:
        self._products.clear()
        self._customers.clear()
        self._orders.clear()
