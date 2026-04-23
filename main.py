from fastapi import FastAPI
from database import engine, Base
import models
from routers import auth, guardians, participants, packages, sessions, attendance, payments,  expenses, profit

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampOps API")

app.include_router(auth.router)
app.include_router(guardians.router)
app.include_router(participants.router)
app.include_router(packages.router)
app.include_router(sessions.router)
app.include_router(attendance.router)
app.include_router(payments.router)
app.include_router(expenses.router)
app.include_router(profit.router)

@app.get("/")
def root():
    return {"message": "CampOps API is running"}