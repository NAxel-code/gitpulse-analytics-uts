from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.models.events import KPISummaryResponse, TrafficSeriesPoint, UTMPerformanceItem, FunnelStageItem, AnomalyAlertItem
from app.services.storage import get_storage
from app.services.anomaly import anomaly_detector

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=KPISummaryResponse)
async def get_overview(
    workspace_id: str = Query("default-workspace"),
    days: int = Query(30, ge=1, le=365)
):
    """Calculates Bento Grid KPI metrics with delta percentages."""
    storage = get_storage()
    return storage.get_kpi_summary(workspace_id=workspace_id, days=days)

@router.get("/traffic-series", response_model=List[TrafficSeriesPoint])
async def get_traffic_series(
    workspace_id: str = Query("default-workspace"),
    days: int = Query(14, ge=1, le=90)
):
    """Time-series data for Area & Line charts."""
    storage = get_storage()
    return storage.get_traffic_series(workspace_id=workspace_id, days=days)

@router.get("/utm-breakdown", response_model=List[UTMPerformanceItem])
async def get_utm_breakdown(
    workspace_id: str = Query("default-workspace"),
    days: int = Query(30, ge=1, le=365)
):
    """Attribution breakdown table by UTM Source, Medium, and Campaign."""
    storage = get_storage()
    return storage.get_utm_breakdown(workspace_id=workspace_id, days=days)

@router.get("/funnel", response_model=List[FunnelStageItem])
async def get_funnel(
    workspace_id: str = Query("default-workspace"),
    days: int = Query(30, ge=1, le=365)
):
    """Conversion funnel stages (Visit -> Discovery -> Lead -> Purchase)."""
    storage = get_storage()
    return storage.get_funnel_stages(workspace_id=workspace_id, days=days)

@router.get("/anomalies", response_model=List[AnomalyAlertItem])
async def get_anomalies(
    workspace_id: str = Query("default-workspace")
):
    """Real-time statistical anomaly alerts."""
    return anomaly_detector.detect_anomalies(workspace_id=workspace_id)
