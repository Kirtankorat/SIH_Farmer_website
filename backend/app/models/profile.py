from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class FarmerProfile(Base):
    __tablename__ = "profiles_farmer"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    farm_name = Column(String(150), nullable=True)
    village = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    farm_size_acres = Column(Numeric(8, 2), nullable=True)
    farming_practice = Column(String(50), default="organic") # organic, natural, conventional, other
    primary_crops = Column(Text, nullable=True)
    monthly_produce_kg = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="farmer_profile")

class FPOProfile(Base):
    __tablename__ = "profiles_fpo"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    fpo_name = Column(String(150), nullable=False)
    registration_number = Column(String(100), nullable=True)
    member_count = Column(Integer, default=0)
    contact_person = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    primary_commodities = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="fpo_profile")

class BulkBuyerProfile(Base):
    __tablename__ = "profiles_bulk"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=False)
    business_type = Column(String(50), nullable=True) # restaurant, hotel, retailer, wholesaler, institution, processor, other
    contact_person = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    gst_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="bulk_profile")

class LogisticsProfile(Base):
    __tablename__ = "profiles_logistics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(150), nullable=False)
    fleet_type = Column(String(150), nullable=True)
    capacity_tons = Column(Numeric(8, 2), nullable=True)
    primary_coverage_area = Column(String(200), nullable=True)
    has_cold_storage = Column(String(50), default="No")
    driver_count = Column(Integer, default=1)
    contact_person = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="logistics_profile")
