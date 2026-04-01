from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.config import settings
from backend.dependencies import get_supabase
from backend.models.analysis import AnalysisRequest, AnalysisResponse
from backend.services.ai_analysis import AIAnalysisService

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/{feature_id}", response_model=AnalysisResponse, status_code=201)
async def generate_analysis(
    feature_id: UUID,
    comparison_window_days: int = Query(
        default=None,
        description="Number of days before/after release to compare",
    ),
    supabase=Depends(get_supabase),
):
    window = comparison_window_days or settings.default_comparison_window_days
    service = AIAnalysisService(supabase)
    try:
        result = await service.generate_analysis(feature_id, window)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")


@router.get("/{feature_id}", response_model=AnalysisResponse)
async def get_latest_analysis(
    feature_id: UUID,
    supabase=Depends(get_supabase),
):
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("feature_id", str(feature_id))
        .order("analysis_date", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No analysis found for this feature")
    return result.data[0]


@router.get("/{feature_id}/history", response_model=list[AnalysisResponse])
async def get_analysis_history(
    feature_id: UUID,
    supabase=Depends(get_supabase),
):
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("feature_id", str(feature_id))
        .order("analysis_date", desc=True)
        .execute()
    )
    return result.data
