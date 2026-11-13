from datetime import date

from sqlalchemy import String, Date, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Personal details
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(30), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Patient photograph
    profile_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    # Consent for using photograph in public campaigns
    photo_consent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Address
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)

    # Medical details
    diagnosis: Mapped[str] = mapped_column(String(255), nullable=False)
    treatment_info: Mapped[str] = mapped_column(Text, nullable=False)

    # HLA report
    
    hla_type: Mapped[str | None] = mapped_column(
    String(255), nullable=True
    )

    # Support requirements
    donor_search: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    financial_support: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    treatment_support: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    other_assistance: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    other_details: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Request status
    status: Mapped[str] = mapped_column(
        String(30),
        default="Submitted",
        nullable=False
    )