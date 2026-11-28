"""Admin-only actions (US-004): deactivating a user's account.

POST /admin/users/{id}/deactivate marks the account inactive, so it can no longer log
in (AC-010, NFR-004, app/auth.py's `authenticate`), and ends any session it already
holds, so a token issued before the deactivation stops working on the very next call
that needs login. Only a signed-in admin may call this; anyone else is refused as 403,
and the target account is left untouched.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api_model import ApiModel
from app.auth import ADMIN_ROLE, current_user
from app.database import get_db
from app.models import User, UserSession

router = APIRouter(prefix="/admin", tags=["Admin"])

_NOT_ADMIN_STATUS = 403
_NOT_ADMIN_MESSAGE = "Only an admin may do this."
_NOT_FOUND_STATUS = 404
_NOT_FOUND_MESSAGE = "User not found."


class DeactivateUserResponse(ApiModel):
    id: str
    is_active: bool


@router.post(
    "/users/{id}/deactivate",
    responses={
        _NOT_ADMIN_STATUS: {"description": _NOT_ADMIN_MESSAGE},
        _NOT_FOUND_STATUS: {"description": _NOT_FOUND_MESSAGE},
    },
)
def deactivate_user(
    id: str,
    admin: Annotated[User, Depends(current_user)],
    session: Annotated[Session, Depends(get_db)],
) -> DeactivateUserResponse:
    """Deactivates the account at `id`, so it is refused at the next login (AC-010,
    NFR-004) and ends whatever session it already holds, so a token already issued
    stops working right away. Only an admin may call this; anyone else is refused as
    403, and the target account is left untouched. An `id` that matches no user is
    refused as 404.
    """
    if admin.role != ADMIN_ROLE:
        raise HTTPException(_NOT_ADMIN_STATUS, _NOT_ADMIN_MESSAGE)
    user = session.get(User, id)
    if user is None:
        raise HTTPException(_NOT_FOUND_STATUS, _NOT_FOUND_MESSAGE)
    user.is_active = False
    session.query(UserSession).filter(UserSession.user_id == user.id).delete()
    session.commit()
    return DeactivateUserResponse(id=user.id, is_active=user.is_active)
