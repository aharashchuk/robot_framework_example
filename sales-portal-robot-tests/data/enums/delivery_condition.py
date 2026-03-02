"""Delivery condition enum — mirrors backend DELIVERY enum."""

from __future__ import annotations

from data.enums._compat import StrEnum


class DeliveryCondition(StrEnum):
    DELIVERY = "Delivery"
    PICKUP = "Pickup"
