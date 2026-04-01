from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from backend.config import settings


class AnalysisRequest(BaseModel):
    feature_id: UUID
    comparison_window_days: int = Field(
        default=settings.default_comparison_window_days, ge=1, le=90
    )


class AnalysisResponse(BaseModel):
    id: UUID
    feature_id: UUID
    analysis_date: datetime
    comparison_window_days: int
    summary: str
    key_findings: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    recommendation: str = ""
    confidence: float = 0.0
    raw_response: Optional[dict[str, Any]] = None
    model_used: str = ""
    created_at: datetime
