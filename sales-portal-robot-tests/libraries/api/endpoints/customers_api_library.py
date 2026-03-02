"""Customers API keyword library — Phase 6."""
from __future__ import annotations

from typing import cast

from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

import variables.api_config as api
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse


@library(scope="SUITE")
class CustomersApiLibrary:
    """Keywords for /api/customers endpoints."""

    @property
    def _client(self) -> ApiClientLibrary:
        return cast(ApiClientLibrary, BuiltIn().get_library_instance("ApiClient"))

    @keyword("Create Customer")
    def create_customer(self, token: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(ApiResponse, self._client.send_api_request("POST", api.CUSTOMERS, token=token, body=body))

    @keyword("Get Customer By Id")
    def get_customer_by_id(self, token: str, customer_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.customer_by_id(customer_id), token=token))

    @keyword("Get All Customers")
    def get_all_customers(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.CUSTOMERS_ALL, token=token))

    @keyword("Get Customers List")
    def get_customers_list(self, token: str, params: dict | None = None) -> ApiResponse:  # type: ignore[type-arg]
        return cast(ApiResponse, self._client.send_api_request("GET", api.CUSTOMERS, token=token, params=params))

    @keyword("Update Customer")
    def update_customer(self, token: str, customer_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("PUT", api.customer_by_id(customer_id), token=token, body=body),
        )

    @keyword("Delete Customer")
    def delete_customer(self, token: str, customer_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("DELETE", api.customer_by_id(customer_id), token=token))
