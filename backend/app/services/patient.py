from sqlalchemy.orm import Session
from app.repositories import patient as patient_repository
from app.schemas.patient import PatientCreate
def register_patient(
    db: Session,
    patient_data: PatientCreate,
    profile_image: str | None = None
):
    existing_patient = patient_repository.get_patient_by_email(
        db,
        patient_data.email
    )

    if existing_patient:
        raise ValueError(
            "Patient with this email already exists"
        )

    return patient_repository.create_patient(
        db,
        patient_data,
        profile_image
    )
