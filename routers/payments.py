from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Payment, Participant
from schemas import PaymentCreate, PaymentResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    participant = db.query(Participant).filter(
        Participant.id == payment_data.participant_id,
        Participant.coach_id == current_coach.id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    new_payment = Payment(
        coach_id=current_coach.id,
        participant_id=payment_data.participant_id,
        amount=payment_data.amount,
        method=payment_data.method
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


@router.get("/", response_model=List[PaymentResponse])
def get_payments(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Payment).filter(Payment.coach_id == current_coach.id).all()


@router.get("/participant/{participant_id}", response_model=List[PaymentResponse])
def get_payments_for_participant(participant_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Payment).filter(
        Payment.participant_id == participant_id,
        Payment.coach_id == current_coach.id
    ).all()