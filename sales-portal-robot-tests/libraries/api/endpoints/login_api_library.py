"""Login API keyword library — Phase 6."""
from __future__ import annotations

from typing import cast

from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

import variables.api_config as api
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse


@library(scope="SUITE")
class LoginApiLibrary:
    """Keywords for /api/login and /api/logout."""

    @property
    def _client(self) -> ApiClientLibrary:
        return cast(ApiClientLibrary, BuiltIn().get_library_instance("ApiClient"))

    @keyword("Login User")
    def login_user(self, username: str, password: str) -> ApiResponse:
        return cast(
            ApiResponse,
            self._client.send_api_request(
                "POST", api.LOGIN, body={"username": username, "password": password}
            ),
        )

    @keyword("Logout User")
    def logout_user(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("POST", api.LOGOUT, token=token))
