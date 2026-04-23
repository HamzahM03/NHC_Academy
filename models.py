from sqlalchemy import Column, String, Integer, Numeric, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4()) 

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(String, primary_key=True, default=generate_uuid)
    first_name = Column(String, nullable=False)
    last_name = Column(String)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    program_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    guardians = relationship("Guardian", back_populates="coach", cascade="all, delete-orphan")
    participants = relationship("Participant", back_populates="coach", cascade="all, delete-orphan")
    packages = relationship("Package", back_populates="coach", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="coach", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="coach", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="coach", cascade="all, delete-orphan")


class Guardian(Base):
    __tablename__ = "guardians"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="guardians")
    participants = relationship("Participant", back_populates="guardian", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    guardian_id = Column(String, ForeignKey("guardians.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="participants")
    guardian = relationship("Guardian", back_populates="participants")
    packages = relationship("Package", back_populates="participant", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="participant", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="participant", cascade="all, delete-orphan")


class Package(Base):
    __tablename__ = "packages"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(String, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    sessions_total = Column(Integer, nullable=False)
    sessions_remaining = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="packages")
    participant = relationship("Participant", back_populates="packages")
    attendance = relationship("Attendance", back_populates="package", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    session_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="scheduled")
    created_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="sessions")
    attendance = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(String, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    package_id = Column(String, ForeignKey("packages.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    checked_in_at = Column(DateTime, server_default=func.now())

    session = relationship("Session", back_populates="attendance")
    participant = relationship("Participant", back_populates="attendance")
    package = relationship("Package", back_populates="attendance")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(String, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(String, nullable=False)
    paid_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="payments")
    participant = relationship("Participant", back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=generate_uuid)
    coach_id = Column(String, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    expense_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    coach = relationship("Coach", back_populates="expenses")