
from datetime import datetime, timezone
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
class Match(Base):
    __tablename__ = "matches"

    __table_args__ = (
        UniqueConstraint(
            "patient_id",
            "donor_id",
            name="uq_match_patient_donor",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    donor_id: Mapped[int] = mapped_column(
        ForeignKey("donors.id"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(40),
        default="PENDING_REVIEW",
        nullable=False,
    )

    matched_loci: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    clinical_status: Mapped[str] = mapped_column(
        String(40),
        default="NOT_VERIFIED",
        nullable=False,
    )

    donor_response: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    recipient_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    recipient_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    is_read: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
