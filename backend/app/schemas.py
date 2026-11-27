"""Pydantic request and response models.

One pair per entity in the approved data model, plus the placeholder every
generated route returns until it has been implemented. Every model is an ApiModel,
so its JSON uses camelCase names (app/api_model.py).
"""

from pydantic import EmailStr, Field

from app.api_model import ApiModel


class StubResponse(ApiModel):
    """What a generated route returns until someone implements it.

    A stub that returns a typed body rather than raising keeps the service
    startable and its OpenAPI document complete, so the frontend can be built
    against the agreed shape while the handlers are still being written.
    """

    endpoint: str
    status: str = "not_implemented"
    detail: str = "Scaffolded from the approved API spec; no behaviour yet."


class UserCreate(ApiModel):
    email: str
    role: str


class UserRead(ApiModel):
    id: str
    email: str
    role: str


class IdeaRead(ApiModel):
    """One idea as shown on the public board (US-001)."""

    id: str
    title: str
    description: str
    upvote_count: int


class RegisterRequest(ApiModel):
    """POST /auth/register body: the email and password a visitor chooses (AC-006).

    A malformed email or a password shorter than the stated rules is rejected here,
    by FastAPI's own 422 validation response, before any handler runs (AC-008).
    """

    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=8)


class RegisterResponse(ApiModel):
    """The account POST /auth/register created; never the password or its hash."""

    id: str
    email: str
