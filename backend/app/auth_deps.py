from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.security import decode_access_token

_bearer = HTTPBearer()
_bearer_optional = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: str, email: str, role: str):
        self.user_id = user_id
        self.email = email
        self.role = role


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> CurrentUser:
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return CurrentUser(user_id=payload["sub"], email=payload["email"], role=payload["role"])


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
) -> CurrentUser | None:
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    return CurrentUser(user_id=payload["sub"], email=payload["email"], role=payload["role"])


def require_student(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student role required")
    return user


def require_pi(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "pi":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="PI role required")
    return user
