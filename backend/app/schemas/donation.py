from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DonationCreate(BaseModel):
    campaign_id: int = Field(gt=0)
    amount: int = Field(gt=0)


class DonationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_id: int
    amount: int
    payment_status: str
    payment_reference: str | None
    created_at: datetime