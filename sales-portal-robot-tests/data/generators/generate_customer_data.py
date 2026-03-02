"""Customer data generator."""

from __future__ import annotations

import random

from faker import Faker

from data.enums.country import Country
from data.models.customer import CustomerData

_faker = Faker()


def _only_letters(text: str, max_len: int) -> str:
    """Keep only alphabetical characters and single spaces, truncate to max_len."""
    cleaned = " ".join("".join(c for c in word if c.isalpha()) for word in text.split())
    return cleaned[:max_len] or "John"


def _alpha_num_space(text: str, max_len: int) -> str:
    """Keep only alphanumeric characters and single spaces, truncate to max_len."""
    cleaned = " ".join("".join(c for c in word if c.isalnum()) for word in text.split())
    return cleaned[:max_len] or "Main"


def _valid_phone() -> str:
    """Generate a phone number starting with + and at least 10 digits."""
    digits = _faker.numerify(text="##############")
    return f"+{digits}"


def generate_customer_data(
    email: str | None = None,
    name: str | None = None,
    country: str | None = None,
    city: str | None = None,
    street: str | None = None,
    house: int | None = None,
    flat: int | None = None,
    phone: str | None = None,
    notes: str | None = None,
) -> CustomerData:
    """Generate a valid CustomerData instance with optional field overrides."""
    raw_name = f"{_faker.first_name()} {_faker.last_name()}"
    raw_city = _faker.city()
    raw_street = f"{_faker.street_name()} {random.randint(1, 99)}"

    return CustomerData(
        email=email or _faker.unique.email(),
        name=name or _only_letters(raw_name, 40),
        country=country or random.choice(list(Country)),
        city=city or _only_letters(raw_city, 20),
        street=street or _alpha_num_space(raw_street, 40),
        house=house if house is not None else random.randint(1, 999),
        flat=flat if flat is not None else random.randint(1, 9999),
        phone=phone or _valid_phone(),
        notes=notes,
    )
