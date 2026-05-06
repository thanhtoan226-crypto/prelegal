from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Response
from jose import jwt

from app.config import settings
from app.deps import DEMO_USER, get_current_user
from app.schemas import AuthResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/signin")
def signin(response: Response):
    token = create_access_token(DEMO_USER.id, DEMO_USER.email)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return AuthResponse(user=DEMO_USER)


@router.post("/signout")
def signout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Signed out"}


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return AuthResponse(user=user)
