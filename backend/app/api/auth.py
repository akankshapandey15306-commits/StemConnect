
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import get_current_admin
from app.models.admin import Admin
from app.database import get_db
from app.models.admin import Admin
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])


@router.post("/login")
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    admin = (
        db.query(Admin)
        .filter(Admin.email == form_data.username)
        .first()
    )

    if (
        admin is None
        or not admin.is_active
        or not verify_password(form_data.password, admin.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(admin.id))

    return {
        "access_token": token,
        "token_type": "bearer",
    }

@router.get("/me")
def get_admin_profile(
    current_admin: Admin = Depends(get_current_admin),
):
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "is_active": current_admin.is_active,
    }