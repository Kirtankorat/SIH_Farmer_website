from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.logistics import LogisticsShipment
from app.models.user import User
from app.services.auth_service import get_current_user, require_auth

router = APIRouter(prefix="/logistics", tags=["Logistics"])

@router.get("/shipments", response_model=List[dict])
async def list_shipments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LogisticsShipment).limit(20))
    shipments = result.scalars().all()
    return [
        {
            "id": s.id,
            "order_id": s.order_id,
            "driver_name": s.driver_name,
            "driver_phone": s.driver_phone,
            "vehicle_number": s.vehicle_number,
            "origin": s.origin,
            "destination": s.destination,
            "status": s.status,
            "pickup_time": s.pickup_time,
            "delivery_time": s.delivery_time,
            "cargo_summary": s.cargo_summary,
            "route_steps": s.route_steps
        } for s in shipments
    ]

@router.get("/routes", response_model=List[dict])
async def list_routes(db: AsyncSession = Depends(get_db)):
    return [
        {
            "route_name": "Route 1: Anand -> Surat Direct",
            "stops": ["Shree Farms (Pickup)", "Anand Hub (Cold Storage)", "Green Kitchen (Surat)"],
            "truck": "GJ-23-AB-4050 (Reefer)",
            "driver": "Mohan Kumar",
            "status": "In Transit"
        },
        {
            "route_name": "Route 2: Mehsana -> Ahmedabad Central",
            "stops": ["Kisan Collective (Pickup)", "Metro Wholesale (Ahmedabad)"],
            "truck": "GJ-01-XX-9021",
            "driver": "Sanjay Patel",
            "status": "Scheduled"
        }
    ]
