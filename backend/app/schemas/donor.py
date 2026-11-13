
import re 
from datetime import date
from pydantic import field_validator
from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict
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
class DonorCreate(BaseModel):
    # Personal details
    full_name: str
    date_of_birth: date
    gender: str

    # Contact details
    email: EmailStr
    mobile: str

    # Address
    address: str
    city: str
    state: str
    pin_code: str

    # Eligibility screening
    healthy: str
    registered_elsewhere: str
    medical_condition: str
    hla_type : str | None = None

    # Donor status
    availability: str
    consent: bool
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
    
    
    
class DonorResponse(BaseModel):
    id: int

    full_name: str
    date_of_birth: date
    gender: str

    email: str
    mobile: str

    address: str
    city: str
    state: str
    pin_code: str

    healthy: str
    registered_elsewhere: str
    medical_condition: str
    hla_type: str | None = None

    availability: str
    consent: bool

    model_config = ConfigDict(from_attributes=True)