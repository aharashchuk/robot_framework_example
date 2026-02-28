"""Product Pydantic models."""

from __future__ import annotations

from pydantic import BaseModel


class ProductData(BaseModel):
    """Payload for creating / updating a product."""

    name: str
    amount: int
    price: int
    manufacturer: str
    notes: str | None = None


class Product(ProductData):
    """Full product as returned by the backend (includes _id and createdOn)."""

    id: str  # mapped from _id
    created_on: str | None = None  # mapped from createdOn

    model_config = {"populate_by_name": True}
