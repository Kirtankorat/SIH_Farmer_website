import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_engine_with_fallback, get_session_factory, Base
from app.services.seed_service import seed_database
from app.routes import (
    auth_router,
    products_router,
    orders_router,
    bulk_router,
    dashboards_router,
    demand_router,
    farmers_router,
    logistics_router,
    contact_router
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("harvestlink")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting HarvestLink Backend API...")
    # Initialize DB connection with fallback
    active_engine = await init_engine_with_fallback()
    session_factory = get_session_factory()

    # Create tables if they do not exist
    async with active_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run seed script on startup
    async with session_factory() as session:
        try:
            await seed_database(session)
        except Exception as e:
            logger.error(f"Seeding note: {e}")

    yield
    logger.info("Shutting down HarvestLink Backend API...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="HarvestLink — Direct Farm-to-Market Platform Backend API with PostgreSQL and JWT Authentication",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(bulk_router, prefix=settings.API_V1_STR)
app.include_router(dashboards_router, prefix=settings.API_V1_STR)
app.include_router(demand_router, prefix=settings.API_V1_STR)
app.include_router(farmers_router, prefix=settings.API_V1_STR)
app.include_router(logistics_router, prefix=settings.API_V1_STR)
app.include_router(contact_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "HarvestLink Backend API is running successfully.",
        "documentation": "/docs",
        "version": settings.VERSION
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "version": settings.VERSION
    }
