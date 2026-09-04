import threading
import time
import logging
from datetime import datetime
from typing import Optional, List, Callable

from src.pipeline.orchestrator import PipelineOrchestrator

logger = logging.getLogger("vidyut.pipeline.scheduler")


class OpportunityPipelineScheduler:
    """
    Background periodic scheduler for Vidyut web scraping pipeline.
    Periodically executes multi-source connectors and ingestion every 24 hours
    (or custom interval in seconds).
    Owned by Member 5 (Data Engineer: Scraping & Ingestion).
    """

    def __init__(
        self,
        interval_hours: float = 24.0,
        keywords: Optional[List[str]] = None,
        on_complete: Optional[Callable] = None
    ):
        self.interval_seconds = interval_hours * 3600.0
        self.keywords = keywords or ["backend", "machine learning"]
        self.on_complete = on_complete
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._is_running = False
        self.last_run_at: Optional[datetime] = None
        self.last_run_result: Optional[dict] = None

    def _run_loop(self):
        logger.info(f"Opportunity pipeline scheduler started. Interval: {self.interval_seconds}s")
        while not self._stop_event.is_set():
            try:
                logger.info("Executing scheduled opportunity ingestion run...")
                orchestrator = PipelineOrchestrator()
                results = orchestrator.run_all(keywords=self.keywords)
                self.last_run_at = datetime.utcnow()
                self.last_run_result = results
                logger.info(f"Scheduled run completed: {results}")
                if self.on_complete:
                    self.on_complete(results)
            except Exception as e:
                logger.error(f"Error during scheduled opportunity pipeline run: {e}")

            # Wait for next interval or until stopped
            if self._stop_event.wait(timeout=self.interval_seconds):
                break

        self._is_running = False
        logger.info("Opportunity pipeline scheduler stopped.")

    def start(self, run_immediately: bool = False):
        """Start the background scheduling thread."""
        if self._is_running:
            return

        self._stop_event.clear()
        self._is_running = True

        if not run_immediately:
            # First sleep before initial scheduled run
            def delayed_start():
                if not self._stop_event.wait(timeout=self.interval_seconds):
                    self._run_loop()
            self._thread = threading.Thread(target=delayed_start, daemon=True, name="VidyutScraperScheduler")
        else:
            self._thread = threading.Thread(target=self._run_loop, daemon=True, name="VidyutScraperScheduler")

        self._thread.start()

    def stop(self):
        """Signal the scheduler thread to stop."""
        if not self._is_running:
            return
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        self._is_running = False

    @property
    def is_running(self) -> bool:
        return self._is_running

    def trigger_now(self) -> dict:
        """Trigger an on-demand immediate execution of the pipeline."""
        orchestrator = PipelineOrchestrator()
        results = orchestrator.run_all(keywords=self.keywords)
        self.last_run_at = datetime.utcnow()
        self.last_run_result = results
        return results


# Global singleton instance for application-level lifecycle management
pipeline_scheduler = OpportunityPipelineScheduler(interval_hours=24.0)
