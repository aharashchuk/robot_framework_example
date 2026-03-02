"""Customer Pydantic models."""

from __future__ import annotations

from pydantic import BaseModel


class CustomerData(BaseModel):
    """Payload for creating / updating a customer."""

    email: str
    name: str
    country: str
    city: str
    street: str
    house: int
    flat: int
    phone: str
    notes: str | None = None


class Customer(CustomerData):
    """Full customer as returned by the backend (includes _id and createdOn)."""

    id: str  # mapped from _id
    created_on: str | None = None  # mapped from createdOn

    model_config = {"populate_by_name": True}
