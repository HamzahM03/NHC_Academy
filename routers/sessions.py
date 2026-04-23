from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Session as SessionModel
from schemas import SessionCreate, SessionResponse
from routers.auth import get_current_coach
from typing import List
from datetime import date

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/", response_model=SessionResponse)
def create_session(session_data: SessionCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    new_session = SessionModel(
        coach_id=current_coach.id,
        title=session_data.title,
        session_date=session_data.session_date,
        status="scheduled"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.get("/", response_model=List[SessionResponse])
def get_sessions(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(SessionModel).filter(
        SessionModel.coach_id == current_coach.id
    ).order_by(SessionModel.session_date.desc()).all()


@router.get("/today", response_model=SessionResponse)
def get_today_session(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    today = date.today()
    session = db.query(SessionModel).filter(
        SessionModel.coach_id == current_coach.id,
        SessionModel.session_date == today,
        SessionModel.status == "scheduled"
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="No session today")
    return session


@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.coach_id == current_coach.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}/complete")
def complete_session(session_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.coach_id == current_coach.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.status = "completed"
    db.commit()
    return {"message": "Session completed"}