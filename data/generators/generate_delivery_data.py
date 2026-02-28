"""Delivery data generator."""

from __future__ import annotations

import random
from datetime import datetime, timedelta

from faker import Faker

from data.enums.country import Country
from data.enums.delivery_condition import DeliveryCondition
from data.models.order import DeliveryAddress, DeliveryData

_faker = Faker()


def generate_delivery_data(
    country: str | None = None,
    city: str | None = None,
    street: str | None = None,
    house: int | None = None,
    flat: int | None = None,
    condition: str | None = None,
    final_date: str | None = None,
    days_offset: int = 7,
) -> DeliveryData:
    """Generate a valid DeliveryData instance with optional field overrides.

    ``final_date`` must be in ``YYYY/MM/DD`` format (backend convention).
    """
    target_date = datetime.now() + timedelta(days=days_offset)
    return DeliveryData(
        address=DeliveryAddress(
            country=country or random.choice(list(Country)),
            city=city or _faker.city()[:20],
            street=street or _faker.street_address()[:40],
            house=house if house is not None else random.randint(1, 999),
            flat=flat if flat is not None else random.randint(1, 9999),
        ),
        condition=condition or random.choice(list(DeliveryCondition)),
        final_date=final_date or target_date.strftime("%Y/%m/%d"),
    )
