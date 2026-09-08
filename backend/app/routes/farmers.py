from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.models.profile import FarmerProfile, FPOProfile

router = APIRouter(prefix="/farmers", tags=["Farmers Directory"])

@router.get("", response_model=List[dict])
async def list_farmers(
    practice: Optional[str] = Query(None),
    role: Optional[str] = Query(None), # farmer, fpo
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    farmers_data = [
        {
            "id": 1,
            "name": "Ramesh Patel",
            "emoji": "👨‍🌾",
            "location": "Anand, Gujarat",
            "practice": "organic",
            "practice_label": "🌿 Organic",
            "seller_type": "farmer",
            "badge": "Verified Farmer",
            "products": ["Tomatoes", "Okra", "Brinjal", "Wheat"],
            "bio": "Third-generation farmer in Anand specializing in organic vegetables."
        },
        {
            "id": 2,
            "name": "Konkan FPO",
            "emoji": "🏢",
            "location": "Ratnagiri, Maharashtra",
            "practice": "natural",
            "practice_label": "☀️ Natural",
            "seller_type": "fpo",
            "badge": "Verified FPO (84 Farmers)",
            "products": ["Alphonso Mango", "Cashew", "Coconut", "Spices"],
            "bio": "Collective of 84 coastal farmers producing premium GI-tagged produce."
        },
        {
            "id": 3,
            "name": "Vidarbha FPO",
            "emoji": "🏢",
            "location": "Nagpur, Maharashtra",
            "practice": "natural",
            "practice_label": "☀️ Natural",
            "seller_type": "fpo",
            "badge": "Verified FPO (120 Farmers)",
            "products": ["Toor Dal", "Chana Dal", "Moong Dal"],
            "bio": "Farmer producer organisation focused on chemical-free pulses and grains."
        },
        {
            "id": 4,
            "name": "Green Farms Collective",
            "emoji": "👨‍🌾",
            "location": "Amritsar, Punjab",
            "practice": "organic",
            "practice_label": "🌿 Organic",
            "seller_type": "farmer",
            "badge": "Verified Farmer",
            "products": ["Spinach", "Sweet Corn", "Mustard", "Wheat"],
            "bio": "Organic farm producing seasonal greens and sweet corn."
        },
        {
            "id": 5,
            "name": "Nashik Agro Farmer Group",
            "emoji": "👨‍🌾",
            "location": "Nashik, Maharashtra",
            "practice": "conventional",
            "practice_label": "🏡 Conventional",
            "seller_type": "farmer",
            "badge": "Verified Farmer",
            "products": ["Onion", "Grapes", "Pomegranate"],
            "bio": "High-volume quality onion and table fruit producers."
        },
        {
            "id": 6,
            "name": "Malwa FPO",
            "emoji": "🏢",
            "location": "Indore, Madhya Pradesh",
            "practice": "conventional",
            "practice_label": "🏡 Conventional",
            "seller_type": "fpo",
            "badge": "Verified FPO (65 Farmers)",
            "products": ["Garlic", "Soybean", "Wheat"],
            "bio": "Specialized in garlic and rich black-soil wheat crops."
        }
    ]

    filtered = farmers_data
    if practice and practice != "all":
        filtered = [f for f in filtered if f["practice"] == practice.lower()]
    if role and role != "all":
        filtered = [f for f in filtered if f["seller_type"] == role.lower()]
    if search:
        s = search.lower()
        filtered = [f for f in filtered if s in f["name"].lower() or s in f["location"].lower() or any(s in p.lower() for p in f["products"])]

    return filtered
