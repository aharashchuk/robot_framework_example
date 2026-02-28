"""Order status enum — mirrors backend ORDER_STATUSES enum."""

from __future__ import annotations

from data.enums._compat import StrEnum


class OrderStatus(StrEnum):
    DRAFT = "Draft"
    IN_PROCESS = "In Process"
    PARTIALLY_RECEIVED = "Partially Received"
    RECEIVED = "Received"
    CANCELED = "Canceled"


class OrderHistoryAction(StrEnum):
    CREATED = "Order created"
    CUSTOMER_CHANGED = "Customer changed"
    REQUIRED_PRODUCTS_CHANGED = "Requested products changed"
    PROCESSED = "Order processing started"
    DELIVERY_SCHEDULED = "Delivery Scheduled"
    DELIVERY_EDITED = "Delivery Edited"
    RECEIVED = "Received"
    RECEIVED_ALL = "All products received"
    CANCELED = "Order canceled"
    MANAGER_ASSIGNED = "Manager Assigned"
    MANAGER_UNASSIGNED = "Manager Unassigned"
    REOPENED = "Order reopened"
