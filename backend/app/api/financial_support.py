
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Form,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.campaign import Campaign
from app.models.donation import Donation
from app.models.patient import Patient
from app.schemas.donation import DonationCreate, DonationResponse


router = APIRouter(
    prefix="/api/financial-support",
    tags=["Financial Support"],
)


# =====================================
# PATIENTS NEEDING FINANCIAL SUPPORT
# =====================================

@router.get("/eligible-patients")
def get_eligible_patients(db: Session = Depends(get_db)):

    patients = (
        db.query(Patient)
        .filter(Patient.financial_support.is_(True))
        .order_by(Patient.id.desc())
        .all()
    )

    return [
        {
            "id": patient.id,
            "full_name": patient.full_name,
            "diagnosis": patient.diagnosis,
            "profile_image": patient.profile_image,
            "photo_consent": patient.photo_consent,
            "city": patient.city,
            "state": patient.state,
        }
        for patient in patients
    ]


# =====================================
# GET CAMPAIGNS
# =====================================

@router.get("/campaigns")
def get_campaigns(db: Session = Depends(get_db)):

    campaigns = (
        db.query(Campaign)
        .order_by(Campaign.created_at.desc())
        .all()
    )

    results = []

    for campaign in campaigns:
        patient = (
            db.query(Patient)
            .filter(Patient.id == campaign.patient_id)
            .first()
        )

        results.append({
            "id": campaign.id,
            "patient_id": campaign.patient_id,
            "patient_name": patient.full_name if patient else None,
            "patient_photo_url": campaign.patient_photo_url,
            "title": campaign.title,
            "description": campaign.description,
            "goal_amount": campaign.goal_amount,
            "raised_amount": campaign.raised_amount,
            "status": campaign.status,
            "created_at": campaign.created_at,
        })

    return results


# =====================================
# CREATE CAMPAIGN USING PATIENT PHOTO
# =====================================

@router.post("/campaigns", status_code=201)
def create_campaign(
    patient_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    goal_amount: int = Form(...),
    db: Session = Depends(get_db),
    ):
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id,
            Patient.financial_support.is_(True),
        )
        .first()
    )
    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Eligible patient not found.",
        )

    if len(title.strip()) < 3 or len(title) > 150:
        raise HTTPException(
            status_code=400,
            detail="Title must be between 3 and 150 characters.",
        )

    if len(description.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Description must contain at least 10 characters.",
        )

    if goal_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Goal amount must be greater than zero.",
        )

    # Check patient photo consent
    if not patient.photo_consent:
        raise HTTPException(
            status_code=400,
            detail="Patient has not given consent to use their photo.",
        )

    # Check registered patient photo
    if not patient.profile_image:
        raise HTTPException(
            status_code=400,
            detail="Selected patient does not have a registered profile photo.",
        )

    try:
        campaign = Campaign(
            patient_id=patient.id,
            title=title.strip(),
            description=description.strip(),
            patient_photo_url=patient.profile_image,
            goal_amount=goal_amount,
            raised_amount=0,
            status="ACTIVE",
        )

        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        return {
            "id": campaign.id,
            "patient_id": patient.id,
            "patient_name": patient.full_name,
            "patient_photo_url": campaign.patient_photo_url,
            "title": campaign.title,
            "description": campaign.description,
            "goal_amount": campaign.goal_amount,
            "raised_amount": campaign.raised_amount,
            "status": campaign.status,
            "created_at": campaign.created_at,
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Campaign creation failed. Please try again.",
        )


# =====================================
# DELETE CAMPAIGN
# =====================================

@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
):

    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if campaign is None:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found.",
        )

    try:
        # Delete associated donation records first
        db.query(Donation).filter(
            Donation.campaign_id == campaign_id
        ).delete(synchronize_session=False)

        db.delete(campaign)
        db.commit()

        return {
            "message": "Campaign deleted successfully."
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to delete campaign."
        )


# =====================================
# CREATE DONATION
# =====================================

@router.post(
    "/donations",
    response_model=DonationResponse,
    status_code=201
)
def create_donation(
    data: DonationCreate,
    db: Session = Depends(get_db),
):

    try:
        # Lock campaign row while updating its raised amount
        campaign = (
            db.query(Campaign)
            .filter(Campaign.id == data.campaign_id)
            .with_for_update()
            .first()
        )

        if campaign is None or campaign.status != "ACTIVE":
            raise HTTPException(
                status_code=404,
                detail="Active campaign not found.",
            )

        remaining_amount = max(
            0,
            campaign.goal_amount - campaign.raised_amount
        )

        if data.amount > remaining_amount:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Donation amount exceeds remaining goal. "
                    f"Remaining amount: ₹{remaining_amount}"
                ),
            )

        donation = Donation(
            campaign_id=campaign.id,
            amount=data.amount,
            payment_status="SUCCESS",
        )

        campaign.raised_amount += data.amount

        db.add(donation)
        db.commit()
        db.refresh(donation)

        return donation

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Donation could not be processed.",
        )
