from __future__ import annotations

import uuid
from typing import Any

from supabase import Client


class ScreenshotService:
    BUCKET = "screenshots"

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def upload_screenshot(
        self,
        feature_id: str,
        file_content: bytes,
        filename: str,
        content_type: str = "image/png",
    ) -> dict[str, Any]:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "png"
        storage_path = f"{feature_id}/{uuid.uuid4()}.{ext}"

        self.supabase.storage.from_(self.BUCKET).upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": content_type},
        )

        record = {
            "feature_id": feature_id,
            "filename": filename,
            "storage_path": storage_path,
            "content_type": content_type,
        }
        result = self.supabase.table("screenshots").insert(record).execute()
        return result.data[0]

    async def get_screenshots(self, feature_id: str) -> list[dict[str, Any]]:
        result = (
            self.supabase.table("screenshots")
            .select("*")
            .eq("feature_id", feature_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    async def delete_screenshot(self, screenshot_id: str) -> None:
        record = (
            self.supabase.table("screenshots")
            .select("storage_path")
            .eq("id", screenshot_id)
            .single()
            .execute()
        )
        storage_path = record.data.get("storage_path")
        if storage_path:
            self.supabase.storage.from_(self.BUCKET).remove([storage_path])
        self.supabase.table("screenshots").delete().eq("id", screenshot_id).execute()

    async def get_signed_url(
        self, storage_path: str, expires_in: int = 3600
    ) -> str:
        result = self.supabase.storage.from_(self.BUCKET).create_signed_url(
            storage_path, expires_in
        )
        return result.get("signedURL", result.get("signedUrl", ""))
