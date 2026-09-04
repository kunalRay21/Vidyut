import os
import sys
from datetime import datetime, date
from typing import List, Dict, Any, Optional

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from sqlalchemy.orm import Session
from src.modules.opportunities.models import Opportunity, OpportunitySkillTag
from src.pipeline.deduplication import generate_fingerprint
from src.pipeline.connectors.unstop_connector import UnstopConnector
from src.pipeline.connectors.internshala_connector import InternshalaConnector
from src.pipeline.connectors.aicte_connector import AicteConnector
from src.pipeline.manual_seed_loader import ensure_tables_exist, SessionLocal, parse_date


class PipelineOrchestrator:
    """
    Coordinates multi-source web scrapers, deduplication engine, and database loading.
    Owned by Member 5 (Data Engineer: Scraping & Ingestion).
    """

    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.connectors = [
            UnstopConnector(delay_seconds=0.5),
            InternshalaConnector(delay_seconds=0.5),
            AicteConnector(delay_seconds=0.5)
        ]

    def ingest_opportunities(self, opportunities_data: List[Dict[str, Any]], session: Session) -> Dict[str, int]:
        """Deduplicate and upsert opportunities into the database."""
        stats = {"received": len(opportunities_data), "inserted": 0, "updated": 0, "tags_created": 0}

        # Deduplicate incoming batch by fingerprint first
        deduped_items = {}
        for item in opportunities_data:
            fp = generate_fingerprint(
                source=item.get("source", "UNKNOWN"),
                external_id=item.get("external_id"),
                title=item.get("title"),
                organization=item.get("organization"),
                deadline=item.get("deadline")
            )
            item["_fingerprint"] = fp
            deduped_items[fp] = item

        for fingerprint, item in deduped_items.items():
            deadline_val = parse_date(item.get("deadline"))
            existing = session.query(Opportunity).filter(Opportunity.fingerprint == fingerprint).first()

            stipend_raw = item.get("stipend")
            if isinstance(stipend_raw, (list, dict)):
                stipend_val = str(stipend_raw)
            else:
                stipend_val = str(stipend_raw) if stipend_raw is not None else None

            if existing:
                existing.title = item.get("title", existing.title)
                existing.organization = item.get("organization", existing.organization)
                existing.type = item.get("type", existing.type)
                existing.mode = item.get("mode", existing.mode)
                existing.location = item.get("location", existing.location)
                existing.deadline = deadline_val
                existing.stipend = stipend_val
                existing.description_raw = item.get("description_raw", existing.description_raw)
                existing.is_active = True
                existing.extracted_at = datetime.utcnow()
                target_opp = existing
                stats["updated"] += 1
            else:
                new_opp = Opportunity(
                    external_id=item.get("external_id"),
                    source=item.get("source", "UNKNOWN"),
                    original_url=item.get("original_url", ""),
                    title=item.get("title", ""),
                    organization=item.get("organization", ""),
                    type=item.get("type", "INTERNSHIP"),
                    mode=item.get("mode", "REMOTE"),
                    location=item.get("location"),
                    deadline=deadline_val,
                    stipend=stipend_val,
                    description_raw=item.get("description_raw", ""),
                    fingerprint=fingerprint,
                    is_active=True,
                    extracted_at=datetime.utcnow()
                )
                session.add(new_opp)
                session.flush()
                target_opp = new_opp
                stats["inserted"] += 1

            # Sync skill tags cleanly
            session.query(OpportunitySkillTag).filter(
                OpportunitySkillTag.opportunity_id == target_opp.id
            ).delete()

            seen_skills = set()
            for s in item.get("required_skills", []):
                skill_id = s.get("skill_id")
                if not skill_id or skill_id in seen_skills:
                    continue
                seen_skills.add(skill_id)
                tag = OpportunitySkillTag(
                    opportunity_id=target_opp.id,
                    skill_id=skill_id,
                    raw_mention=s.get("raw_mention", skill_id),
                    min_proficiency=s.get("min_proficiency", "BEGINNER")
                )
                session.add(tag)
                stats["tags_created"] += 1

        session.commit()
        return stats

    def run_all(self, keywords: Optional[List[str]] = None) -> Dict[str, Any]:
        """Execute all connectors across keywords and ingest into DB."""
        if not keywords:
            keywords = ["backend", "machine-learning"]

        ensure_tables_exist()
        session_created = False
        session = self.db
        if session is None:
            session = SessionLocal()
            session_created = True

        all_scraped = []
        try:
            for connector in self.connectors:
                for kw in keywords:
                    try:
                        batch = connector.run(keyword=kw, limit=5)
                        all_scraped.extend(batch)
                    except Exception as err:
                        continue

            summary = self.ingest_opportunities(all_scraped, session)
            return summary
        finally:
            if session_created:
                session.close()


if __name__ == "__main__":
    print("Executing Vidyut Web Scraping Pipeline Orchestrator...")
    orchestrator = PipelineOrchestrator()
    results = orchestrator.run_all(keywords=["backend", "machine learning"])
    print(f"Pipeline Completed Successfully: {results}")
