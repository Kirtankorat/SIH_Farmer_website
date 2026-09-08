from typing import List, Optional, Any
from pydantic import BaseModel

class FarmerDashboardResponse(BaseModel):
    stats: dict
    recent_orders: List[dict]
    demand_insights: List[dict]
    upcoming_logistics: List[dict]
    products: List[dict]
    sales_summary: dict
    transactions: List[dict]

class FPODashboardResponse(BaseModel):
    stats: dict
    recent_orders: List[dict]
    demand_insights: List[dict]
    members: List[dict]
    aggregated_products: List[dict]
    inventory: List[dict]
    bulk_buyers: List[dict]

class BulkDashboardResponse(BaseModel):
    stats: dict
    active_requests: List[dict]
    upcoming_deliveries: List[dict]
    saved_suppliers: List[dict]
    recent_orders: List[dict]

class LogisticsDashboardResponse(BaseModel):
    stats: dict
    active_deliveries: List[dict]
    routes: List[dict]
    history: List[dict]
    upcoming_pickups: List[dict]
