"""Products API keyword library — Phase 6."""
from __future__ import annotations

from typing import cast

from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

import variables.api_config as api
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse


@library(scope="SUITE")
class ProductsApiLibrary:
    """Keywords for /api/products endpoints."""

    @property
    def _client(self) -> ApiClientLibrary:
        return cast(ApiClientLibrary, BuiltIn().get_library_instance("ApiClient"))

    @keyword("Create Product")
    def create_product(self, token: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(ApiResponse, self._client.send_api_request("POST", api.PRODUCTS, token=token, body=body))

    @keyword("Get Product By Id")
    def get_product_by_id(self, token: str, product_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.product_by_id(product_id), token=token))

    @keyword("Get All Products")
    def get_all_products(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.PRODUCTS_ALL, token=token))

    @keyword("Get Products List")
    def get_products_list(self, token: str, params: dict | None = None) -> ApiResponse:  # type: ignore[type-arg]
        return cast(ApiResponse, self._client.send_api_request("GET", api.PRODUCTS, token=token, params=params))

    @keyword("Update Product")
    def update_product(self, token: str, product_id: str, body: dict) -> ApiResponse:  # type: ignore[type-arg]
        return cast(
            ApiResponse,
            self._client.send_api_request("PUT", api.product_by_id(product_id), token=token, body=body),
        )

    @keyword("Delete Product")
    def delete_product(self, token: str, product_id: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("DELETE", api.product_by_id(product_id), token=token))
