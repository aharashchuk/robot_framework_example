"""Orders API keyword library — Phase 6."""
from __future__ import annotations

from typing import cast

from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

import variables.api_config as api
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse


@library(scope="SUITE")
class OrdersApiLibrary:
    """Keywords for /api/orders endpoints."""

    @property
    def _client(self) -> ApiClientLibrary:
        return cast(ApiClientLibrary, BuiltIn().get_library_instance("ApiClient"))

    @keyword("Create Order")
    def create_order(self, token: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(ApiResponse, self._client.send_api_request("POST", api.ORDERS, token=token, body=body))

    @keyword("Get Order By Id")
    def get_order_by_id(self, token: str, order_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.order_by_id(order_id), token=token))

    @keyword("Get All Orders")
    def get_all_orders(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.ORDERS, token=token))

    @keyword("Update Order")
    def update_order(self, token: str, order_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("PUT", api.order_by_id(order_id), token=token, body=body),
        )

    @keyword("Delete Order")
    def delete_order(self, token: str, order_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("DELETE", api.order_by_id(order_id), token=token))

    @keyword("Add Order Delivery")
    def add_order_delivery(self, token: str, order_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("POST", api.order_delivery(order_id), token=token, body=body),
        )

    @keyword("Update Order Status")
    def update_order_status(self, token: str, order_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("PUT", api.order_status(order_id), token=token, body=body),
        )

    @keyword("Receive Order Products")
    def receive_order_products(self, token: str, order_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("POST", api.order_receive(order_id), token=token, body=body),
        )

    @keyword("Add Order Comment")
    def add_order_comment(self, token: str, order_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("POST", api.order_comments(order_id), token=token, body=body),
        )

    @keyword("Delete Order Comment")
    def delete_order_comment(self, token: str, order_id: str, comment_id: str) -> ApiResponse:
        return cast(
            ApiResponse,
            self._client.send_api_request("DELETE", api.order_comment_by_id(order_id, comment_id), token=token),
        )

    @keyword("Assign Manager To Order")
    def assign_manager_to_order(self, token: str, order_id: str, manager_id: str) -> ApiResponse:
        return cast(
            ApiResponse,
            self._client.send_api_request("PUT", api.assign_manager(order_id, manager_id), token=token),
        )

    @keyword("Unassign Manager From Order")
    def unassign_manager_from_order(self, token: str, order_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("PUT", api.unassign_manager(order_id), token=token))
