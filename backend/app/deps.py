from typing import Annotated

from fastapi import Cookie, HTTPException, status
from jose import JWTError, jwt

from app.config import settings
from app.schemas import UserResponse

DEMO_USER = UserResponse(id=1, email="demo@prelegal.com")


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> UserResponse:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        if user_id_str is None or email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return UserResponse(id=int(user_id_str), email=email)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
