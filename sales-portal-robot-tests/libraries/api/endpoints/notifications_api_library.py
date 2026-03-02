"""Notifications API keyword library — Phase 6."""
from __future__ import annotations

from typing import cast

from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

import variables.api_config as api
from libraries.api.api_client import ApiClientLibrary
from libraries.api.response import ApiResponse


@library(scope="SUITE")
class NotificationsApiLibrary:
    """Keywords for /api/notifications endpoints."""

    @property
    def _client(self) -> ApiClientLibrary:
        return cast(ApiClientLibrary, BuiltIn().get_library_instance("ApiClient"))

    @keyword("Get Notifications")
    def get_notifications(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("GET", api.NOTIFICATIONS, token=token))

    @keyword("Mark Notification As Read")
    def mark_notification_as_read(self, token: str, notification_id: str) -> ApiResponse:
        return cast(
            ApiResponse,
            self._client.send_api_request("PATCH", api.notification_read(notification_id), token=token),
        )

    @keyword("Mark All Notifications As Read")
    def mark_all_notifications_as_read(self, token: str) -> ApiResponse:
        return cast(ApiResponse, self._client.send_api_request("PATCH", api.NOTIFICATIONS_MARK_ALL_READ, token=token))
