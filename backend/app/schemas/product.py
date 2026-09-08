from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    emoji: Optional[str] = "🌾"
    category: Optional[str] = "grains" # vegetables, fruits, grains, pulses, spices, dairy
    farming_practice: Optional[str] = "conventional" # organic, natural, conventional
    seller_type: Optional[str] = "farmer" # farmer, fpo
    price: Optional[float] = None
    price_per_unit: Optional[float] = None
    unit: Optional[str] = "kg"
    farmer_name: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = "available"
    stock_quantity: Optional[float] = 100.0
    badge: Optional[str] = "Individual Farmer"
    description: Optional[str] = None

    def get_effective_price(self) -> float:
        if self.price is not None:
            return float(self.price)
        if self.price_per_unit is not None:
            return float(self.price_per_unit)
        return 0.0

class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    category: Optional[str] = None
    farming_practice: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    farmer_name: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    stock_quantity: Optional[float] = None
    badge: Optional[str] = None
    description: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    seller_id: Optional[int] = None
    priceNum: float # Computed alias for frontend backwards-compatibility
    rating: float = 4.5
    review_count: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
