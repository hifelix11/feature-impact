from __future__ import annotations

import base64
from typing import Any, Optional

import httpx

from backend.config import settings


class BloomreachClient:
    def __init__(
        self,
        api_url: Optional[str] = None,
        project_token: Optional[str] = None,
        api_key_id: Optional[str] = None,
        api_secret: Optional[str] = None,
    ):
        self.api_url = (api_url or settings.bloomreach_api_url).rstrip("/")
        self.project_token = project_token or settings.bloomreach_project_token
        self.api_key_id = api_key_id or settings.bloomreach_api_key_id
        self.api_secret = api_secret or settings.bloomreach_api_secret
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def _auth_header(self) -> str:
        credentials = f"{self.api_key_id}:{self.api_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.api_url,
                headers={
                    "Authorization": self._auth_header,
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    def _analysis_url(self, analysis_type: str) -> str:
        return f"/data/v2/projects/{self.project_token}/analyses/{analysis_type}"

    async def retrieve_funnel(
        self, analysis_id: str, params: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "analysis_id": analysis_id,
            "format": "table_json",
        }
        if params:
            payload.update(params)
        response = await self.client.post(self._analysis_url("funnel"), json=payload)
        response.raise_for_status()
        return response.json()

    async def retrieve_report(
        self, analysis_id: str, params: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "analysis_id": analysis_id,
            "format": "table_json",
        }
        if params:
            payload.update(params)
        response = await self.client.post(self._analysis_url("report"), json=payload)
        response.raise_for_status()
        return response.json()

    async def retrieve_segmentation(
        self, analysis_id: str, params: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "analysis_id": analysis_id,
            "format": "table_json",
        }
        if params:
            payload.update(params)
        response = await self.client.post(
            self._analysis_url("segmentation"), json=payload
        )
        response.raise_for_status()
        return response.json()

    async def retrieve_retention(
        self, analysis_id: str, params: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "analysis_id": analysis_id,
            "format": "table_json",
        }
        if params:
            payload.update(params)
        response = await self.client.post(
            self._analysis_url("retention"), json=payload
        )
        response.raise_for_status()
        return response.json()

    async def test_connection(self) -> dict[str, Any]:
        """Test the Bloomreach connection by making a simple API call."""
        try:
            response = await self.client.post(
                self._analysis_url("funnel"),
                json={"analysis_id": "test", "format": "table_json"},
            )
            # A 404 means the analysis doesn't exist but auth worked.
            # A 401/403 means auth failed.
            if response.status_code in (401, 403):
                return {
                    "connected": False,
                    "message": "Authentication failed. Check your API credentials.",
                }
            return {
                "connected": True,
                "message": "Successfully connected to Bloomreach.",
                "project_token": self.project_token,
            }
        except httpx.HTTPError as exc:
            return {
                "connected": False,
                "message": f"Connection failed: {exc}",
            }

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
