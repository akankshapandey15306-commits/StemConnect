
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.matching import Match
from app.schemas.patient import PatientCreate


def create_patient(
    db: Session,
    patient_data: PatientCreate,
    profile_image: str | None = None
):
    patient = Patient(
        full_name=patient_data.full_name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        mobile=patient_data.mobile,
        email=patient_data.email,
        city=patient_data.city,
        state=patient_data.state,
        diagnosis=patient_data.diagnosis,
        treatment_info=patient_data.treatment_info,
        hla_type=patient_data.hla_type,
        donor_search=patient_data.donor_search,
        financial_support=patient_data.financial_support,
        treatment_support=patient_data.treatment_support,
        other_assistance=patient_data.other_assistance,
        other_details=patient_data.other_details,
        profile_image=profile_image,
        photo_consent=patient_data.photo_consent,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


def get_patient_by_id(db: Session, patient_id: int):
    return (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )


def get_all_patients(db: Session):
    matched_patient_ids = (
        db.query(Match.patient_id)
        .filter(Match.status != "REJECTED")
        .distinct()
        .subquery()
    )

    return (
        db.query(Patient)
        .filter(~Patient.id.in_(matched_patient_ids))
        .all()
    )


def get_matched_patients(db: Session):
    matched_patient_ids = (
        db.query(Match.patient_id)
        .filter(Match.status != "REJECTED")
        .distinct()
        
    )

    return (
        db.query(Patient)
        .filter(Patient.id.in_(matched_patient_ids))
        .all()
    )


def get_patient_by_email(db: Session, email: str):
    return (
        db.query(Patient)
        .filter(Patient.email == email)
        .first()
    )


def delete_patient(db: Session, patient):
    db.delete(patient)
    db.commit()
