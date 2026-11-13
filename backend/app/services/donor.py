from sqlalchemy.orm import Session

from app.repositories import donor as donor_repository
from app.schemas.donor import DonorCreate


def register_donor(db: Session, donor_data: DonorCreate):
    existing_donor = donor_repository.get_donor_by_email(
        db,
        donor_data.email
    )

    if existing_donor:
        raise ValueError("Donor with this email already exists")

    return donor_repository.create_donor(
        db,
        donor_data
    )