"""User Pydantic model."""

from __future__ import annotations

from pydantic import BaseModel


class User(BaseModel):
    """User as returned by the backend."""

    id: str  # _id
    username: str
    first_name: str  # firstName
    last_name: str  # lastName
    roles: list[str]
    created_on: str  # createdOn

    model_config = {"populate_by_name": True}


class CreateUserPayload(BaseModel):
    """Payload for creating a new user."""

    username: str
    password: str
    first_name: str  # firstName
    last_name: str  # lastName

    model_config = {"populate_by_name": True}
