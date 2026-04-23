from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Payment, Expense
from schemas import ProfitResponse
from routers.auth import get_current_coach
from decimal import Decimal

router = APIRouter(prefix="/profit", tags=["profit"])


@router.get("/", response_model=ProfitResponse)
def get_profit(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    total_payments = db.query(func.sum(Payment.amount)).filter(
        Payment.coach_id == current_coach.id
    ).scalar() or Decimal("0")

    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.coach_id == current_coach.id
    ).scalar() or Decimal("0")

    profit = total_payments - total_expenses

    return {
        "total_payments": total_payments,
        "total_expenses": total_expenses,
        "profit": profit
    }