"""Order Pydantic models."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel

from data.models.customer import Customer


class OrderProduct(BaseModel):
    """A product line item inside an order."""

    id: str  # _id
    name: str
    amount: int
    price: int
    manufacturer: str
    notes: str
    received: bool

    model_config = {"populate_by_name": True}


class DeliveryAddress(BaseModel):
    """Delivery address sub-object."""

    country: str
    city: str
    street: str
    house: int
    flat: int


class Delivery(BaseModel):
    """Delivery info attached to an order."""

    address: DeliveryAddress
    condition: str
    final_date: str  # finalDate from backend

    model_config = {"populate_by_name": True}


class DeliveryData(BaseModel):
    """Payload for scheduling / editing delivery."""

    address: DeliveryAddress
    condition: str
    final_date: str  # sent as finalDate

    model_config = {"populate_by_name": True}


class Comment(BaseModel):
    """Order comment."""

    id: str  # _id
    text: str
    created_on: str  # createdOn

    model_config = {"populate_by_name": True}


class OrderData(BaseModel):
    """Payload for creating an order."""

    customer: str  # customer _id
    products: list[str]  # list of product _ids


class Order(BaseModel):
    """Full order as returned by the backend."""

    id: str  # _id
    status: str
    customer: Customer
    products: list[OrderProduct]
    total_price: float
    created_on: str  # createdOn
    comments: list[Comment]
    delivery: Delivery | None = None
    assigned_manager: dict[str, Any] | None = None  # assignedManager (User)

    model_config = {"populate_by_name": True}


__all__ = [
    "Comment",
    "Delivery",
    "DeliveryAddress",
    "DeliveryData",
    "Order",
    "OrderData",
    "OrderProduct",
]
