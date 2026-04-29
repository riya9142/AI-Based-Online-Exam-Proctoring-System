from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

router = APIRouter()

# =========================
# Request Models
# =========================
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str
    face_data: str

class UserLogin(BaseModel):
    email: str
    password: str


# =========================
# REGISTER
# =========================
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role,
        face_data=user.face_data   # 🔥 SAVE FACE
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user or existing_user.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "role": existing_user.role,
        "name": existing_user.name,
        "email": existing_user.email,
   "face_data": existing_user.face_data
    }