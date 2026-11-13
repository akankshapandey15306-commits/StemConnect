from datetime import date
from sqlalchemy import String, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
class Donor(Base):
    __tablename__ = "donors"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Personal details
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(30), nullable=False)

    # Contact details
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)

    # Address
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pin_code: Mapped[str] = mapped_column(String(10), nullable=False)

    # Eligibility screening
    healthy: Mapped[str] = mapped_column(String(10), nullable=False)
    registered_elsewhere: Mapped[str] = mapped_column(String(10), nullable=False)
    medical_condition: Mapped[str] = mapped_column(String(10), nullable=False)
    hla_type: Mapped[str | None] = mapped_column(String(255), nullable = True)

    # Donor status
    availability: Mapped[str] = mapped_column(String(30), nullable=False)
    consent: Mapped[bool] = mapped_column(Boolean, nullable=False)
    
    