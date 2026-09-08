from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/products", tags=["Products"])

def format_product_response(p: Product) -> dict:
    price_val = float(p.price)
    return {
        "id": p.id,
        "name": p.name,
        "emoji": p.emoji or "🌾",
        "category": p.category,
        "farming_practice": p.farming_practice,
        "seller_type": p.seller_type,
        "price": price_val,
        "priceNum": price_val,
        "unit": p.unit,
        "farmer_name": p.farmer_name or "Verified Farmer",
        "farmer": p.farmer_name or "Verified Farmer", # alias for frontend compatibility
        "practice": p.farming_practice, # alias for frontend compatibility
        "location": p.location or "India",
        "rating": float(p.rating) if p.rating else 4.5,
        "review_count": p.review_count or 0,
        "availability": p.availability or "available",
        "stock_quantity": float(p.stock_quantity) if p.stock_quantity else 100.0,
        "badge": p.badge or "Individual Farmer",
        "description": p.description or "",
        "seller_id": p.seller_id,
        "is_active": p.is_active,
        "created_at": p.created_at
    }

@router.get("", response_model=List[dict])
async def list_products(
    search: Optional[str] = Query(None, description="Search term across name, farmer, location, category"),
    category: Optional[str] = Query(None, description="Filter by category"),
    practice: Optional[str] = Query(None, description="Filter by farming practice: organic, natural, conventional"),
    seller_type: Optional[str] = Query(None, description="Filter by seller type: farmer, fpo"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    sort: Optional[str] = Query("recommended", description="Sort order: recommended, price-low, price-high, rating"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.is_active == True)

    # Search filter
    if search:
        s = f"%{search.lower()}%"
        query = query.where(
            or_(
                Product.name.ilike(s),
                Product.farmer_name.ilike(s),
                Product.location.ilike(s),
                Product.category.ilike(s)
            )
        )

    # Specific filters
    if category and category != "all":
        cats = [c.strip() for c in category.split(",")]
        query = query.where(Product.category.in_(cats))
    if practice and practice != "all":
        pracs = [p.strip() for p in practice.split(",")]
        query = query.where(Product.farming_practice.in_(pracs))
    if seller_type and seller_type != "all":
        sellers = [s.strip() for s in seller_type.split(",")]
        query = query.where(Product.seller_type.in_(sellers))
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Sorting
    if sort == "price-low":
        query = query.order_by(asc(Product.price))
    elif sort == "price-high":
        query = query.order_by(desc(Product.price))
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    else:
        query = query.order_by(asc(Product.id))

    result = await db.execute(query)
    products = result.scalars().all()
    return [format_product_response(p) for p in products]

@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return format_product_response(product)

@router.get("/{product_id}/related", response_model=List[dict])
async def get_related_products(product_id: int, limit: int = 4, db: AsyncSession = Depends(get_db)):
    # Get base product category
    result = await db.execute(select(Product).where(Product.id == product_id))
    base_prod = result.scalars().first()
    if not base_prod:
        return []
    
    query = select(Product).where(
        Product.id != product_id,
        Product.category == base_prod.category,
        Product.is_active == True
    ).limit(limit)
    
    res = await db.execute(query)
    related = res.scalars().all()
    return [format_product_response(p) for p in related]

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(require_role(["farmer", "fpo"])),
    db: AsyncSession = Depends(get_db)
):
    new_product = Product(
        seller_id=current_user.id,
        name=data.name,
        emoji=data.emoji or "🌾",
        category=data.category,
        farming_practice=data.farming_practice,
        seller_type="fpo" if current_user.role == "fpo" else "farmer",
        price=data.get_effective_price(),
        unit=data.unit or "kg",
        farmer_name=data.farmer_name or current_user.full_name,
        location=data.location or "India",
        availability=data.availability or "available",
        stock_quantity=data.stock_quantity or 100.0,
        badge="Verified FPO" if current_user.role == "fpo" else "Individual Farmer",
        description=data.description
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return format_product_response(new_product)

@router.put("/{product_id}", response_model=dict)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(require_role(["farmer", "fpo"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this product")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    return format_product_response(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: User = Depends(require_role(["farmer", "fpo"])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if product.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this product")

    product.is_active = False
    await db.commit()
    return None
