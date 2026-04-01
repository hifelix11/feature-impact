from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FeatureCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    release_date: datetime
    status: str = Field(default="monitoring", pattern="^(monitoring|completed|archived)$")
    tags: list[str] = Field(default_factory=list)
    hypothesis: Optional[str] = None
    bloomreach_segment_id: Optional[str] = None


class FeatureUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    release_date: Optional[datetime] = None
    status: Optional[str] = Field(default=None, pattern="^(monitoring|completed|archived)$")
    tags: Optional[list[str]] = None
    hypothesis: Optional[str] = None
    bloomreach_segment_id: Optional[str] = None


class FeatureResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    release_date: datetime
    status: str
    tags: list[str] = Field(default_factory=list)
    hypothesis: Optional[str] = None
    bloomreach_segment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
