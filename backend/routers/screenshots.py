from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from backend.dependencies import get_supabase
from backend.services.screenshot_service import ScreenshotService

router = APIRouter(prefix="/api/screenshots", tags=["screenshots"])


@router.post("/{feature_id}", status_code=201)
async def upload_screenshot(
    feature_id: UUID,
    file: UploadFile = File(...),
    supabase=Depends(get_supabase),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    content = await file.read()
    service = ScreenshotService(supabase)
    result = await service.upload_screenshot(
        feature_id=str(feature_id),
        file_content=content,
        filename=file.filename or "screenshot.png",
        content_type=file.content_type,
    )
    return result


@router.get("/{feature_id}")
async def list_screenshots(
    feature_id: UUID,
    supabase=Depends(get_supabase),
):
    service = ScreenshotService(supabase)
    screenshots = await service.get_screenshots(str(feature_id))
    # Attach signed URLs for each screenshot
    for ss in screenshots:
        if ss.get("storage_path"):
            ss["signed_url"] = await service.get_signed_url(ss["storage_path"])
    return screenshots


@router.delete("/{screenshot_id}", status_code=204)
async def delete_screenshot(
    screenshot_id: UUID,
    supabase=Depends(get_supabase),
):
    service = ScreenshotService(supabase)
    await service.delete_screenshot(str(screenshot_id))
    return None
