from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Package, Participant
from schemas import PackageCreate, PackageResponse
from routers.auth import get_current_coach
from typing import List

router = APIRouter(prefix="/packages", tags=["packages"])


@router.post("/", response_model=PackageResponse)
def create_package(package_data: PackageCreate, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    participant = db.query(Participant).filter(
        Participant.id == package_data.participant_id,
        Participant.coach_id == current_coach.id
    ).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    new_package = Package(
        coach_id=current_coach.id,
        participant_id=package_data.participant_id,
        name=package_data.name,
        sessions_total=package_data.sessions_total,
        sessions_remaining=package_data.sessions_total,
        price=package_data.price,
        status="active"
    )
    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    return new_package


@router.get("/", response_model=List[PackageResponse])
def get_packages(db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Package).filter(Package.coach_id == current_coach.id).all()


@router.get("/{package_id}", response_model=PackageResponse)
def get_package(package_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    package = db.query(Package).filter(
        Package.id == package_id,
        Package.coach_id == current_coach.id
    ).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


@router.get("/participant/{participant_id}", response_model=List[PackageResponse])
def get_packages_for_participant(participant_id: str, db: Session = Depends(get_db), current_coach=Depends(get_current_coach)):
    return db.query(Package).filter(
        Package.participant_id == participant_id,
        Package.coach_id == current_coach.id
    ).all()