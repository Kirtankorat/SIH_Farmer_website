from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.demand import DemandInsight

router = APIRouter(prefix="/demand", tags=["Demand Insights"])

@router.get("", response_model=List[dict])
async def list_demand_insights(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DemandInsight))
    insights = result.scalars().all()
    return [
        {
            "crop_key": d.crop_key,
            "name": d.name,
            "trend": d.trend,
            "trendLabel": d.trend_label,
            "nextWeek": d.next_week,
            "avgPrice": d.avg_price,
            "stock": d.stock,
            "recommendation": d.recommendation,
            "bars": d.bars
        } for d in insights
    ]

@router.get("/{crop_key}", response_model=dict)
async def get_demand_by_crop(crop_key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DemandInsight).where(DemandInsight.crop_key == crop_key.lower()))
    d = result.scalars().first()
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop demand data not found")
    return {
        "crop_key": d.crop_key,
        "name": d.name,
        "trend": d.trend,
        "trendLabel": d.trend_label,
        "nextWeek": d.next_week,
        "avgPrice": d.avg_price,
        "stock": d.stock,
        "recommendation": d.recommendation,
        "bars": d.bars
    }
