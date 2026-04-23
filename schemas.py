from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


# ── Auth ──────────────────────────────────────────────────────────────────────

class CoachCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: EmailStr
    password: str
    program_name: str

class CoachResponse(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str]
    email: str
    program_name: str
    created_at: datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str


# ── Guardian ──────────────────────────────────────────────────────────────────

class GuardianCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str

class GuardianResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Participant ───────────────────────────────────────────────────────────────

class ParticipantCreate(BaseModel):
    guardian_id: str
    first_name: str
    last_name: str

class ParticipantResponse(BaseModel):
    id: str
    guardian_id: str
    first_name: str
    last_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Package ───────────────────────────────────────────────────────────────────

class PackageCreate(BaseModel):
    participant_id: str
    name: str
    sessions_total: int
    price: Decimal

class PackageResponse(BaseModel):
    id: str
    participant_id: str
    name: str
    sessions_total: int
    sessions_remaining: int
    price: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Session ───────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    title: str
    session_date: date

class SessionResponse(BaseModel):
    id: str
    title: str
    session_date: date
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    session_id: str
    participant_id: str
    package_id: str

class AttendanceResponse(BaseModel):
    id: str
    session_id: str
    participant_id: str
    package_id: str
    amount: Decimal
    checked_in_at: datetime

    model_config = {"from_attributes": True}


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    participant_id: str
    amount: Decimal
    method: str

class PaymentResponse(BaseModel):
    id: str
    participant_id: str
    amount: Decimal
    method: str
    paid_at: datetime

    model_config = {"from_attributes": True}


# ── Expense ───────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    description: str
    amount: Decimal
    expense_date: date

class ExpenseResponse(BaseModel):
    id: str
    description: str
    amount: Decimal
    expense_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Profit ────────────────────────────────────────────────────────────────────

class ProfitResponse(BaseModel):
    total_payments: Decimal
    total_expenses: Decimal
    profit: Decimal