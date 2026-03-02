"""Country enum — mirrors backend COUNTRIES enum."""

from __future__ import annotations

from data.enums._compat import StrEnum


class Country(StrEnum):
    USA = "USA"
    CANADA = "Canada"
    BELARUS = "Belarus"
    UKRAINE = "Ukraine"
    GERMANY = "Germany"
    FRANCE = "France"
    GREAT_BRITAIN = "Great Britain"
    RUSSIA = "Russia"
