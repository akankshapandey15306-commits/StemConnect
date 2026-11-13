import json
import re
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.donor import Donor
from app.models.patient import Patient
from app.models.matching import Match, Notification
REQUIRED_LOCI = ("A", "B", "C")
HLA_PATTERN = re.compile(
    r"\b(?:HLA-)?([ABC])\*([0-9]+:[0-9]+)\b",
    re.IGNORECASE,
)
def parse_hla(hla_type: str | None) -> dict[str, str]:
    """Parse demo HLA text. This is not a clinical validator."""

    if not hla_type or not hla_type.strip():
        return {}

    text = hla_type.strip().upper()
    matches = list(HLA_PATTERN.finditer(text))

    if not matches:
        return {}

    result: dict[str, str] = {}

    for match in matches:
        locus, allele = match.groups()

        if locus in result:
            return {}

        result[locus] = allele

    remainder = HLA_PATTERN.sub("", text)
    remainder = re.sub(r"[\s,;/|]+", "", remainder)

    if remainder:
        return {}

    return result


def compare_hla(
    donor_hla: str | None,
    patient_hla: str | None,
) -> dict:
    """Preliminary text comparison only; not a clinical compatibility test."""

    donor = parse_hla(donor_hla)
    patient = parse_hla(patient_hla)

    if not donor or not patient:
        return {
            "status": "insufficient_data",
            "matched_loci": [],
            "compared_loci": [],
            "message": "HLA information is missing or invalid.",
        }

    compared = [
        locus
        for locus in REQUIRED_LOCI
        if locus in donor and locus in patient
    ]

    if not compared:
        return {
            "status": "insufficient_data",
            "matched_loci": [],
            "compared_loci": [],
            "message": "No common HLA markers are available for comparison.",
        }

    matched = [
        locus
        for locus in compared
        if donor[locus] == patient[locus]
    ]

    return {
        "status": "review_required",
        "matched_loci": matched,
        "compared_loci": compared,
        "message": (
            "Preliminary HLA text comparison completed. "
            "Authorized clinical review is required."
        ),
    }



def find_and_save_matches(db: Session) -> dict:
    """Create one active preliminary match per donor and patient."""

    created_matches = []

    try:
        existing_matches = db.query(Match).all()

        # Rejected matches do not block future matching.
        active_matches = [
            match for match in existing_matches
            if (match.status or "").upper() != "REJECTED"
        ]

        matched_donor_ids = {
            match.donor_id for match in active_matches
        }

        matched_patient_ids = {
            match.patient_id for match in active_matches
        }

        # Remember rejected pairs to avoid violating UniqueConstraint.
        rejected_pairs = {
            (match.donor_id, match.patient_id)
            for match in existing_matches
            if (match.status or "").upper() == "REJECTED"
        }

        donors = (
            db.query(Donor)
            .filter(
                Donor.hla_type.isnot(None),
                func.lower(Donor.availability).in_(
                    ["available", "matched"]
                ),
            )
            .all()
        )

        patients = (
            db.query(Patient)
            .filter(
                Patient.hla_type.isnot(None),
                func.lower(Patient.status) != "unavailable",
            )
            .all()
        )

        # Synchronize donor statuses with active matches.
        for donor in donors:
            if donor.id in matched_donor_ids:
                donor.availability = "matched"
            elif (donor.availability or "").lower() == "matched":
                donor.availability = "available"

        # Synchronize patient statuses with active matches.
        for patient in patients:
            if patient.id in matched_patient_ids:
                patient.status = "Matched"
            elif (patient.status or "").lower() == "matched":
                patient.status = "Submitted"

        # Generate new preliminary matches.
        for donor in donors:

            if donor.id in matched_donor_ids:
                continue

            for patient in patients:

                if patient.id in matched_patient_ids:
                    continue

                # Do not recreate an already rejected pair.
                if (donor.id, patient.id) in rejected_pairs:
                    continue

                comparison = compare_hla(
                    donor.hla_type,
                    patient.hla_type,
                )

                if (
                    comparison["status"] != "review_required"
                    or not comparison["matched_loci"]
                ):
                    continue

                match_record = Match(
                    donor_id=donor.id,
                    patient_id=patient.id,
                    status="PENDING_REVIEW",
                    matched_loci=json.dumps(
                        comparison["matched_loci"]
                    ),
                    clinical_status="NOT_VERIFIED",
                    donor_response="PENDING",
                )

                db.add(match_record)
                db.flush()

                # Hide both records from their Management sections.
                donor.availability = "matched"
                patient.status = "Matched"

                matched_donor_ids.add(donor.id)
                matched_patient_ids.add(patient.id)

                # Admin notification.
                db.add(
                    Notification(
                        recipient_type="admin",
                        recipient_id=0,
                        title="Potential HLA match requires review",
                        message=(
                            f"Potential match found between "
                            f"{donor.full_name} and {patient.full_name}. "
                            "Authorized clinical review is required."
                        ),
                    )
                )

                # Donor notification.
                db.add(
                    Notification(
                        recipient_type="donor",
                        recipient_id=donor.id,
                        title="Potential donor match found",
                        message=(
                            f"You have a potential match with "
                            f"{patient.full_name}. Further matching "
                            "is paused pending clinical review."
                        ),
                    )
                )

                created_matches.append({
                    "match_id": match_record.id,
                    "donor_id": donor.id,
                    "donor_name": donor.full_name,
                    "patient_id": patient.id,
                    "patient_name": patient.full_name,
                    "status": match_record.status,
                    "clinical_status": match_record.clinical_status,
                    "donor_response": match_record.donor_response,
                    "matched_loci": comparison["matched_loci"],
                    "message": comparison["message"],
                })

                break

        db.commit()

        return {
            "created_count": len(created_matches),
            "matches": created_matches,
            "message": "Potential match screening completed.",
        }

    except Exception:
        db.rollback()
        raise
