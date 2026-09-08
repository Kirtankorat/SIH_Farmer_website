from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database import get_db
from app.models.bulk_request import BulkRequest
from app.models.user import User
from app.schemas.bulk import BulkRequestCreate, BulkRequestResponse
from app.services.auth_service import get_current_user, require_auth

router = APIRouter(prefix="/bulk-requests", tags=["Bulk Requests"])

@router.post("", response_model=BulkRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_bulk_request(
    data: BulkRequestCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    req = BulkRequest(
        buyer_id=current_user.id if current_user else None,
        business_name=data.business_name or (current_user.full_name if current_user else None),
        business_type=data.business_type or "Restaurant",
        contact_name=data.contact_name or (current_user.full_name if current_user else None),
        phone=data.phone or (current_user.phone if current_user else None),
        email=data.email or (current_user.email if current_user else None),
        product_name=data.product_name,
        quantity=data.quantity,
        unit=data.unit or "kg",
        frequency=data.frequency or "Weekly",
        delivery_location=data.delivery_location,
        required_date=data.required_date,
        additional_notes=data.additional_notes,
        status="matching"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return req

@router.get("", response_model=List[BulkRequestResponse])
async def list_bulk_requests(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(BulkRequest).order_by(desc(BulkRequest.created_at)).limit(50)
    if current_user and current_user.role == "bulk":
        query = query.where(BulkRequest.buyer_id == current_user.id)

    result = await db.execute(query)
    return result.scalars().all()
