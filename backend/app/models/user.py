from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(30), nullable=False, default="consumer") # farmer, fpo, bulk, logistics, consumer, admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fpo_profile = relationship("FPOProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bulk_profile = relationship("BulkBuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    logistics_profile = relationship("LogisticsProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    products = relationship("Product", back_populates="seller")
    orders = relationship("Order", back_populates="buyer")
    bulk_requests = relationship("BulkRequest", back_populates="buyer")
