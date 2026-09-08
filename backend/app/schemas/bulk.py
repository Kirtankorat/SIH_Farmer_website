from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class BulkRequestCreate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    product_name: str
    quantity: float
    unit: str = "kg"
    frequency: str = "Weekly"
    delivery_location: str
    required_date: Optional[date] = None
    additional_notes: Optional[str] = None

class BulkRequestResponse(BulkRequestCreate):
    id: int
    buyer_id: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
