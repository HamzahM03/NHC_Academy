from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Guardian
from schemas import GuardianCreate, GuardianResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/guardians", tags=["guardians"])


@router.post("/", response_model=GuardianResponse)
def create_guardian(guardian_data: GuardianCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    new_guardian = Guardian(
        coach_id=current_coach.id,
        first_name=guardian_data.first_name,
        last_name=guardian_data.last_name,
        phone=guardian_data.phone
    )
    db.add(new_guardian)
    db.commit()
    db.refresh(new_guardian)
    return new_guardian


@router.get("/", response_model=List[GuardianResponse])
def get_guardians(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Guardian).filter(Guardian.coach_id == current_coach.id).all()


@router.get("/{guardian_id}", response_model=GuardianResponse)
def get_guardian(guardian_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.coach_id == current_coach.id
    ).first()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return guardian


@router.delete("/{guardian_id}")
def delete_guardian(guardian_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    guardian = db.query(Guardian).filter(
        Guardian.id == guardian_id,
        Guardian.coach_id == current_coach.id
    ).first()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    db.delete(guardian)
    db.commit()
    return {"message": "Guardian deleted"}