from __future__ import annotations

import asyncio
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from backend.config import settings
from backend.dependencies import get_supabase
from backend.services.bloomreach_client import BloomreachClient
from backend.services.metric_sync import MetricSyncService

logger = logging.getLogger(__name__)


def run_metric_sync() -> None:
    """Synchronous wrapper that runs the async metric sync in an event loop."""
    logger.info("Scheduled metric sync starting...")
    supabase = get_supabase()
    bloomreach = BloomreachClient()

    async def _sync():
        try:
            service = MetricSyncService(supabase, bloomreach)
            results = await service.sync_all_active_features()
            logger.info("Metric sync completed: %s", results)
        except Exception:
            logger.exception("Metric sync failed")
        finally:
            await bloomreach.close()

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_sync())
    finally:
        loop.close()


def setup_scheduler() -> BackgroundScheduler:
    """Create and configure the APScheduler background scheduler."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_metric_sync,
        trigger="interval",
        hours=settings.sync_interval_hours,
        id="metric_sync",
        name="Bloomreach Metric Sync",
        replace_existing=True,
    )
    return scheduler
