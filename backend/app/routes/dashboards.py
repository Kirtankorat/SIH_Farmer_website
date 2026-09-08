from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.bulk_request import BulkRequest
from app.models.demand import DemandInsight
from app.models.logistics import LogisticsShipment
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])

@router.get("/farmer", response_model=dict)
async def get_farmer_dashboard(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch farmer products
    p_res = await db.execute(select(Product).where(Product.is_active == True).limit(6))
    farmer_prods = p_res.scalars().all()

    # 2. Fetch recent orders
    o_res = await db.execute(
        select(Order).options(selectinload(Order.items)).order_by(desc(Order.created_at)).limit(6)
    )
    orders = o_res.scalars().all()

    # 3. Demand insights
    d_res = await db.execute(select(DemandInsight).limit(4))
    demands = d_res.scalars().all()

    # 4. Logistics
    l_res = await db.execute(select(LogisticsShipment).limit(2))
    shipments = l_res.scalars().all()

    # Aggregate stats
    total_stock = sum(float(p.stock_quantity or 0) for p in farmer_prods)
    total_orders_count = len(orders)
    this_month_sales = sum(float(o.total_amount) for o in orders)

    return {
        "farmer_name": current_user.full_name if current_user else "Ramesh Patel",
        "stats": {
            "today_orders": 24,
            "today_orders_trend": "↑ 6 new today",
            "sales_this_month": f"₹{int(this_month_sales + 18450):,}",
            "sales_trend": "↑ 12% vs last month",
            "available_stock": f"{int(total_stock):,} kg" if total_stock else "1,240 kg",
            "products_count": len(farmer_prods) or 3,
            "demand_alerts": 3
        },
        "recent_orders": [
            {
                "product": f"{o.items[0].product_name} · {o.items[0].quantity} {o.items[0].unit}" if o.items else "Produce · 10 kg",
                "meta": f"{o.buyer_name} · {o.delivery_address or 'Anand'}",
                "status": o.status.capitalize(),
                "status_class": "status-new" if o.status == "placed" else "status-prep" if o.status == "preparing" else "status-done"
            } for o in orders
        ] or [
            {"product": "Tomatoes · 12 kg", "meta": "Mehul Stores, Anand", "status": "New", "status_class": "status-new"},
            {"product": "Okra · 5 kg", "meta": "Green Kitchen, Surat", "status": "Preparing", "status_class": "status-prep"},
            {"product": "Tomatoes · 20 kg", "meta": "Retail Hub, Vadodara", "status": "Delivered", "status_class": "status-done"},
            {"product": "Brinjal · 8 kg", "meta": "Home Delivery, Anand", "status": "Delivered", "status_class": "status-done"}
        ],
        "demand_insights": [
            {
                "name": d.name,
                "rec": d.recommendation,
                "trend": d.trend,
                "trend_label": d.trend_label,
                "next_week": d.next_week,
                "trend_class": "dr-up" if d.trend == "high" else "dr-stable" if d.trend == "stable" else "dr-down"
            } for d in demands
        ],
        "products": [
            {
                "id": p.id,
                "name": f"{p.emoji} {p.name}",
                "meta": f"{p.farming_practice.capitalize()} · {p.location}",
                "price": f"₹{int(p.price)}/{p.unit}",
                "stock": f"{int(p.stock_quantity)} kg" if p.stock_quantity else "500 kg",
                "status": "Active" if p.is_active else "Inactive"
            } for p in farmer_prods
        ],
        "upcoming_logistics": [
            {
                "title": "Next Pickup",
                "time": "Today · 4:30 PM",
                "detail": "Driver: Mohan K. · 3 orders · Tomatoes 32kg, Okra 5kg"
            },
            {
                "title": "Next Delivery",
                "time": "Tomorrow · 10:00 AM",
                "detail": "2 stops · Mehul Stores + Retail Hub, Anand area"
            }
        ],
        "sales_summary": {
            "this_month": "₹18,450",
            "last_month": "₹16,200",
            "this_year": "₹1.8L"
        },
        "transactions": [
            {"name": "Tomatoes 12 kg · Mehul Stores", "date": "Today", "amount": "₹384"},
            {"name": "Okra 5 kg · Green Kitchen", "date": "Today", "amount": "₹290"},
            {"name": "Tomatoes 20 kg · Retail Hub", "date": "Yesterday", "amount": "₹640"},
            {"name": "Tomatoes 30 kg · Hotel Green", "date": "2 days ago", "amount": "₹960"}
        ]
    }

@router.get("/fpo", response_model=dict)
async def get_fpo_dashboard(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    p_res = await db.execute(select(Product).where(Product.seller_type == "fpo").limit(6))
    fpo_prods = p_res.scalars().all()

    return {
        "fpo_name": current_user.full_name if current_user else "Konkan FPO",
        "stats": {
            "member_farmers": 84,
            "member_trend": "↑ 6 this month",
            "available_produce": "3,420 kg",
            "active_orders": 12,
            "active_orders_trend": "↑ 4 new today",
            "bulk_orders": 3
        },
        "recent_orders": [
            {"product": "Alphonso Mango · 25 kg", "meta": "Green Kitchen, Mumbai · Today", "status": "New", "status_class": "status-new"},
            {"product": "Alphonso Mango · 40 kg", "meta": "Hotel Taj · Mumbai · Yesterday", "status": "Preparing", "status_class": "status-prep"},
            {"product": "Cashew · 15 kg", "meta": "Retail Store · Pune · 2 days ago", "status": "Delivered", "status_class": "status-done"}
        ],
        "members": [
            {"name": "Ramesh Patel", "loc": "Anand, Gujarat", "produce": "Tomatoes · 840 kg"},
            {"name": "Suresh Naik", "loc": "Ratnagiri, Maharashtra", "produce": "Mango · 1,200 kg"},
            {"name": "Meena Sawant", "loc": "Sindhudurg, Maharashtra", "produce": "Cashew · 380 kg"},
            {"name": "Ganesh Chavan", "loc": "Kolhapur, Maharashtra", "produce": "Vegetables · 520 kg"},
            {"name": "Anita Desai", "loc": "Nashik, Maharashtra", "produce": "Onion · 900 kg"}
        ],
        "aggregated_products": [
            {
                "name": f"{p.emoji} {p.name}",
                "meta": f"{p.farming_practice.capitalize()} · {p.location}",
                "price": f"₹{int(p.price)}/{p.unit}",
                "stock": f"{int(p.stock_quantity)} kg",
                "status": "Active"
            } for p in fpo_prods
        ] or [
            {"name": "🥭 Alphonso Mango", "meta": "Natural · Maharashtra", "price": "₹180/kg", "stock": "1,200 kg", "status": "Active"},
            {"name": "🌰 Cashew", "meta": "Natural · Maharashtra", "price": "₹320/kg", "stock": "380 kg", "status": "Limited"},
            {"name": "🧅 Onion", "meta": "Conventional · Maharashtra", "price": "₹28/kg", "stock": "900 kg", "status": "Active"}
        ],
        "inventory": [
            {"crop": "🥭 Alphonso Mango", "sources": "From 12 member farmers", "qty": "1,200 kg"},
            {"crop": "🌰 Cashew", "sources": "From 8 member farmers", "qty": "380 kg"},
            {"crop": "🧅 Onion", "sources": "From 5 member farmers", "qty": "900 kg"},
            {"crop": "🍅 Tomatoes", "sources": "From 15 member farmers", "qty": "940 kg"}
        ],
        "bulk_buyers": [
            {"name": "Hotel Taj · 🏨 Hotel", "meta": "Mumbai · Alphonso Mango 50 kg/week", "status": "Active"},
            {"name": "Metro Wholesale · 📦 Wholesaler", "meta": "Pune · Onion, Tomato 200 kg/week", "status": "Active"},
            {"name": "Green Kitchen · 🍽️ Restaurant", "meta": "Mumbai · Seasonal fruits 30 kg/week", "status": "Pending"}
        ]
    }

@router.get("/bulk", response_model=dict)
async def get_bulk_dashboard(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    b_res = await db.execute(select(BulkRequest).limit(5))
    requests = b_res.scalars().all()

    return {
        "business_name": current_user.full_name if current_user else "Green Kitchen",
        "stats": {
            "active_requests": len(requests) or 3,
            "pending_orders": 2,
            "saved_suppliers": 6,
            "upcoming_deliveries": 2
        },
        "active_requests": [
            {
                "product": f"{r.product_name} · {int(r.quantity)} {r.unit}/{r.frequency.lower()}",
                "meta": f"Submitted for {r.delivery_location} · {r.frequency}",
                "status": r.status.capitalize(),
                "status_class": "status-prep" if r.status == "matching" else "status-new" if r.status == "accepted" else "status-done"
            } for r in requests
        ] or [
            {"product": "Tomatoes · 100 kg/week", "meta": "Matching in progress · Gujarat suppliers", "status": "Matching", "status_class": "status-prep"},
            {"product": "Leafy Vegetables · 30 kg/week", "meta": "Request accepted · Suresh Farms", "status": "Accepted", "status_class": "status-new"},
            {"product": "Okra · 20 kg/week", "meta": "Fulfillment confirmed", "status": "Confirmed", "status_class": "status-done"}
        ],
        "upcoming_deliveries": [
            {"title": "Next Delivery", "time": "Tomorrow · 8:00 AM", "detail": "Tomatoes 25 kg + Okra 5 kg · From Ramesh Patel, Gujarat"},
            {"title": "Following Delivery", "time": "Thu · 9:00 AM", "detail": "Leafy Vegetables 8 kg · From Suresh Farms, Punjab"}
        ],
        "saved_suppliers": [
            {"name": "Ramesh Patel", "meta": "📍 Anand, Gujarat · 🌾 Individual Farmer", "crops": "Tomatoes, Okra, Brinjal · Organic"},
            {"name": "Konkan FPO", "meta": "📍 Ratnagiri, Maharashtra · 🏢 FPO", "crops": "Alphonso Mango, Cashew, Coconut · Natural"},
            {"name": "Vidarbha FPO", "meta": "📍 Nagpur, Maharashtra · 🏢 FPO", "crops": "Toor Dal, Chana, Moong Dal · Natural"}
        ]
    }

@router.get("/logistics", response_model=dict)
async def get_logistics_dashboard(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    s_res = await db.execute(select(LogisticsShipment).limit(6))
    shipments = s_res.scalars().all()

    return {
        "company_name": current_user.full_name if current_user else "Express Transports",
        "stats": {
            "active_deliveries": 12,
            "completed_today": 8,
            "available_fleet": "5 / 7"
        },
        "upcoming_pickups": [
            {"name": "Farm Collection — Mehsana", "meta": "Pickup at 7:00 AM", "status": "Pending"},
            {"name": "Hub Transfer — Anand", "meta": "Pickup at 11:00 AM", "status": "Pending"}
        ],
        "active_deliveries": [
            {"title": "Wheat · 200 kg · Metro Wholesale", "meta": "From: Mehsana | To: Ahmedabad", "status": "In Transit"},
            {"title": "Tomatoes · 50 kg · Supermarket Chain", "meta": "From: Anand | To: Baroda", "status": "In Transit"}
        ],
        "routes": [
            {"title": "Route 1: Mehsana -> Ahmedabad (3 stops)", "status": "Assigned to Truck GJ-01-XX"},
            {"title": "Route 2: Anand -> Baroda (2 stops)", "status": "Assigned to Mini-truck GJ-05-YY"}
        ],
        "history": [
            {"title": "Onion 100 kg · Hotel Chain", "meta": "Delivered 2 days ago", "status": "Completed"},
            {"title": "Wheat 80 kg · Retail Shop", "meta": "Delivered 3 days ago", "status": "Completed"}
        ]
    }
