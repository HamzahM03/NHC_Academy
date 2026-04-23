from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Expense
from schemas import ExpenseCreate, ExpenseResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse)
def create_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    new_expense = Expense(
        coach_id=current_coach.id,
        description=expense_data.description,
        amount=expense_data.amount,
        expense_date=expense_data.expense_date
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Expense).filter(Expense.coach_id == current_coach.id).all()