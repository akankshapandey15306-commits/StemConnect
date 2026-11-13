from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CampaignCreate(BaseModel):
    patient_id: int = Field(gt=0)
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=10)
    patient_photo_url: str | None = None
    goal_amount: int = Field(gt=0)


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int | None = None
    patient_name: str | None = None
    patient_photo_url: str | None = None
    title: str
    description: str
    goal_amount: int
    raised_amount: int
    status: str
    created_at: datetime