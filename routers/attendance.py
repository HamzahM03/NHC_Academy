from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Attendance, Session as SessionModel, Package, Participant
from schemas import AttendanceCreate, AttendanceResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/", response_model=AttendanceResponse)
def check_in(attendance_data: AttendanceCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    # verify session belongs to coach
    session = db.query(SessionModel).filter(
        SessionModel.id == attendance_data.session_id,
        SessionModel.coach_id == current_coach.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # verify participant belongs to coach
    participant = db.query(Participant).filter(
        Participant.id == attendance_data.participant_id,
        Participant.coach_id == current_coach.id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # verify package belongs to participant and is active
    package = db.query(Package).filter(
        Package.id == attendance_data.package_id,
        Package.participant_id == attendance_data.participant_id,
        Package.status == "active"
    ).first()
    if not package:
        raise HTTPException(status_code=404, detail="No active package found")

    # check not already checked in
    already = db.query(Attendance).filter(
        Attendance.session_id == attendance_data.session_id,
        Attendance.participant_id == attendance_data.participant_id
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Already checked in")

    # calculate amount per session
    amount = package.price / package.sessions_remaining

    # create attendance record
    new_attendance = Attendance(
        session_id=attendance_data.session_id,
        participant_id=attendance_data.participant_id,
        package_id=attendance_data.package_id,
        amount=amount
    )
    db.add(new_attendance)

    # decrement sessions remaining
    package.sessions_remaining -= 1
    if package.sessions_remaining == 0:
        package.status = "expired"

    db.commit()
    db.refresh(new_attendance)
    return new_attendance


@router.get("/session/{session_id}", response_model=List[AttendanceResponse])
def get_session_attendance(session_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    session = db.query(SessionModel).filter(
        SessionModel.id == session_id,
        SessionModel.coach_id == current_coach.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return db.query(Attendance).filter(
        Attendance.session_id == session_id
    ).all()