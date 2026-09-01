from fastapi import APIRouter, Depends, HTTPException, status

from app.auth_deps import CurrentUser, get_current_user
from app.db.users import create_user, get_user_by_email, get_user_by_id
from app.models.auth import LoginRequest, MeOut, SignupRequest, TokenResponse
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest):
    if get_user_by_email(body.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = create_user(
        email=body.email, password_hash=hash_password(body.password), role=body.role, display_name=body.display_name
    )
    token = create_access_token(user_id=user["user_id"], email=user["email"], role=user["role"])
    return TokenResponse(access_token=token, user_id=user["user_id"], role=user["role"])


@router.get("/me", response_model=MeOut)
def me(user: CurrentUser = Depends(get_current_user)):
    row = get_user_by_id(user.user_id)
    return MeOut(
        user_id=user.user_id,
        email=user.email,
        display_name=row.get("display_name") if row else None,
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user_id=user["user_id"], email=user["email"], role=user["role"])
    return TokenResponse(access_token=token, user_id=user["user_id"], role=user["role"])
