import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

# Configuratie laden
class SecurityConfig:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_do_not_use_in_prod")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production") # Default to production for safety

settings = SecurityConfig()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

class TokenData(BaseModel):
    username: Optional[str] = None

async def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Valideert de OAuth2 Bearer token.
    In DEVELOPMENT mode wordt een mock token geaccepteerd.
    In PRODUCTION mode is strikte validatie vereist.
    """
    
    # 1. Mock Auth voor Development
    if settings.ENVIRONMENT == "development":
        # In dev mode, als er geen token is of het is een dummy waarde, laten we het toe met een waarschuwing
        if not token or token == "mock-token":
            print("[WARN] Development Mode: Mock Auth Active")
            return TokenData(username="dev_user")
    
    # 2. Stricte Validatie (Production / Staging)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Niet geauthenticeerd (Geen token)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ongeldig token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenData(username=username)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kan token niet valideren",
            headers={"WWW-Authenticate": "Bearer"},
        )
