from __future__ import annotations

from fastapi import APIRouter

from backend.models.bloomreach import (
    BloomreachConnection,
    BloomreachTestRequest,
)
from backend.services.bloomreach_client import BloomreachClient

router = APIRouter(prefix="/api/bloomreach", tags=["bloomreach"])


@router.post("/test", response_model=BloomreachConnection)
async def test_connection(request: BloomreachTestRequest):
    client = BloomreachClient(
        api_url=request.api_url or None,
        project_token=request.project_token or None,
        api_key_id=request.api_key_id or None,
        api_secret=request.api_secret or None,
    )
    try:
        result = await client.test_connection()
        return result
    finally:
        await client.close()
