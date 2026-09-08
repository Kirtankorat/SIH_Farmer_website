from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ContactCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str
    role_type: Optional[str] = None
    message: str

class ContactResponse(ContactCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
