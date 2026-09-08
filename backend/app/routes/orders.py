import random
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.logistics import LogisticsShipment
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services.auth_service import get_current_user, require_auth

router = APIRouter(prefix="/orders", tags=["Orders"])

def format_order_response(order: Order) -> dict:
    subtotal = float(order.subtotal)
    delivery_fee = float(order.delivery_fee or 40.0)
    discount = float(order.discount or 0.0)
    total_amount = float(order.total_amount)

    items_list = []
    farmer_name = "Verified Farm Partner"
    farmer_location = "Gujarat, India"
    seller_type = "farmer"

    for it in order.items:
        it_price = float(it.price)
        it_total = float(it.line_total)
        items_list.append({
            "id": it.id,
            "product_id": it.product_id,
            "product_name": it.product_name,
            "name": it.product_name, # alias
            "emoji": it.emoji or "🌾",
            "price": it_price,
            "priceNum": it_price,
            "quantity": it.quantity,
            "qty": it.quantity, # alias
            "unit": it.unit or "kg",
            "seller_name": it.seller_name,
            "farmer": it.seller_name, # alias
            "line_total": it_total
        })
        if it.seller_name:
            farmer_name = it.seller_name

    return {
        "id": order.id,
        "order_number": order.order_number,
        "buyer_id": order.buyer_id,
        "buyer_name": order.buyer_name,
        "buyer_email": order.buyer_email,
        "buyer_phone": order.buyer_phone,
        "delivery_address": order.delivery_address,
        "status": order.status,
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "discount": discount,
        "total_amount": total_amount,
        "expected_delivery": order.expected_delivery,
        "created_at": order.created_at,
        "items": items_list,
        "farmer_info": {
            "name": farmer_name,
            "location": farmer_location,
            "seller_type": seller_type,
            "badge": "Verified Supplier"
        }
    }

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not data.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    # Generate unique order number (e.g. HL1056)
    order_num = f"HL{random.randint(1020, 9999)}"
    now = datetime.now(timezone.utc)
    expected = now + timedelta(days=1, hours=4)

    delivery_addr = data.delivery_address or data.shipping_address or "Standard Delivery Address"
    delivery_city = data.delivery_city or data.shipping_city or "Anand"
    delivery_state = data.delivery_state or data.shipping_state or "Gujarat"

    subtotal = sum(item.get_effective_price() * item.get_effective_qty() for item in data.items)
    delivery_fee = data.delivery_fee if data.delivery_fee is not None else 40.0
    discount = data.discount if data.discount is not None else (50.0 if subtotal > 500 else 0.0)
    total_amount = subtotal + delivery_fee - discount

    new_order = Order(
        order_number=order_num,
        buyer_id=current_user.id if current_user else None,
        buyer_name=data.buyer_name or (current_user.full_name if current_user else "Customer"),
        buyer_email=data.buyer_email or (current_user.email if current_user else None),
        buyer_phone=data.buyer_phone or (current_user.phone if current_user else None),
        delivery_address=delivery_addr,
        delivery_city=delivery_city,
        delivery_state=delivery_state,
        status="placed",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=discount,
        total_amount=total_amount,
        expected_delivery=expected
    )
    db.add(new_order)
    await db.flush()

    for item in data.items:
        p_name = item.get_effective_name()
        p_price = item.get_effective_price()
        p_qty = item.get_effective_qty()
        s_name = item.seller_name or item.farmer or "Shree Farms"

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            product_name=p_name,
            emoji=item.emoji or "🌾",
            price=p_price,
            quantity=p_qty,
            unit=item.unit or "kg",
            seller_name=s_name,
            seller_id=item.seller_id,
            line_total=p_price * p_qty
        )
        db.add(order_item)

    # Automatically attach logistics tracking shipment
    shipment = LogisticsShipment(
        order_id=new_order.id,
        driver_name="Mohan Kumar",
        driver_phone="+919876500001",
        vehicle_number="GJ-23-AB-4050",
        origin="Shree Farms, Anand",
        destination=delivery_addr,
        status="pending",
        pickup_time="Today · 4:30 PM",
        delivery_time="Tomorrow · 10:00 AM",
        cargo_summary=f"{len(data.items)} items produce delivery",
        route_steps=[
            {"title": "Farm Pickup — Ramesh Patel", "sub": "Scheduled · Today", "status": "active"},
            {"title": "Anand Regional Collection Hub", "sub": "Sorting & Cold Pack", "status": "pending"},
            {"title": "Dispatched for Destination", "sub": "In Transit", "status": "pending"},
            {"title": "Customer Doorstep Delivery", "sub": "Tomorrow by 6:00 PM", "status": "pending"}
        ]
    )
    db.add(shipment)

    await db.commit()

    # Load with items
    res = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == new_order.id)
    )
    loaded_order = res.scalars().first()
    return format_order_response(loaded_order)

@router.get("/{order_identifier}", response_model=dict)
async def get_order_by_number_or_id(order_identifier: str, db: AsyncSession = Depends(get_db)):
    query = select(Order).options(selectinload(Order.items))
    if order_identifier.isdigit():
        query = query.where(Order.id == int(order_identifier))
    else:
        query = query.where(Order.order_number == order_identifier.upper())

    result = await db.execute(query)
    order = result.scalars().first()
    if not order:
        # Fallback to demo order if HL1024 not found
        res_first = await db.execute(select(Order).options(selectinload(Order.items)).limit(1))
        order = res_first.scalars().first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return format_order_response(order)

@router.get("", response_model=List[dict])
async def list_orders(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Order).options(selectinload(Order.items)).order_by(desc(Order.created_at)).limit(50)
    if current_user and current_user.role == "consumer":
        query = query.where(Order.buyer_id == current_user.id)

    result = await db.execute(query)
    orders = result.scalars().all()
    return [format_order_response(o) for o in orders]

@router.patch("/{order_id}/status", response_model=dict)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = data.status
    await db.commit()
    await db.refresh(order)
    return format_order_response(order)
