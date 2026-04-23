from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Participant, Guardian
from schemas import ParticipantCreate, ParticipantResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/participants", tags=["participants"])


@router.post("/", response_model=ParticipantResponse)
def create_participant(participant_data: ParticipantCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    guardian = db.query(Guardian).filter(
        Guardian.id == participant_data.guardian_id,
        Guardian.coach_id == current_coach.id
    ).first()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")

    new_participant = Participant(
        coach_id=current_coach.id,
        guardian_id=participant_data.guardian_id,
        first_name=participant_data.first_name,
        last_name=participant_data.last_name
    )
    db.add(new_participant)
    db.commit()
    db.refresh(new_participant)
    return new_participant


@router.get("/", response_model=List[ParticipantResponse])
def get_participants(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Participant).filter(Participant.coach_id == current_coach.id).all()


@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(participant_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.coach_id == current_coach.id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


@router.delete("/{participant_id}")
def delete_participant(participant_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.coach_id == current_coach.id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    db.delete(participant)
    db.commit()
    return {"message": "Participant deleted"}