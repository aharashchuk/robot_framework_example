"""RF Variable file — timeouts, viewport, and other constants."""
from __future__ import annotations

# Timeouts in seconds — Browser Library and Wait For Elements State use RF time format (seconds)
DEFAULT_TIMEOUT: int = 30
SHORT_TIMEOUT: int = 5
LONG_TIMEOUT: int = 60
SPINNER_TIMEOUT: int = 10
TOAST_TIMEOUT: int = 5

# Viewport
VIEWPORT_WIDTH: int = 1920
VIEWPORT_HEIGHT: int = 1080

# Orders
MAX_PRODUCTS_PER_ORDER: int = 5
MIN_PRODUCTS_PER_ORDER: int = 1
