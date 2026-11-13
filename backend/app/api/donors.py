
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import donor as donor_repository
from app.database import get_db
from app.schemas.donor import DonorCreate, DonorResponse
from app.services.donor import register_donor
router = APIRouter(
    prefix="/api/donors",
    tags=["Donors"]
)
@router.post("/", response_model=DonorResponse)
def create_donor(
    donor_data: DonorCreate,
    db: Session = Depends(get_db)
):
    return register_donor(db, donor_data)
# Donor Management: unmatched donors
@router.get("/", response_model=list[DonorResponse])
def get_donors(
    db: Session = Depends(get_db)
):
    return donor_repository.get_all_donors(db)
# Matched Donors: individual matched donor records
@router.get("/matched", response_model=list[DonorResponse])
def get_matched_donors(
    db: Session = Depends(get_db)
):
    return donor_repository.get_matched_donors(db)


@router.delete("/{donor_id}")
def delete_donor(
    donor_id: int,
    db: Session = Depends(get_db)
):
    donor = donor_repository.get_donor_by_id(db, donor_id)

    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )

    donor_repository.delete_donor(db, donor)

    return {"message": "Donor deleted successfully"}
