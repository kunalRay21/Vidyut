import abc
import time
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime


class BaseConnector(abc.ABC):
    """
    Abstract Base Class for all Vidyut Opportunity Connectors.
    Enforces politeness rules:
    - Minimum 3-second delay between sequential network requests.
    - Descriptive Government of India / SIH bot User-Agent.
    - Safe error handling and graceful offline fallback for live demos.
    """

    def __init__(self, delay_seconds: float = 3.0, source: str = "UNKNOWN"):
        self.delay_seconds = delay_seconds
        self.source = source.upper()
        self.last_request_time = 0.0
        self.session = requests.Session()
        self.user_agent = (
            "Vidyut-Bot/1.0 (+https://vidyut.gov.in; SIH-2026; Opportunity Ingestion Pipeline)"
        )
        self.session.headers.update({
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        })

    def _rate_limit(self):
        """Enforce politeness delay between network requests."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.delay_seconds:
            time.sleep(self.delay_seconds - elapsed)
        self.last_request_time = time.time()

    def get(self, url: str, params: Optional[Dict[str, Any]] = None, timeout: int = 10) -> Optional[requests.Response]:
        """Perform a rate-limited GET request with error handling."""
        self._rate_limit()
        try:
            response = self.session.get(url, params=params, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            # Network issue, bot blocked, or 403/500
            return None

    @abc.abstractmethod
    def fetch_raw(self, keyword: str = "backend", limit: int = 10) -> List[Any]:
        """Fetch raw listing objects or HTML chunks from the source."""
        pass

    @abc.abstractmethod
    def normalize(self, raw_item: Any) -> Dict[str, Any]:
        """Normalize raw scraped item into canonical Vidyut Opportunity dictionary."""
        pass

    def run(self, keyword: str = "backend", limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch and normalize a batch of opportunities."""
        raw_items = self.fetch_raw(keyword=keyword, limit=limit)
        results = []
        for raw in raw_items:
            try:
                normalized = self.normalize(raw)
                if normalized:
                    results.append(normalized)
            except Exception as ex:
                # Isolate parsing error for single record
                continue
        return results
