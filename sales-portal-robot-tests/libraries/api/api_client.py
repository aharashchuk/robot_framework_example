"""ApiClientLibrary — wraps requests.Session; logs to log.html; masks secrets."""
from __future__ import annotations

import json
import re

import requests
from robot.api import logger
from robot.api.deco import keyword, library

from libraries.api.response import ApiResponse

_SECRET_PATTERN = re.compile(r'"(password|token|Authorization)":\s*"[^"]*"', re.IGNORECASE)


def _mask_secrets(text: str) -> str:
    return _SECRET_PATTERN.sub(lambda m: f'"{m.group(1)}": "***"', text)


@library(scope="GLOBAL")
class ApiClientLibrary:
    """Low-level HTTP client keyword library — wraps requests.Session."""

    def __init__(self) -> None:
        self._session = requests.Session()

    @keyword("Send API Request")
    def send_api_request(
        self,
        method: str,
        url: str,
        token: str | None = None,
        body: dict | None = None,  # type: ignore[type-arg]
        params: dict | None = None,  # type: ignore[type-arg]
    ) -> ApiResponse:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        logger.info(f"{method.upper()} {url}")
        if body:
            logger.debug(f"Request Body: {_mask_secrets(json.dumps(body, indent=2))}")

        resp = self._session.request(
            method=method.upper(),
            url=url,
            headers=headers,
            json=body,
            params=params,
        )
        response = ApiResponse(
            status=resp.status_code,
            body=resp.json() if resp.text else {},
            headers=dict(resp.headers),
            text=resp.text,
        )
        logger.info(
            f"Response {response.status}: "
            f"{_mask_secrets(json.dumps(response.body, indent=2))}"
        )
        return response
