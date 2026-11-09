from fastapi import APIRouter
from app.models.events import AIInsightRequest, AIInsightResponse
from app.services.ai_engine import ai_engine

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/insight", response_model=AIInsightResponse)
async def query_insight(payload: AIInsightRequest):
    """Hybrid Text-to-Insight: Natural language to sandboxed read-only SQL & insight on GitHub data."""
    result = await ai_engine.query_insight(
        prompt=payload.query,
        repo_name=payload.repo_name
    )
    return AIInsightResponse(**result)
