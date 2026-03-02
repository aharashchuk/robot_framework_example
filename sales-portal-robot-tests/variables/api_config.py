"""RF Variable file — API endpoint URL constants and builder functions."""
from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv(".env.dev" if os.getenv("TEST_ENV") == "dev" else ".env")

_BASE_URL: str = os.environ.get("SALES_PORTAL_API_URL", "http://localhost:8686")

# Static endpoint constants (become RF variables when loaded as variable file)
LOGIN: str = f"{_BASE_URL}/api/login"
LOGOUT: str = f"{_BASE_URL}/api/logout"
PRODUCTS: str = f"{_BASE_URL}/api/products"
PRODUCTS_ALL: str = f"{_BASE_URL}/api/products/all"
CUSTOMERS: str = f"{_BASE_URL}/api/customers"
CUSTOMERS_ALL: str = f"{_BASE_URL}/api/customers/all"
ORDERS: str = f"{_BASE_URL}/api/orders"
NOTIFICATIONS: str = f"{_BASE_URL}/api/notifications"
NOTIFICATIONS_MARK_ALL_READ: str = f"{_BASE_URL}/api/notifications/mark-all-read"
METRICS: str = f"{_BASE_URL}/api/metrics"
USERS: str = f"{_BASE_URL}/api/users"


# Parameterised endpoint builder functions (called from keyword libraries)
def product_by_id(product_id: str) -> str:
    return f"{PRODUCTS}/{product_id}"


def customer_by_id(customer_id: str) -> str:
    return f"{CUSTOMERS}/{customer_id}"


def customer_orders(customer_id: str) -> str:
    return f"{CUSTOMERS}/{customer_id}/orders"


def order_by_id(order_id: str) -> str:
    return f"{ORDERS}/{order_id}"


def order_delivery(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/delivery"


def order_status(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/status"


def order_receive(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/receive"


def order_comments(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/comments"


def order_comment_by_id(order_id: str, comment_id: str) -> str:
    return f"{ORDERS}/{order_id}/comments/{comment_id}"


def assign_manager(order_id: str, manager_id: str) -> str:
    return f"{ORDERS}/{order_id}/assign-manager/{manager_id}"


def unassign_manager(order_id: str) -> str:
    return f"{ORDERS}/{order_id}/unassign-manager"


def notification_read(notification_id: str) -> str:
    return f"{NOTIFICATIONS}/{notification_id}/read"


def user_by_id(user_id: str) -> str:
    return f"{USERS}/{user_id}"


def user_password(user_id: str) -> str:
    return f"{USERS}/password/{user_id}"
