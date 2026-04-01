from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from backend.dependencies import get_supabase
from backend.models.feature import FeatureCreate, FeatureResponse, FeatureUpdate

router = APIRouter(prefix="/api/features", tags=["features"])


@router.get("/", response_model=list[FeatureResponse])
async def list_features(supabase=Depends(get_supabase)):
    result = (
        supabase.table("features")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/", response_model=FeatureResponse, status_code=201)
async def create_feature(feature: FeatureCreate, supabase=Depends(get_supabase)):
    data = feature.model_dump(mode="json")
    # Convert datetime to ISO string
    if data.get("release_date"):
        data["release_date"] = feature.release_date.isoformat()
    result = supabase.table("features").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create feature")
    return result.data[0]


@router.get("/{feature_id}", response_model=FeatureResponse)
async def get_feature(feature_id: UUID, supabase=Depends(get_supabase)):
    result = (
        supabase.table("features")
        .select("*")
        .eq("id", str(feature_id))
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Feature not found")
    return result.data


@router.put("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    feature_id: UUID, feature: FeatureUpdate, supabase=Depends(get_supabase)
):
    data = feature.model_dump(mode="json", exclude_none=True)
    if "release_date" in data and data["release_date"]:
        data["release_date"] = feature.release_date.isoformat()
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        supabase.table("features")
        .update(data)
        .eq("id", str(feature_id))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Feature not found")
    return result.data[0]


@router.delete("/{feature_id}", status_code=204)
async def delete_feature(feature_id: UUID, supabase=Depends(get_supabase)):
    supabase.table("features").delete().eq("id", str(feature_id)).execute()
    return None
