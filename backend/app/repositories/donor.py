
from sqlalchemy.orm import Session

from app.models.donor import Donor
from app.models.matching import Match
from app.schemas.donor import DonorCreate


def create_donor(db: Session, donor_data: DonorCreate):
    donor = Donor(
        full_name=donor_data.full_name,
        date_of_birth=donor_data.date_of_birth,
        gender=donor_data.gender,
        email=donor_data.email,
        mobile=donor_data.mobile,
        address=donor_data.address,
        city=donor_data.city,
        state=donor_data.state,
        pin_code=donor_data.pin_code,
        hla_type=donor_data.hla_type,
        healthy=donor_data.healthy,
        registered_elsewhere=donor_data.registered_elsewhere,
        medical_condition=donor_data.medical_condition,
        availability=donor_data.availability,
        consent=donor_data.consent,
    )

    db.add(donor)
    db.commit()
    db.refresh(donor)

    return donor


def get_donor_by_id(db: Session, donor_id: int):
    return db.query(Donor).filter(Donor.id == donor_id).first()


def get_all_donors(db: Session):
    matched_donor_ids = (
        db.query(Match.donor_id)
        .filter(Match.status != "REJECTED")
        .distinct()
        .subquery()
    )

    return (
        db.query(Donor)
        .filter(~Donor.id.in_(matched_donor_ids))
        .all()
    )


def get_matched_donors(db: Session):
    matched_donor_ids = (
    db.query(Match.donor_id)
    .filter(Match.status != "REJECTED")
    .distinct()
    )

    return (
        db.query(Donor)
        .filter(Donor.id.in_(matched_donor_ids))
        .all()
    )


def get_donor_by_email(db: Session, email: str):
    return db.query(Donor).filter(Donor.email == email).first()


def delete_donor(db: Session, donor):
    db.delete(donor)
    db.commit()
