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
