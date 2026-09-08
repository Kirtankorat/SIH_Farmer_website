import logging
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("uvicorn")

Base = declarative_base()

_engine: AsyncEngine = None
_session_factory = None

def get_engine() -> AsyncEngine:
    global _engine, _session_factory
    if _engine is not None:
        return _engine

    primary_url = settings.DATABASE_URL
    fallback_url = settings.SQLITE_FALLBACK_URL

    # Check if DATABASE_URL is explicitly set to sqlite or postgres
    # We will test connecting or fallback
    try:
        _engine = create_async_engine(
            primary_url,
            echo=False,
            future=True,
            pool_pre_ping=True
        )
    except Exception as e:
        logger.warning(f"Could not build primary DB engine: {e}. Using fallback {fallback_url}")
        _engine = create_async_engine(fallback_url, echo=False, future=True)

    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    return _engine

def get_session_factory():
    global _session_factory
    if _session_factory is None:
        get_engine()
    return _session_factory

# Direct exports for convenience
engine = get_engine()
AsyncSessionLocal = get_session_factory()

async def init_engine_with_fallback() -> AsyncEngine:
    """Tests primary database connection, falls back to SQLite if PostgreSQL server is not running."""
    global _engine, _session_factory
    primary_url = settings.DATABASE_URL
    fallback_url = settings.SQLITE_FALLBACK_URL

    # If already sqlite, no check needed
    if "sqlite" in primary_url:
        return _engine

    try:
        # Test connection
        test_engine = create_async_engine(primary_url, echo=False, pool_pre_ping=True)
        async with test_engine.connect() as conn:
            pass
        logger.info(f"Connected to primary PostgreSQL database at {primary_url.split('@')[-1]}")
        _engine = test_engine
    except Exception as e:
        logger.warning(
            f"[HarvestLink DB] PostgreSQL service not detected on localhost:5432 ({e}). "
            f"Switching seamlessly to SQLite ({fallback_url}) for local execution."
        )
        _engine = create_async_engine(fallback_url, echo=False, future=True)

    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    return _engine

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        finally:
            await session.close()
