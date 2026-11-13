from datetime import date
import re
from pydantic import field_validator
from pydantic import BaseModel, EmailStr, ConfigDict

INDIAN_STATES = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
}

class PatientCreate(BaseModel):
    # Personal details
    full_name: str
    date_of_birth: date
    gender: str
    mobile: str
    email: EmailStr

    # Address
    city: str
    state: str

    # Medical details
    diagnosis: str
    treatment_info: str
    
    hla_type : str | None= None

    # Support requirements
    donor_search: bool
    financial_support: bool
    treatment_support: bool
    other_assistance: bool
    other_details: str | None = None
    photo_consent : bool = False
    @field_validator("mobile")
    @classmethod
    def check_mobile(cls, v):
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("Mobile must be a valid 10-digit Indian number.")
        return v

    @field_validator("state")
    @classmethod
    def check_state(cls, v):
        if v not in INDIAN_STATES:
            raise ValueError("Invalid state or union territory.")
        return v


class PatientResponse(BaseModel):
    id: int

    full_name: str
    date_of_birth: date
    gender: str
    mobile: str
    email: str

    city: str
    state: str

    diagnosis: str
    treatment_info: str
    hla_type: str | None = None

    donor_search: bool
    financial_support: bool
    treatment_support: bool
    other_assistance: bool
    other_details: str | None = None
    profile_image: str | None = None
    photo_consent: bool
    

    status: str

    model_config = ConfigDict(from_attributes=True)