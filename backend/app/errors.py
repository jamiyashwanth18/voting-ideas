"""Error codes this story's endpoints return, beyond FastAPI's own 422 validation body.

One constant per error: its HTTP status and the message shown to the caller. A route
lists these in `responses=` so the OpenAPI document carries them; a handler raises one
as `HTTPException(CODE.status, CODE.message)`.
"""

from dataclasses import dataclass

from fastapi import status


@dataclass(frozen=True)
class ErrorCode:
    status: int
    message: str


# POST /auth/register (AC-007): the email on the request already has an account.
EMAIL_ALREADY_REGISTERED = ErrorCode(status.HTTP_409_CONFLICT, "This email is already registered.")

# POST /auth/login (AC-011, NFR-005): an incorrect password or an unknown email, worded
# so neither field is named as the one that was wrong, and no session is started.
INVALID_CREDENTIALS = ErrorCode(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

# GET /auth/me (AC-012, NFR-002): the token is missing, revoked, or its session has
# expired from inactivity.
SESSION_EXPIRED = ErrorCode(
    status.HTTP_401_UNAUTHORIZED, "Your session has expired. Please log in again."
)
