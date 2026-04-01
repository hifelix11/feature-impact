from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class BloomreachTestRequest(BaseModel):
    api_url: Optional[str] = None
    project_token: Optional[str] = None
    api_key_id: Optional[str] = None
    api_secret: Optional[str] = None


class BloomreachConnection(BaseModel):
    connected: bool
    message: str
    project_token: Optional[str] = None


class BloomreachAnalysisResponse(BaseModel):
    success: bool
    data: Optional[dict[str, Any]] = None
    error: Optional[str] = None
