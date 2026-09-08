from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.orders import router as orders_router
from app.routes.bulk_requests import router as bulk_router
from app.routes.dashboards import router as dashboards_router
from app.routes.demand import router as demand_router
from app.routes.farmers import router as farmers_router
from app.routes.logistics import router as logistics_router
from app.routes.contact import router as contact_router

__all__ = [
    "auth_router",
    "products_router",
    "orders_router",
    "bulk_router",
    "dashboards_router",
    "demand_router",
    "farmers_router",
    "logistics_router",
    "contact_router"
]
