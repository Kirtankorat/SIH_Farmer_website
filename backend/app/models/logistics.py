from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class LogisticsShipment(Base):
    __tablename__ = "logistics_shipments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    partner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    driver_name = Column(String(100), nullable=True)
    driver_phone = Column(String(30), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    origin = Column(String(200), nullable=True)
    destination = Column(String(200), nullable=True)
    route_steps = Column(JSON, nullable=True) # Array of route step dicts
    status = Column(String(50), default="pending") # pending, in_transit, delivered
    pickup_time = Column(String(100), nullable=True)
    delivery_time = Column(String(100), nullable=True)
    cargo_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="shipment")
    partner = relationship("User")
