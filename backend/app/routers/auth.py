"""Self-registration (US-003).

POST /auth/register creates an account from a valid, unused email and a password
meeting the stated rules; the password is stored only as a bcrypt hash and the
account is usable immediately, with no email-verification step (AC-006, AC-009).
A taken email is refused with EMAIL_ALREADY_REGISTERED (AC-007); a malformed email
or a too-short password is refused by the request model itself, as a 422 (AC-008).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import USER_ROLE, ensure_user, find_user
from app.database import get_db
from app.errors import EMAIL_ALREADY_REGISTERED
from app.schemas import RegisterRequest, RegisterResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    status_code=201,
    responses={
        EMAIL_ALREADY_REGISTERED.status: {"description": EMAIL_ALREADY_REGISTERED.message},
    },
)
def register(
    body: RegisterRequest, session: Annotated[Session, Depends(get_db)]
) -> RegisterResponse:
    email = body.email.strip()
    created = ensure_user(session, email=email, password=body.password, role=USER_ROLE)
    if not created:
        raise HTTPException(EMAIL_ALREADY_REGISTERED.status, EMAIL_ALREADY_REGISTERED.message)
    session.commit()
    user = find_user(session, email)
    assert user is not None  # just created, in the same session
    return RegisterResponse(id=user.id, email=user.email)
