from typing import Optional
from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "farmer" # farmer, fpo, bulk, logistics, consumer
    
    # Optional profile metadata during multi-step signup
    farm_name: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    farm_size_acres: Optional[float] = None
    farming_practice: Optional[str] = "organic"
    primary_crops: Optional[str] = None
    monthly_produce_kg: Optional[float] = None

    # FPO specific
    fpo_name: Optional[str] = None
    registration_number: Optional[str] = None
    member_count: Optional[int] = None
    contact_person: Optional[str] = None

    # Bulk specific
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    city: Optional[str] = None

    # Logistics specific
    company_name: Optional[str] = None
    fleet_type: Optional[str] = None
    capacity_tons: Optional[float] = None
    primary_coverage_area: Optional[str] = None
    has_cold_storage: Optional[str] = "No"
    driver_count: Optional[int] = 1

class UserLogin(BaseModel):
    username: str # email or phone
    password: str

class DemoLogin(BaseModel):
    role: str # farmer, fpo, bulk, logistics

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    profile: Optional[dict] = None

    class Config:
        from_attributes = True
