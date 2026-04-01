from __future__ import annotations

import base64
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

import anthropic
from supabase import Client

from backend.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a senior product analytics expert. You are analyzing the impact \
of a feature release based on metric data collected before and after the release date.

You will receive:
- Feature details (name, description, hypothesis, release date)
- Metric snapshots showing values before and after release
- Pre-computed statistics (averages, changes) for each metric
- Optional screenshots of dashboards or UI

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "A concise 2-3 sentence summary of the feature's impact",
  "key_findings": ["finding 1", "finding 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "recommendation": "Clear actionable recommendation",
  "confidence": 0.0 to 1.0
}

Be data-driven and specific. Reference actual numbers and percentage changes. \
If data is insufficient, note that in concerns and lower confidence accordingly."""


class AIAnalysisService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    async def generate_analysis(
        self, feature_id: UUID, comparison_window_days: int
    ) -> dict[str, Any]:
        feature = (
            self.supabase.table("features")
            .select("*")
            .eq("id", str(feature_id))
            .single()
            .execute()
        )
        feature_data = feature.data

        metrics = (
            self.supabase.table("metric_definitions")
            .select("*")
            .eq("feature_id", str(feature_id))
            .execute()
        )

        release_date = datetime.fromisoformat(feature_data["release_date"])
        pre_start = release_date - timedelta(days=comparison_window_days)
        post_end = release_date + timedelta(days=comparison_window_days)

        metric_analysis: list[dict[str, Any]] = []
        for metric in metrics.data:
            snapshots = (
                self.supabase.table("metric_snapshots")
                .select("*")
                .eq("metric_definition_id", metric["id"])
                .gte("snapshot_date", pre_start.isoformat())
                .lte("snapshot_date", post_end.isoformat())
                .order("snapshot_date")
                .execute()
            )

            pre_values: list[float] = []
            post_values: list[float] = []
            for snap in snapshots.data:
                snap_date = datetime.fromisoformat(snap["snapshot_date"])
                if snap_date < release_date:
                    pre_values.append(float(snap["value"]))
                else:
                    post_values.append(float(snap["value"]))

            pre_avg = sum(pre_values) / len(pre_values) if pre_values else 0.0
            post_avg = sum(post_values) / len(post_values) if post_values else 0.0
            change_pct = (
                round(((post_avg - pre_avg) / pre_avg) * 100, 2) if pre_avg != 0 else 0.0
            )

            metric_analysis.append(
                {
                    "metric_name": metric["metric_name"],
                    "display_format": metric["display_format"],
                    "pre_release_avg": round(pre_avg, 4),
                    "post_release_avg": round(post_avg, 4),
                    "change_percent": change_pct,
                    "pre_sample_count": len(pre_values),
                    "post_sample_count": len(post_values),
                }
            )

        # Build prompt
        prompt_parts: list[str] = [
            f"## Feature: {feature_data['name']}",
            f"**Description:** {feature_data.get('description', 'N/A')}",
            f"**Hypothesis:** {feature_data.get('hypothesis', 'N/A')}",
            f"**Release Date:** {feature_data['release_date']}",
            f"**Comparison Window:** {comparison_window_days} days before/after",
            "",
            "## Metric Analysis:",
        ]
        for m in metric_analysis:
            prompt_parts.append(
                f"- **{m['metric_name']}**: "
                f"Pre-release avg={m['pre_release_avg']} ({m['pre_sample_count']} samples), "
                f"Post-release avg={m['post_release_avg']} ({m['post_sample_count']} samples), "
                f"Change={m['change_percent']}%"
            )

        # Screenshots (multimodal)
        screenshots = (
            self.supabase.table("screenshots")
            .select("*")
            .eq("feature_id", str(feature_id))
            .execute()
        )

        content: list[dict[str, Any]] = [{"type": "text", "text": "\n".join(prompt_parts)}]

        for ss in screenshots.data:
            storage_path = ss.get("storage_path", "")
            if storage_path:
                try:
                    file_bytes = self.supabase.storage.from_("screenshots").download(
                        storage_path
                    )
                    b64 = base64.b64encode(file_bytes).decode()
                    media_type = ss.get("content_type", "image/png")
                    content.append(
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": b64,
                            },
                        }
                    )
                    content.append(
                        {
                            "type": "text",
                            "text": f"[Screenshot: {ss.get('filename', 'image')}]",
                        }
                    )
                except Exception:
                    logger.warning("Could not load screenshot %s", storage_path)

        # Call Claude
        response = self.client.messages.create(
            model=settings.anthropic_model,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )

        raw_text = response.content[0].text
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code block
            import re

            match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw_text)
            if match:
                parsed = json.loads(match.group(1))
            else:
                parsed = {
                    "summary": raw_text,
                    "key_findings": [],
                    "concerns": ["Could not parse structured response"],
                    "recommendation": "Review raw response",
                    "confidence": 0.0,
                }

        # Store analysis
        now = datetime.now(timezone.utc).isoformat()
        record = {
            "feature_id": str(feature_id),
            "analysis_date": now,
            "comparison_window_days": comparison_window_days,
            "summary": parsed.get("summary", ""),
            "key_findings": parsed.get("key_findings", []),
            "concerns": parsed.get("concerns", []),
            "recommendation": parsed.get("recommendation", ""),
            "confidence": parsed.get("confidence", 0.0),
            "raw_response": parsed,
            "model_used": settings.anthropic_model,
        }
        result = self.supabase.table("analyses").insert(record).execute()
        return result.data[0]
