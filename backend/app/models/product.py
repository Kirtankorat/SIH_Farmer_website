from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False, index=True)
    emoji = Column(String(20), default="🌾")
    category = Column(String(50), nullable=False, index=True) # vegetables, fruits, grains, pulses, spices, dairy
    farming_practice = Column(String(50), nullable=False, index=True) # organic, natural, conventional
    seller_type = Column(String(30), default="farmer", index=True) # farmer, fpo
    price = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), default="kg")
    farmer_name = Column(String(150), nullable=True)
    location = Column(String(100), nullable=True)
    rating = Column(Numeric(3, 2), default=4.5)
    review_count = Column(Integer, default=0)
    availability = Column(String(30), default="available") # available, limited, out_of_stock
    stock_quantity = Column(Numeric(10, 2), default=100.0)
    badge = Column(String(50), default="Individual Farmer")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    seller = relationship("User", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
