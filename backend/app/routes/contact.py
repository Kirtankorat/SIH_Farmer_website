from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.contact import ContactInquiry
from app.schemas.contact import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["Contact Inquiries"])

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact(data: ContactCreate, db: AsyncSession = Depends(get_db)):
    inquiry = ContactInquiry(
        name=data.name,
        phone=data.phone,
        email=data.email,
        role_type=data.role_type,
        message=data.message,
        status="unread"
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    return inquiry
