from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from supabase import Client

from backend.services.bloomreach_client import BloomreachClient

logger = logging.getLogger(__name__)


class MetricSyncService:
    def __init__(self, supabase: Client, bloomreach: BloomreachClient):
        self.supabase = supabase
        self.bloomreach = bloomreach

    async def sync_all_active_features(self) -> dict[str, Any]:
        """Sync metrics for all features with status 'monitoring'."""
        features = (
            self.supabase.table("features")
            .select("id")
            .eq("status", "monitoring")
            .execute()
        )
        results: dict[str, Any] = {"synced": 0, "errors": 0, "details": []}
        for feature in features.data:
            feature_id = feature["id"]
            try:
                count = await self.sync_feature_metrics(UUID(feature_id))
                results["synced"] += count
                results["details"].append(
                    {"feature_id": feature_id, "metrics_synced": count}
                )
            except Exception as exc:
                logger.exception("Error syncing feature %s", feature_id)
                results["errors"] += 1
                results["details"].append(
                    {"feature_id": feature_id, "error": str(exc)}
                )
        return results

    async def sync_feature_metrics(self, feature_id: UUID) -> int:
        """Sync all metric definitions for a given feature. Returns count synced."""
        definitions = (
            self.supabase.table("metric_definitions")
            .select("*")
            .eq("feature_id", str(feature_id))
            .execute()
        )
        count = 0
        for defn in definitions.data:
            try:
                await self._sync_single_metric(defn)
                count += 1
            except Exception as exc:
                logger.exception(
                    "Error syncing metric %s (%s)", defn["id"], defn["metric_name"]
                )
                raise exc
        return count

    async def _sync_single_metric(self, defn: dict[str, Any]) -> None:
        analysis_type = defn["bloomreach_analysis_type"]
        analysis_id = defn["bloomreach_analysis_id"]

        retrieve_fn = {
            "funnel": self.bloomreach.retrieve_funnel,
            "report": self.bloomreach.retrieve_report,
            "segmentation": self.bloomreach.retrieve_segmentation,
            "retention": self.bloomreach.retrieve_retention,
        }.get(analysis_type)

        if retrieve_fn is None:
            raise ValueError(f"Unknown analysis type: {analysis_type}")

        raw_data = await retrieve_fn(analysis_id)
        value = self._extract_value(raw_data, defn["value_extraction_path"])

        now = datetime.now(timezone.utc).isoformat()
        self.supabase.table("metric_snapshots").upsert(
            {
                "metric_definition_id": defn["id"],
                "snapshot_date": now,
                "value": value,
                "metadata": {"raw_response_keys": list(raw_data.keys())},
            },
            on_conflict="metric_definition_id,snapshot_date",
        ).execute()

    @staticmethod
    def _extract_value(data: dict[str, Any], extraction_path: str) -> float:
        """Extract a numeric value from Bloomreach response using the path spec.

        Supported path formats:
        - column:N  – take value from column index N of the first data row
        - step:N    – take value from funnel step N
        - conversion – calculate conversion rate from first/last funnel step
        """
        parts = extraction_path.split(":")
        method = parts[0]

        rows: list[Any] = data.get("data", [])
        if isinstance(rows, list) and len(rows) > 0:
            first_row = rows[0] if not isinstance(rows[0], dict) else rows[0]
        else:
            first_row = rows

        if method == "column":
            index = int(parts[1]) if len(parts) > 1 else 0
            if isinstance(first_row, dict):
                values = list(first_row.values())
                return float(values[index]) if index < len(values) else 0.0
            if isinstance(first_row, (list, tuple)):
                return float(first_row[index]) if index < len(first_row) else 0.0
            return float(first_row) if first_row else 0.0

        if method == "step":
            index = int(parts[1]) if len(parts) > 1 else 0
            steps = data.get("steps", data.get("data", []))
            if isinstance(steps, list) and index < len(steps):
                step = steps[index]
                if isinstance(step, dict):
                    return float(step.get("count", step.get("value", 0)))
                return float(step)
            return 0.0

        if method == "conversion":
            steps = data.get("steps", data.get("data", []))
            if isinstance(steps, list) and len(steps) >= 2:
                first_val = (
                    float(steps[0].get("count", steps[0].get("value", 0)))
                    if isinstance(steps[0], dict)
                    else float(steps[0])
                )
                last_val = (
                    float(steps[-1].get("count", steps[-1].get("value", 0)))
                    if isinstance(steps[-1], dict)
                    else float(steps[-1])
                )
                if first_val > 0:
                    return round((last_val / first_val) * 100, 2)
            return 0.0

        raise ValueError(f"Unknown extraction method: {method}")
