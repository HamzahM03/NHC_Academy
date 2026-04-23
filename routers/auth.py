from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from database import get_db
from models import Coach
from schemas import CoachCreate, CoachResponse, Token

router = APIRouter(prefix="/auth", tags=["auth"])

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# jwt config
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(coach_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": coach_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_coach(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Coach:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        coach_id = payload.get("sub")
        if not coach_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=401, detail="Coach not found")
    return coach


@router.post("/register", response_model=CoachResponse)
def register(coach_data: CoachCreate, db: Session = Depends(get_db)):
    if db.query(Coach).filter(Coach.email == coach_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_coach = Coach(
        first_name=coach_data.first_name,
        last_name=coach_data.last_name,
        email=coach_data.email,
        password_hash=hash_password(coach_data.password),
        program_name=coach_data.program_name
    )
    db.add(new_coach)
    db.commit()
    db.refresh(new_coach)
    return new_coach


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    coach = db.query(Coach).filter(Coach.email == form_data.username).first()
    if not coach or not verify_password(form_data.password, coach.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(coach.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=CoachResponse)
def me(current_coach: Coach = Depends(get_current_coach)):
    return current_coach