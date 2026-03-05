"""RF keyword library for network request mocking via Browser Library JS extension."""
from __future__ import annotations

import json
from pathlib import Path
from typing import cast

from Browser import Browser
from robot.api.deco import keyword, library
from robot.libraries.BuiltIn import BuiltIn

_EXTENSION_JS = Path(__file__).parent / "mock_extension.js"


@library(scope="TEST")
class MockLibrary:
    """Keywords for Browser Library network interception and response mocking.

    Uses a Playwright JS extension (``mock_extension.js``) to intercept HTTP requests at the
    network level via ``page.route()`` / ``route.fulfill()``.  The Browser Library must be
    imported and an active browser page must exist before calling any mock keyword.
    """

    def __init__(self) -> None:
        self._extension_loaded = False

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _browser(self) -> Browser:
        return cast(Browser, BuiltIn().get_library_instance("Browser"))

    def _ensure_extension(self) -> None:
        if not self._extension_loaded:
            self._browser().init_js_extension(str(_EXTENSION_JS))
            self._extension_loaded = True

    def _route(self, url: str, body: str, status: int = 200) -> None:
        self._ensure_extension()
        self._browser().call_js_keyword(
            "routeMockResponse",
            url=url,
            body=body,
            status=status,
            contentType="application/json",
        )

    def _route_regex(self, regex_str: str, body: str, status: int = 200) -> None:
        self._ensure_extension()
        self._browser().call_js_keyword(
            "routeMockResponseRegex",
            regexStr=regex_str,
            body=body,
            status=status,
            contentType="application/json",
        )

    # ------------------------------------------------------------------
    # Public mock keywords
    # ------------------------------------------------------------------

    @keyword("Mock Get All Orders")
    def mock_get_all_orders(self, orders: list[dict[str, object]]) -> None:
        """Intercepts ``GET /api/orders?…`` (with query params) and returns a mocked orders list."""
        body = json.dumps(
            {
                "IsSuccess": True,
                "ErrorMessage": None,
                "Orders": orders,
                "total": len(orders),
                "page": 1,
                "limit": 10,
                "search": "",
                "status": [],
                "sorting": {"sortField": "createdOn", "sortOrder": "desc"},
            }
        )
        self._route_regex(r"\/api\/orders\?", body)

    @keyword("Mock Get All Products")
    def mock_get_all_products(self, products: list[dict[str, object]]) -> None:
        """Intercepts ``GET /api/products/all`` and returns a mocked products list."""
        self._route(
            url="**/api/products/all",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, "Products": products}),
        )

    @keyword("Mock Get All Customers")
    def mock_get_all_customers(self, customers: list[dict[str, object]]) -> None:
        """Intercepts ``GET /api/customers/all`` and returns a mocked customers list."""
        self._route(
            url="**/api/customers/all",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, "Customers": customers}),
        )

    @keyword("Mock Get Metrics")
    def mock_get_metrics(self, metrics: dict[str, object]) -> None:
        """Intercepts ``GET /api/metrics`` and returns mocked metrics."""
        self._route(
            url="**/api/metrics",
            body=json.dumps({"IsSuccess": True, "ErrorMessage": None, **metrics}),
        )

    @keyword("Mock Response")
    def mock_response(self, url: str, body: dict[str, object], status: int = 200) -> None:
        """Generic keyword — intercepts *url* (glob pattern) and responds with *body* dict."""
        self._route(url=url, body=json.dumps(body), status=status)

    @keyword("Mock Response With Status")
    def mock_response_with_status(self, url: str, body: dict[str, object], status: int) -> None:
        """Intercepts *url* (glob pattern) and responds with *body* dict and given *status* code."""
        self._route(url=url, body=json.dumps(body), status=status)

    @keyword("Mock Create Order Response")
    def mock_create_order_response(self, body: dict[str, object], status: int = 201) -> None:
        """Intercepts ``POST /api/orders`` and returns the given *body* with *status* code."""
        self._route(url="**/api/orders", body=json.dumps(body), status=status)

    @keyword("Mock Order By Id Response")
    def mock_order_by_id_response(
        self, body: dict[str, object], order_id: str, status: int = 200
    ) -> None:
        """Intercepts ``GET/PUT /api/orders/:id/`` and returns the given *body* with *status* code.

        The frontend sends requests with a trailing slash (``/api/orders/:id/``).
        """
        self._route(url=f"**/api/orders/{order_id}/", body=json.dumps(body), status=status)

    @keyword("Clear All Mocks")
    def clear_all_mocks(self) -> None:
        """Removes all active Playwright route handlers from the current page."""
        self._ensure_extension()
        self._browser().call_js_keyword("unrouteAll")
