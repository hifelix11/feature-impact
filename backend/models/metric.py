from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MetricDefinitionCreate(BaseModel):
    feature_id: UUID
    metric_name: str = Field(..., min_length=1, max_length=255)
    bloomreach_analysis_id: str
    bloomreach_analysis_type: str = Field(
        ..., pattern="^(funnel|report|segmentation|retention)$"
    )
    value_extraction_path: str = Field(
        default="column:0",
        description="Path to extract value: column:N, step:N, conversion",
    )
    display_format: str = Field(default="number", pattern="^(number|percentage|currency)$")


class MetricDefinitionResponse(BaseModel):
    id: UUID
    feature_id: UUID
    metric_name: str
    bloomreach_analysis_id: str
    bloomreach_analysis_type: str
    value_extraction_path: str
    display_format: str
    created_at: datetime


class MetricSnapshotResponse(BaseModel):
    id: UUID
    metric_definition_id: UUID
    snapshot_date: datetime
    value: float
    metadata: Optional[dict[str, Any]] = None
    created_at: datetime
