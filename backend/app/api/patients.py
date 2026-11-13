import json
import uuid
from pathlib import Path
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Form,
    File,
    UploadFile,
)
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.patient import PatientCreate, PatientResponse
from app.services.patient import register_patient
from app.repositories import patient as patient_repository
from app.services.hla_matching import find_and_save_matches
from app.models.matching import Match
from app.models.donor import Donor
from app.models.patient import Patient
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_IMAGE_SIZE = 5 * 1024 * 1024

router = APIRouter(
    prefix="/api/patients",
    tags=["Patients"]
)


@router.post("/", response_model=PatientResponse)
async def create_patient(
    patient_data: str = Form(...),
    profile_image: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    saved_file = None

    try:
        # Convert JSON form data into PatientCreate
        try:
            patient_data_obj = PatientCreate.model_validate(
                json.loads(patient_data)
            )
        except (json.JSONDecodeError, ValidationError):
            raise HTTPException(
                status_code=422,
                detail="Invalid patient registration data."
            )

        image_path = None

        if profile_image is not None:
            # Public campaign photo requires explicit consent
            if not patient_data_obj.photo_consent:
                raise HTTPException(
                    status_code=400,
                    detail="Photo consent is required to upload a campaign photo."
                )

            # Read image with size limit
            image_bytes = await profile_image.read(
                MAX_IMAGE_SIZE + 1
            )

            if len(image_bytes) > MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="Image size must not exceed 5 MB."
                )

            # Verify actual image format using file signature
            if image_bytes.startswith(b"\xff\xd8\xff"):
                extension = ".jpg"

            elif image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                extension = ".png"

            elif (
                image_bytes.startswith(b"RIFF")
                and image_bytes[8:12] == b"WEBP"
            ):
                extension = ".webp"

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Only JPG, PNG and WEBP images are allowed."
                )

            # Generate a unique filename
            filename = f"{uuid.uuid4().hex}{extension}"

            saved_file = UPLOAD_DIR / filename
            saved_file.write_bytes(image_bytes)

            image_path = f"/uploads/{filename}"

        # Register patient and save image path
        patient = register_patient(
            db,
            patient_data_obj,
            image_path
        )

        return patient

    except ValueError as error:
        if saved_file and saved_file.exists():
            saved_file.unlink()

        raise HTTPException(
            status_code=409,
            detail=str(error)
        )

    except HTTPException:
        if saved_file and saved_file.exists():
            saved_file.unlink()

        raise

    except Exception:
        if saved_file and saved_file.exists():
            saved_file.unlink()

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Patient registration failed. Please try again."
        )


@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db)
):
    return patient_repository.get_all_patients(db)




@router.get("/matched", response_model=list[PatientResponse])
def get_matched_patients(
    db: Session = Depends(get_db)
):
    return patient_repository.get_matched_patients(db)



@router.post("/run-matching")
def run_matching(
    db: Session = Depends(get_db)
):
    try:
        return find_and_save_matches(db)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Matching process failed. Please check the backend logs."
        ) from error





@router.get("/potential-matches")
def get_potential_matches(db: Session = Depends(get_db)):
    matches = (
        db.query(Match)
        .order_by(Match.created_at.desc())
        .all()
    )

    results = []

    for match in matches:
        patient = db.query(Patient).filter(
            Patient.id == match.patient_id
        ).first()

        donor = db.query(Donor).filter(
            Donor.id == match.donor_id
        ).first()

        donor_name = donor.full_name if donor else "Donor"
        patient_name = patient.full_name if patient else "Patient"

        results.append({
            "id": match.id,

            "patient_id": match.patient_id,
            "patient_name": patient.full_name if patient else None,
            "patient_phone": patient.mobile if patient else None,
            "patient_email": patient.email if patient else None,
            "patient_status": patient.status if patient else None,
            "patient_message": (
                f"A potential donor match has been found for "
                f"{patient_name}. Further matching is paused "
                "pending clinical review."
            ),

            "donor_id": match.donor_id,
            "donor_name": donor.full_name if donor else None,
            "donor_phone": donor.mobile if donor else None,
            "donor_email": donor.email if donor else None,
            "donor_availability": (
                donor.availability if donor else None
            ),
            "donor_message": (
                f"{donor_name} has a potential match with "
                f"{patient_name}. Further matching is paused "
                "pending clinical review."
            ),

            "status": match.status,
            "matched_loci": match.matched_loci,
            "clinical_status": match.clinical_status,
            "donor_response": match.donor_response,
            "created_at": match.created_at,
        })

    return results





class ClinicalReviewRequest(BaseModel):
    clinical_status: str



@router.patch("/potential-matches/{match_id}/review")
def update_clinical_review(
    match_id: int,
    review: ClinicalReviewRequest,
    db: Session = Depends(get_db),
):
    allowed_statuses = {"VERIFIED", "REJECTED"}

    if review.clinical_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Status must be VERIFIED or REJECTED",
        )

    match = db.query(Match).filter(
        Match.id == match_id
    ).first()

    if match is None:
        raise HTTPException(
            status_code=404,
            detail="Potential match not found",
        )

    donor = db.query(Donor).filter(
        Donor.id == match.donor_id
    ).first()

    patient = db.query(Patient).filter(
        Patient.id == match.patient_id
    ).first()

    try:
        match.clinical_status = review.clinical_status

        if review.clinical_status == "VERIFIED":
            match.status = "CLINICALLY_VERIFIED"

        else:
            match.status = "REJECTED"

            # Check whether donor has another active match.
            other_donor_match = (
                db.query(Match)
                .filter(
                    Match.donor_id == match.donor_id,
                    Match.id != match.id,
                    Match.status != "REJECTED",
                )
                .first()
            )

            # Check whether patient has another active match.
            other_patient_match = (
                db.query(Match)
                .filter(
                    Match.patient_id == match.patient_id,
                    Match.id != match.id,
                    Match.status != "REJECTED",
                )
                .first()
            )

            if donor and not other_donor_match:
                donor.availability = "available"

            if patient and not other_patient_match:
                patient.status = "Submitted"

        db.commit()
        db.refresh(match)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update clinical review.",
        )

    return {
        "id": match.id,
        "status": match.status,
        "clinical_status": match.clinical_status,
        "message": "Review status updated.",
    }

@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = patient_repository.get_patient_by_id(db, patient_id)

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    try:
        patient_repository.delete_patient(db, patient)

        return {
            "message": "Patient deleted successfully"
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Patient cannot be deleted because related records exist."
        ) from error