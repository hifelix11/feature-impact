from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.dependencies import get_supabase
from backend.models.metric import (
    MetricDefinitionCreate,
    MetricDefinitionResponse,
    MetricSnapshotResponse,
)
from backend.services.bloomreach_client import BloomreachClient
from backend.services.metric_sync import MetricSyncService

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.post(
    "/features/{feature_id}/metrics",
    response_model=MetricDefinitionResponse,
    status_code=201,
)
async def add_metric_to_feature(
    feature_id: UUID,
    metric: MetricDefinitionCreate,
    supabase=Depends(get_supabase),
):
    if str(metric.feature_id) != str(feature_id):
        raise HTTPException(
            status_code=400, detail="feature_id in body must match URL"
        )
    data = metric.model_dump(mode="json")
    data["feature_id"] = str(feature_id)
    result = supabase.table("metric_definitions").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create metric definition")
    return result.data[0]


@router.delete("/features/{feature_id}/metrics/{metric_id}", status_code=204)
async def remove_metric(
    feature_id: UUID, metric_id: UUID, supabase=Depends(get_supabase)
):
    supabase.table("metric_definitions").delete().eq("id", str(metric_id)).eq(
        "feature_id", str(feature_id)
    ).execute()
    return None


@router.get("/{metric_id}/snapshots", response_model=list[MetricSnapshotResponse])
async def get_snapshots(
    metric_id: UUID,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    supabase=Depends(get_supabase),
):
    query = (
        supabase.table("metric_snapshots")
        .select("*")
        .eq("metric_definition_id", str(metric_id))
    )
    if from_date:
        query = query.gte("snapshot_date", from_date)
    if to_date:
        query = query.lte("snapshot_date", to_date)
    result = query.order("snapshot_date").execute()
    return result.data


@router.post("/sync", status_code=200)
async def trigger_manual_sync(supabase=Depends(get_supabase)):
    bloomreach = BloomreachClient()
    try:
        service = MetricSyncService(supabase, bloomreach)
        results = await service.sync_all_active_features()
        return results
    finally:
        await bloomreach.close()
