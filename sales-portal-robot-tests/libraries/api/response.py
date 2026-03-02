"""ApiResponse dataclass — shared between Phase 4 (validation) and Phase 5 (client)."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ApiResponse:
    """Lightweight wrapper around an HTTP response returned by ApiClientLibrary."""

    status: int
    body: dict  # type: ignore[type-arg]
    headers: dict[str, str] = field(default_factory=dict)
    text: str = ""
