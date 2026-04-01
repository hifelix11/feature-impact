from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.routers import analysis, bloomreach, features, metrics, screenshots
from backend.tasks.sync_scheduler import setup_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    scheduler = setup_scheduler()
    scheduler.start()
    logger.info(
        "APScheduler started – metric sync every %d hours",
        settings.sync_interval_hours,
    )
    yield
    scheduler.shutdown(wait=False)
    logger.info("APScheduler shut down")


app = FastAPI(
    title="Pulse - Feature Impact Tracker",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(features.router)
app.include_router(metrics.router)
app.include_router(analysis.router)
app.include_router(screenshots.router)
app.include_router(bloomreach.router)


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "app": "Pulse - Feature Impact Tracker",
        "environment": settings.app_env,
    }
