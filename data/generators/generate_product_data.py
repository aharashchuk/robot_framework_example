"""Product data generator."""

from __future__ import annotations

import random

from faker import Faker

from data.enums.manufacturers import Manufacturers
from data.models.product import ProductData

_faker = Faker()


def generate_product_data(
    name: str | None = None,
    amount: int | None = None,
    price: int | None = None,
    manufacturer: str | None = None,
    notes: str | None = None,
) -> ProductData:
    """Generate a valid ProductData instance with optional field overrides."""
    return ProductData(
        name=name or _faker.unique.bothify(text="Product ????####"),
        amount=amount if amount is not None else random.randint(0, 999),
        price=price if price is not None else random.randint(1, 99999),
        manufacturer=manufacturer or random.choice(list(Manufacturers)),
        notes=notes,
    )
