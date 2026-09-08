from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from app.database import Base

class DemandInsight(Base):
    __tablename__ = "demand_insights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_key = Column(String(50), unique=True, index=True, nullable=False) # e.g. tomato, onion, potato, wheat
    name = Column(String(100), nullable=False) # 🍅 Tomato
    trend = Column(String(30), nullable=False) # high, stable, low
    trend_label = Column(String(50), nullable=False) # ↑ High Demand
    next_week = Column(String(30), nullable=False) # +18%
    avg_price = Column(String(30), nullable=False) # ₹32/kg
    stock = Column(String(50), nullable=False) # 1,240 kg
    recommendation = Column(Text, nullable=False)
    bars = Column(JSON, nullable=False) # Array of 14 integers
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
