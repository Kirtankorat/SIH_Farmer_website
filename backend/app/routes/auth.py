from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.models.profile import FarmerProfile, FPOProfile, BulkBuyerProfile, LogisticsProfile
from app.schemas.auth import UserRegister, UserLogin, DemoLogin, TokenResponse, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.services.auth_service import get_current_user, require_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    existing = await db.execute(select(User).where((User.email == data.email) | (User.phone == data.phone if data.phone else False)))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )

    # Create User
    new_user = User(
        email=data.email,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    await db.flush()

    # Create associated profile based on role
    if data.role == "farmer":
        profile = FarmerProfile(
            user_id=new_user.id,
            farm_name=data.farm_name or f"{data.full_name}'s Farm",
            village=data.village,
            district=data.district,
            state=data.state,
            farm_size_acres=data.farm_size_acres,
            farming_practice=data.farming_practice or "organic",
            primary_crops=data.primary_crops,
            monthly_produce_kg=data.monthly_produce_kg
        )
        db.add(profile)
    elif data.role == "fpo":
        profile = FPOProfile(
            user_id=new_user.id,
            fpo_name=data.fpo_name or f"{data.full_name} FPO",
            registration_number=data.registration_number,
            member_count=data.member_count or 0,
            contact_person=data.contact_person or data.full_name,
            state=data.state,
            district=data.district
        )
        db.add(profile)
    elif data.role == "bulk":
        profile = BulkBuyerProfile(
            user_id=new_user.id,
            business_name=data.business_name or data.full_name,
            business_type=data.business_type or "Restaurant",
            contact_person=data.contact_person or data.full_name,
            city=data.city,
            state=data.state
        )
        db.add(profile)
    elif data.role == "logistics":
        profile = LogisticsProfile(
            user_id=new_user.id,
            company_name=data.company_name or data.full_name,
            fleet_type=data.fleet_type,
            capacity_tons=data.capacity_tons,
            primary_coverage_area=data.primary_coverage_area,
            has_cold_storage=data.has_cold_storage or "No",
            driver_count=data.driver_count or 1,
            contact_person=data.contact_person or data.full_name
        )
        db.add(profile)

    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.full_name,
            "role": new_user.role
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            (User.email == data.username) | (User.phone == data.username)
        )
    )
    user = result.scalars().first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password"
        )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role
        }
    }

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(data: DemoLogin, db: AsyncSession = Depends(get_db)):
    # Find matching demo account by role
    result = await db.execute(select(User).where(User.role == data.role).limit(1))
    user = result.scalars().first()
    if not user:
        # Fallback if seed not done: return demo token
        return {
            "access_token": create_access_token(subject=1, role=data.role),
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": f"{data.role}@demo.in",
                "name": data.role.capitalize() + " Demo",
                "role": data.role
            }
        }

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(require_auth)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified
    }
