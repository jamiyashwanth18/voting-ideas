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


class IdeaUpdate(ApiModel):
    """PATCH /ideas/{id} body: the author's edited title and description (US-007).

    Same bounds as IdeaCreate (AC-019): an empty title or description, or one over the
    allowed length, is rejected here, by FastAPI's own 422 validation response, before
    any handler runs, and the original idea is left unchanged. Whether the caller may
    edit this idea at all -- only its author may (AC-018, NFR-006) -- is checked in the
    handler, never here: it depends on the signed-in caller and the idea in the
    database, neither of which this model has.
    """

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)


class IdeaCreate(ApiModel):
    """POST /ideas body: a new idea's title and short description (US-006).

    Both fields must be non-empty and within the allowed length (AC-014); an empty
    title or description, or one over the limit, is rejected here, by FastAPI's own
    422 validation response, before any handler runs (AC-015). The author is never
    read from this body: it is always the signed-in caller (app/auth.py's `current_user`).
    """

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)


class VoteResponse(ApiModel):
    """POST /ideas/{id}/vote reply: the idea's upvote count and whether the signed-in
    caller has now upvoted it (AC-022, AC-023), after this call. A caller who had
    already upvoted this idea gets this same shape back, with no change made: the
    count does not grow again, and `voted` stays true (AC-023, NFR-008).
    """

    vote_count: int
    voted: bool


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


class LoginRequest(ApiModel):
    """POST /auth/login body: the email and password for an existing account (AC-010).

    Both fields stay plain strings, not a stricter type: an unknown or malformed email
    must fail the same generic way as a wrong password (AC-011, NFR-005), never as a
    distinct validation error that names the email as the problem.
    """

    email: str
    password: str


class LoginResponse(ApiModel):
    """POST /auth/login reply: the opaque session token (AC-010); never a password or hash."""

    token: str


class CurrentUser(ApiModel):
    """GET /auth/me reply: the signed-in user for a still-valid session token."""

    id: str
    email: str
    role: str
