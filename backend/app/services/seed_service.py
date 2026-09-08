import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.profile import FarmerProfile, FPOProfile, BulkBuyerProfile, LogisticsProfile
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.bulk_request import BulkRequest
from app.models.demand import DemandInsight
from app.models.logistics import LogisticsShipment
from app.utils.security import get_password_hash

logger = logging.getLogger("uvicorn")

async def seed_database(db: AsyncSession):
    # 1. Check if already seeded
    res = await db.execute(select(User).limit(1))
    if res.scalars().first():
        logger.info("Database already seeded with initial data.")
        return

    logger.info("Seeding database with initial users, profiles, products, demand charts, and orders...")
    default_hash = get_password_hash("demo123")

    # 2. Demo Users & Profiles
    # Farmer
    farmer_user = User(
        email="rameshpatel@demo.in",
        phone="+919876543210",
        hashed_password=default_hash,
        full_name="Ramesh Patel",
        role="farmer",
        is_active=True,
        is_verified=True
    )
    db.add(farmer_user)
    await db.flush()

    farmer_profile = FarmerProfile(
        user_id=farmer_user.id,
        farm_name="Shree Farms",
        village="Anand",
        district="Anand",
        state="Gujarat",
        farm_size_acres=5.5,
        farming_practice="organic",
        primary_crops="Tomatoes, Okra, Brinjal, Wheat",
        monthly_produce_kg=1200.0
    )
    db.add(farmer_profile)

    # FPO
    fpo_user = User(
        email="konkanfpo@demo.in",
        phone="+919876543211",
        hashed_password=default_hash,
        full_name="Konkan FPO",
        role="fpo",
        is_active=True,
        is_verified=True
    )
    db.add(fpo_user)
    await db.flush()

    fpo_profile = FPOProfile(
        user_id=fpo_user.id,
        fpo_name="Konkan Farmers Producer Org",
        registration_number="FPO/MH/2019/001",
        member_count=84,
        contact_person="Suresh Naik",
        state="Maharashtra",
        district="Ratnagiri",
        primary_commodities="Alphonso Mango, Cashew, Spices, Pulses"
    )
    db.add(fpo_profile)

    # Bulk Buyer
    bulk_user = User(
        email="greenkitchen@demo.in",
        phone="+919876543212",
        hashed_password=default_hash,
        full_name="Green Kitchen",
        role="bulk",
        is_active=True,
        is_verified=True
    )
    db.add(bulk_user)
    await db.flush()

    bulk_profile = BulkBuyerProfile(
        user_id=bulk_user.id,
        business_name="Green Kitchen Pvt. Ltd.",
        business_type="Restaurant",
        contact_person="Arjun Mehta",
        city="Surat",
        state="Gujarat",
        gst_number="24AAACG1234F1Z5"
    )
    db.add(bulk_profile)

    # Logistics
    logistics_user = User(
        email="kisanlogistics@demo.in",
        phone="+919876543213",
        hashed_password=default_hash,
        full_name="Kisan Logistics",
        role="logistics",
        is_active=True,
        is_verified=True
    )
    db.add(logistics_user)
    await db.flush()

    logistics_profile = LogisticsProfile(
        user_id=logistics_user.id,
        company_name="Kisan Logistics Express",
        fleet_type="5x Bolero Maxi Truck & Reefer Van",
        capacity_tons=18.5,
        primary_coverage_area="Gujarat - Maharashtra Corridor",
        has_cold_storage="Yes - Active refrigeration",
        driver_count=7,
        contact_person="Mohan Kumar"
    )
    db.add(logistics_profile)

    # Consumer
    consumer_user = User(
        email="priya@demo.in",
        phone="+919876543214",
        hashed_password=default_hash,
        full_name="Priya Sharma",
        role="consumer",
        is_active=True,
        is_verified=True
    )
    db.add(consumer_user)

    await db.flush()

    # 3. Product Catalog
    catalog_items = [
        {"name": "Fresh Tomatoes", "emoji": "🍅", "price": 32.0, "unit": "kg", "farmer_name": "Shree Farms", "seller_type": "farmer", "location": "Gujarat", "farming_practice": "organic", "category": "vegetables", "rating": 4.3, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 840.0, "description": "Farm-fresh organically grown tomatoes harvested daily."},
        {"name": "Alphonso Mango", "emoji": "🥭", "price": 180.0, "unit": "kg", "farmer_name": "Konkan FPO", "seller_type": "fpo", "location": "Maharashtra", "farming_practice": "natural", "category": "fruits", "rating": 4.8, "availability": "limited", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 1200.0, "description": "Naturally ripened GI-tagged Devgad Ratnagiri Alphonso Mangoes."},
        {"name": "Wheat (Lokwan)", "emoji": "🌾", "price": 42.0, "unit": "kg", "farmer_name": "Gujarat Agri FPO", "seller_type": "fpo", "location": "Gujarat", "farming_practice": "conventional", "category": "grains", "rating": 4.1, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 4500.0, "description": "Premium golden Lokwan wheat grain directly from farmers."},
        {"name": "Turmeric Powder", "emoji": "🟡", "price": 145.0, "unit": "kg", "farmer_name": "Sahyog FPO", "seller_type": "fpo", "location": "Gujarat", "farming_practice": "organic", "category": "spices", "rating": 4.7, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 620.0, "description": "High curcumin pure organic ground turmeric powder."},
        {"name": "Onion", "emoji": "🧅", "price": 28.0, "unit": "kg", "farmer_name": "Nashik Farms", "seller_type": "farmer", "location": "Maharashtra", "farming_practice": "conventional", "category": "vegetables", "rating": 4.0, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 900.0, "description": "A-grade red onions from Nashik farms with long shelf life."},
        {"name": "Potato", "emoji": "🥔", "price": 22.0, "unit": "kg", "farmer_name": "Agro FPO", "seller_type": "fpo", "location": "Gujarat", "farming_practice": "conventional", "category": "vegetables", "rating": 4.2, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 2400.0, "description": "Fresh harvest table potatoes ideal for cooking and bulk frying."},
        {"name": "Toor Dal", "emoji": "🫘", "price": 95.0, "unit": "kg", "farmer_name": "Vidarbha FPO", "seller_type": "fpo", "location": "Maharashtra", "farming_practice": "natural", "category": "pulses", "rating": 4.4, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 850.0, "description": "Unpolished natural toor dal sourced directly from Vidarbha."},
        {"name": "Fresh Milk", "emoji": "🥛", "price": 56.0, "unit": "litre", "farmer_name": "Anand Dairy FPO", "seller_type": "fpo", "location": "Gujarat", "farming_practice": "natural", "category": "dairy", "rating": 4.9, "availability": "limited", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 300.0, "description": "Pure unadulterated farm fresh cow milk."},
        {"name": "Red Chilli", "emoji": "🌶️", "price": 120.0, "unit": "kg", "farmer_name": "Marwar Farms", "seller_type": "farmer", "location": "Rajasthan", "farming_practice": "conventional", "category": "spices", "rating": 4.2, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 400.0, "description": "Sun-dried fiery Mathania red chillies."},
        {"name": "Banana (Robusta)", "emoji": "🍌", "price": 35.0, "unit": "dozen", "farmer_name": "Mysore Plantation", "seller_type": "farmer", "location": "Karnataka", "farming_practice": "natural", "category": "fruits", "rating": 4.5, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 700.0, "description": "Chemical-free naturally ripened robusta bananas."},
        {"name": "Okra (Bhindi)", "emoji": "🌿", "price": 58.0, "unit": "kg", "farmer_name": "Ramesh Patel", "seller_type": "farmer", "location": "Gujarat", "farming_practice": "organic", "category": "vegetables", "rating": 4.6, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 280.0, "description": "Tender green organic okra picked fresh every morning."},
        {"name": "Brinjal", "emoji": "🍆", "price": 40.0, "unit": "kg", "farmer_name": "Ramesh Patel", "seller_type": "farmer", "location": "Gujarat", "farming_practice": "organic", "category": "vegetables", "rating": 4.3, "availability": "limited", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 120.0, "description": "Purple organic brinjals fresh from Anand soil."},
        {"name": "Bajra (Pearl Millet)", "emoji": "🌾", "price": 36.0, "unit": "kg", "farmer_name": "Rajasthan FPO", "seller_type": "fpo", "location": "Rajasthan", "farming_practice": "conventional", "category": "grains", "rating": 4.0, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 3000.0, "description": "High fibre nutrient dense desi pearl millet."},
        {"name": "Spinach", "emoji": "🥬", "price": 30.0, "unit": "kg", "farmer_name": "Green Farms", "seller_type": "farmer", "location": "Punjab", "farming_practice": "organic", "category": "vegetables", "rating": 4.4, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 180.0, "description": "Crisp pesticide-free green spinach bunches."},
        {"name": "Papaya", "emoji": "🍈", "price": 45.0, "unit": "kg", "farmer_name": "Karnataka Orchards", "seller_type": "farmer", "location": "Karnataka", "farming_practice": "natural", "category": "fruits", "rating": 4.3, "availability": "available", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 450.0, "description": "Sweet red lady papayas rich in antioxidants."},
        {"name": "Mustard Oil", "emoji": "🫚", "price": 165.0, "unit": "litre", "farmer_name": "Rajasthan FPO", "seller_type": "fpo", "location": "Rajasthan", "farming_practice": "conventional", "category": "spices", "rating": 4.1, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 500.0, "description": "Cold-pressed kachi ghani pure mustard oil."},
        {"name": "Chana Dal", "emoji": "🫘", "price": 88.0, "unit": "kg", "farmer_name": "Vidarbha FPO", "seller_type": "fpo", "location": "Maharashtra", "farming_practice": "conventional", "category": "pulses", "rating": 4.3, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 920.0, "description": "High protein split chickpea lentils."},
        {"name": "Sweet Corn", "emoji": "🌽", "price": 48.0, "unit": "kg", "farmer_name": "Punjab Farms", "seller_type": "farmer", "location": "Punjab", "farming_practice": "conventional", "category": "vegetables", "rating": 4.2, "availability": "limited", "badge": "Individual Farmer", "seller_id": farmer_user.id, "stock_quantity": 350.0, "description": "Juicy sweet corn cobs directly harvested."},
        {"name": "Garlic", "emoji": "🧄", "price": 72.0, "unit": "kg", "farmer_name": "Malwa FPO", "seller_type": "fpo", "location": "Madhya Pradesh", "farming_practice": "conventional", "category": "vegetables", "rating": 4.1, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 680.0, "description": "Strong pungent aromatic garlic cloves."},
        {"name": "Lemon", "emoji": "🍋", "price": 55.0, "unit": "kg", "farmer_name": "Citrus FPO", "seller_type": "fpo", "location": "Maharashtra", "farming_practice": "natural", "category": "fruits", "rating": 4.6, "availability": "available", "badge": "Verified FPO", "seller_id": fpo_user.id, "stock_quantity": 520.0, "description": "Juicy seedless Kagzi lemons."}
    ]

    for p in catalog_items:
        product = Product(**p)
        db.add(product)

    await db.flush()

    # 4. Demand Insights
    demand_data = [
        {
            "crop_key": "tomato",
            "name": "🍅 Tomato",
            "trend": "high",
            "trend_label": "↑ High Demand",
            "next_week": "+18%",
            "avg_price": "₹32/kg",
            "stock": "1,240 kg",
            "recommendation": "Prepare additional stock. Demand expected to spike next week due to seasonal demand.",
            "bars": [55, 60, 52, 70, 68, 82, 90, 95, 88, 100, 92, 98, 110, 118]
        },
        {
            "crop_key": "onion",
            "name": "🧅 Onion",
            "trend": "stable",
            "trend_label": "→ Stable",
            "next_week": "+3%",
            "avg_price": "₹28/kg",
            "stock": "3,600 kg",
            "recommendation": "Maintain current supply. Demand is steady with no significant changes expected.",
            "bars": [78, 80, 76, 82, 79, 81, 83, 80, 82, 84, 81, 83, 85, 83]
        },
        {
            "crop_key": "potato",
            "name": "🥔 Potato",
            "trend": "low",
            "trend_label": "↓ Moderate Drop",
            "next_week": "-6%",
            "avg_price": "₹22/kg",
            "stock": "4,200 kg",
            "recommendation": "Avoid overstocking. Demand is expected to moderate — plan supply accordingly.",
            "bars": [90, 88, 85, 80, 75, 72, 68, 65, 63, 62, 60, 58, 56, 54]
        },
        {
            "crop_key": "wheat",
            "name": "🌾 Wheat",
            "trend": "stable",
            "trend_label": "→ Consistent",
            "next_week": "+1%",
            "avg_price": "₹42/kg",
            "stock": "12,000 kg",
            "recommendation": "Supply is aligned with demand. Continue regular production schedule.",
            "bars": [72, 74, 73, 75, 74, 76, 75, 77, 76, 74, 75, 76, 77, 76]
        }
    ]

    for d in demand_data:
        insight = DemandInsight(**d)
        db.add(insight)

    # 5. Sample Initial Orders
    now = datetime.now(timezone.utc)
    order1 = Order(
        order_number="HL1024",
        buyer_id=consumer_user.id,
        buyer_name="Priya Sharma",
        buyer_email="priya@demo.in",
        buyer_phone="+919876543214",
        delivery_address="Flat 402, Green Meadows, Anand, Gujarat",
        delivery_city="Anand",
        delivery_state="Gujarat",
        status="preparing",
        subtotal=122.0,
        delivery_fee=40.0,
        discount=0.0,
        total_amount=162.0,
        expected_delivery=now + timedelta(days=1),
        created_at=now - timedelta(hours=2)
    )
    db.add(order1)
    await db.flush()

    item1 = OrderItem(
        order_id=order1.id,
        product_name="Fresh Tomatoes",
        emoji="🍅",
        price=32.0,
        quantity=2,
        unit="kg",
        seller_name="Shree Farms",
        seller_id=farmer_user.id,
        line_total=64.0
    )
    item2 = OrderItem(
        order_id=order1.id,
        product_name="Okra (Bhindi)",
        emoji="🌿",
        price=58.0,
        quantity=1,
        unit="kg",
        seller_name="Ramesh Patel",
        seller_id=farmer_user.id,
        line_total=58.0
    )
    db.add_all([item1, item2])

    # Logistics Shipment for order1
    shipment1 = LogisticsShipment(
        order_id=order1.id,
        partner_id=logistics_user.id,
        driver_name="Mohan Kumar",
        driver_phone="+919876500001",
        vehicle_number="GJ-23-AB-4050",
        origin="Shree Farms, Anand",
        destination="Green Meadows, Anand",
        status="in_transit",
        pickup_time="Today · 4:30 PM",
        delivery_time="Tomorrow · 10:00 AM",
        cargo_summary="Tomatoes 32 kg, Okra 5 kg",
        route_steps=[
            {"title": "Shree Farms — Ramesh Patel", "sub": "Pickup · 4:30 PM", "status": "done"},
            {"title": "Anand Collection Point", "sub": "Sorting · 5:30 PM", "status": "active"},
            {"title": "Mehul Stores, Anand", "sub": "Tomorrow 10:00 AM", "status": "pending"},
            {"title": "Green Kitchen, Surat", "sub": "Tomorrow 12:30 PM", "status": "pending"}
        ]
    )
    db.add(shipment1)

    # 6. Sample Bulk Requests
    bulk_req1 = BulkRequest(
        buyer_id=bulk_user.id,
        business_name="Green Kitchen Pvt. Ltd.",
        business_type="Restaurant",
        contact_name="Arjun Mehta",
        phone="+919876543212",
        email="greenkitchen@demo.in",
        product_name="Tomatoes",
        quantity=100.0,
        unit="kg",
        frequency="Weekly",
        delivery_location="Surat, Gujarat",
        required_date=(now + timedelta(days=3)).date(),
        additional_notes="Looking for consistent high-quality organic tomatoes for soup and salads.",
        status="matching"
    )
    bulk_req2 = BulkRequest(
        buyer_id=bulk_user.id,
        business_name="Green Kitchen Pvt. Ltd.",
        business_type="Restaurant",
        contact_name="Arjun Mehta",
        phone="+919876543212",
        email="greenkitchen@demo.in",
        product_name="Leafy Vegetables",
        quantity=30.0,
        unit="kg",
        frequency="Weekly",
        delivery_location="Surat, Gujarat",
        required_date=(now + timedelta(days=2)).date(),
        additional_notes="Spinach, Coriander, Mint leaves.",
        status="accepted"
    )
    db.add_all([bulk_req1, bulk_req2])

    await db.commit()
    logger.info("Database seeding completed successfully!")
