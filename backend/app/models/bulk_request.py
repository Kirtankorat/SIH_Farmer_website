from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class BulkRequest(Base):
    __tablename__ = "bulk_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    business_name = Column(String(150), nullable=True)
    business_type = Column(String(50), nullable=True)
    contact_name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), default="kg")
    frequency = Column(String(50), default="Weekly") # Weekly, Bi-weekly, Monthly, One-time
    delivery_location = Column(String(200), nullable=False)
    required_date = Column(Date, nullable=True)
    additional_notes = Column(Text, nullable=True)
    status = Column(String(50), default="submitted") # submitted, matching, accepted, confirmed, completed, rejected
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    buyer = relationship("User", back_populates="bulk_requests")
