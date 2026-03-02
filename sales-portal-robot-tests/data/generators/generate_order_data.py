"""Order data generator."""

from __future__ import annotations

import random

from data.models.order import OrderData
from variables.constants import MAX_PRODUCTS_PER_ORDER, MIN_PRODUCTS_PER_ORDER


def generate_order_data(
    customer_id: str,
    product_ids: list[str],
    num_products: int | None = None,
) -> OrderData:
    """Generate a valid OrderData instance.

    Args:
        customer_id: The ``_id`` of the customer to associate the order with.
        product_ids: Pool of available product ``_id`` values to pick from.
        num_products: Number of products to include; defaults to a random count
                      between ``MIN_PRODUCTS_PER_ORDER`` and
                      ``MAX_PRODUCTS_PER_ORDER``.
    """
    count = num_products if num_products is not None else random.randint(MIN_PRODUCTS_PER_ORDER, MAX_PRODUCTS_PER_ORDER)
    chosen = random.sample(product_ids, min(count, len(product_ids)))
    return OrderData(customer=customer_id, products=chosen)
