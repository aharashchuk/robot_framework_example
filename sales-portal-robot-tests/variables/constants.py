"""RF Variable file — timeouts, viewport, and other constants."""
from __future__ import annotations

# Timeouts (milliseconds — Browser Library uses ms)
DEFAULT_TIMEOUT: int = 30_000
SHORT_TIMEOUT: int = 5_000
LONG_TIMEOUT: int = 60_000
SPINNER_TIMEOUT: int = 10_000
TOAST_TIMEOUT: int = 5_000

# Viewport
VIEWPORT_WIDTH: int = 1920
VIEWPORT_HEIGHT: int = 1080

# Orders
MAX_PRODUCTS_PER_ORDER: int = 5
MIN_PRODUCTS_PER_ORDER: int = 1
