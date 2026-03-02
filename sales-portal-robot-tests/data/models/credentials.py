"""Credentials Pydantic model."""

from __future__ import annotations

from pydantic import BaseModel


class Credentials(BaseModel):
    """Login credentials payload."""

    username: str
    password: str
