"""Manufacturers enum — mirrors backend MANUFACTURERS enum."""

from __future__ import annotations

from data.enums._compat import StrEnum


class Manufacturers(StrEnum):
    APPLE = "Apple"
    SAMSUNG = "Samsung"
    GOOGLE = "Google"
    MICROSOFT = "Microsoft"
    SONY = "Sony"
    XIAOMI = "Xiaomi"
    AMAZON = "Amazon"
    TESLA = "Tesla"
