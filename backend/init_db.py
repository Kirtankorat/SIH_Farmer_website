import asyncio
import logging
from app.database import init_engine_with_fallback, get_session_factory, Base
from app.services.seed_service import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("harvestlink-init")

async def init():
    logger.info("Initializing database connection...")
    active_engine = await init_engine_with_fallback()
    session_factory = get_session_factory()

    logger.info("Creating all tables in database...")
    async with active_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Tables created successfully.")

    logger.info("Seeding initial dataset...")
    async with session_factory() as session:
        await seed_database(session)
    logger.info("Database initialization and seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(init())
