"""RF keyword library for API response validation (Phase 4)."""

from __future__ import annotations

import jsonschema
from robot.api.deco import keyword, library

from libraries.api.response import ApiResponse


@library(scope="GLOBAL")
class ValidationLibrary:
    """Soft-assertion keyword library using a collected-errors approach.

    All assertion failures are gathered and raised as a single
    ``AssertionError`` at the end of ``Validate Response``, mirroring the
    ``pytest-check`` / ``assertpy`` soft-assertion behaviour.
    """

    # ------------------------------------------------------------------
    # Public RF keywords
    # ------------------------------------------------------------------

    @keyword("Validate Response")
    def validate_response(
        self,
        response: ApiResponse,
        expected_status: int,
        schema: dict | None = None,  # type: ignore[type-arg]
    ) -> None:
        """Soft-assert HTTP status, ``IsSuccess``, ``ErrorMessage``, and optional JSON schema.

        Args:
            response: An ``ApiResponse`` instance returned by ``Send API Request``.
            expected_status: The expected HTTP status code (e.g. 200, 201, 400).
            schema: Optional JSON Schema dict.  When provided the response body
                    is validated against it and any violation is appended to the
                    error list.

        Raises:
            AssertionError: If any of the checked conditions fail; the message
                            contains *all* individual failures.
        """
        errors: list[str] = []

        # 1 — HTTP status
        if response.status != expected_status:
            errors.append(f"Expected status {expected_status}, got {response.status}. " f"Body: {response.body}")

        # 2 — IsSuccess / ErrorMessage contract
        if expected_status < 400:
            if not response.body.get("IsSuccess", False):
                errors.append(f"Expected IsSuccess=True, got: {response.body.get('IsSuccess')}")
            error_msg = response.body.get("ErrorMessage")
            if error_msg is not None:
                errors.append(f"Expected ErrorMessage=None for successful response, got: '{error_msg}'")
        else:
            if response.body.get("IsSuccess", True):
                errors.append(f"Expected IsSuccess=False on error response, got: {response.body.get('IsSuccess')}")

        # 3 — optional JSON Schema validation
        if schema is not None:
            try:
                jsonschema.validate(instance=response.body, schema=schema)
            except jsonschema.ValidationError as exc:
                errors.append(f"JSON schema validation failed: {exc.message}")

        if errors:
            raise AssertionError("Response validation failed:\n" + "\n".join(f"  - {e}" for e in errors))

    @keyword("Validate Json Schema")
    def validate_json_schema(
        self,
        body: dict,  # type: ignore[type-arg]
        schema: dict,  # type: ignore[type-arg]
    ) -> None:
        """Validate *body* against a JSON Schema *schema* dict.

        Args:
            body: The dict to validate (typically ``response.body``).
            schema: A JSON Schema expressed as a Python dict.

        Raises:
            ``jsonschema.ValidationError``: if the body does not conform to the schema.
        """
        jsonschema.validate(instance=body, schema=schema)
