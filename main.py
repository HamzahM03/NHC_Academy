from fastapi import FastAPI
from database import engine, Base
import models
from routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampOps API")

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "CampOps API is running"}