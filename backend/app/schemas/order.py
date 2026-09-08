from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    name: Optional[str] = None
    emoji: Optional[str] = "🌾"
    price: Optional[float] = None
    price_per_unit: Optional[float] = None
    priceNum: Optional[float] = None
    quantity: Optional[int] = None
    qty: Optional[int] = None
    unit: Optional[str] = "kg"
    seller_name: Optional[str] = None
    farmer: Optional[str] = None
    seller_id: Optional[int] = None

    def get_effective_name(self) -> str:
        return self.product_name or self.name or "Farm Fresh Item"

    def get_effective_price(self) -> float:
        if self.price is not None:
            return float(self.price)
        if self.price_per_unit is not None:
            return float(self.price_per_unit)
        if self.priceNum is not None:
            return float(self.priceNum)
        return 0.0

    def get_effective_qty(self) -> int:
        if self.quantity is not None:
            return int(self.quantity)
        if self.qty is not None:
            return int(self.qty)
        return 1

class OrderCreate(BaseModel):
    buyer_name: Optional[str] = "Valued Customer"
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    shipping_address: Optional[str] = None
    delivery_city: Optional[str] = None
    shipping_city: Optional[str] = None
    delivery_state: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None
    delivery_type: Optional[str] = "standard"
    payment_method: Optional[str] = "cod"
    notes: Optional[str] = None
    items: List[OrderItemCreate]
    delivery_fee: Optional[float] = 40.0
    discount: Optional[float] = 0.0


class OrderStatusUpdate(BaseModel):
    status: str # placed, confirmed, preparing, picked_up, in_transit, delivered, cancelled

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    emoji: Optional[str]
    price: float
    quantity: int
    unit: str
    seller_name: Optional[str]
    line_total: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    buyer_id: Optional[int]
    buyer_name: str
    buyer_email: Optional[str]
    buyer_phone: Optional[str]
    delivery_address: Optional[str]
    status: str
    subtotal: float
    delivery_fee: float
    discount: float
    total_amount: float
    expected_delivery: Optional[datetime]
    created_at: datetime
    items: List[OrderItemResponse] = []
    farmer_info: Optional[dict] = None

    class Config:
        from_attributes = True
