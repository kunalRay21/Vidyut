import json
import os
import sys
from datetime import datetime, date
from typing import Dict, Any, List, Optional

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Try importing Team Leader's session; fallback gracefully if not yet created
try:
    from src.database.session import SessionLocal, engine, Base
except ImportError:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vidyut.db")
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    from src.modules.opportunities.models import Base

from src.modules.opportunities.models import Opportunity, OpportunitySkillTag
from src.pipeline.deduplication import generate_fingerprint


def parse_date(date_str: Optional[str]) -> Optional[date]:
    """Safely parse ISO date string (YYYY-MM-DD)."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def ensure_tables_exist(db_engine=None):
    """Ensure Opportunity and OpportunitySkillTag tables exist."""
    target_engine = db_engine or engine
    Opportunity.__table__.create(bind=target_engine, checkfirst=True)
    OpportunitySkillTag.__table__.create(bind=target_engine, checkfirst=True)


def load_seed_opportunities(
    json_path: Optional[str] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Idempotently load opportunities from JSON into the database.
    Deduplicates records based on cryptographic fingerprints.
    """
    if not json_path:
        json_path = os.path.join(backend_root, "data", "seed_opportunities.json")

    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Seed file not found at: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        items = json.load(f)

    session_created = False
    if db is None:
        ensure_tables_exist()
        db = SessionLocal()
        session_created = True

    stats = {
        "total_in_file": len(items),
        "inserted": 0,
        "updated": 0,
        "tags_created": 0,
        "errors": 0
    }

    try:
        for entry in items:
            fingerprint = generate_fingerprint(
                source=entry.get("source", "UNKNOWN"),
                external_id=entry.get("external_id"),
                title=entry.get("title"),
                organization=entry.get("organization"),
                deadline=entry.get("deadline")
            )

            deadline_val = parse_date(entry.get("deadline"))

            # Check if record already exists via fingerprint
            existing = db.query(Opportunity).filter(Opportunity.fingerprint == fingerprint).first()

            if existing:
                # Update existing opportunity fields
                existing.title = entry.get("title", existing.title)
                existing.organization = entry.get("organization", existing.organization)
                existing.type = entry.get("type", existing.type)
                existing.mode = entry.get("mode", existing.mode)
                existing.location = entry.get("location", existing.location)
                existing.deadline = deadline_val
                existing.stipend = entry.get("stipend", existing.stipend)
                existing.description_raw = entry.get("description_raw", existing.description_raw)
                existing.original_url = entry.get("original_url", existing.original_url)
                existing.is_active = True
                existing.extracted_at = datetime.utcnow()
                opp_target = existing
                stats["updated"] += 1
            else:
                # Insert new opportunity
                new_opp = Opportunity(
                    external_id=entry.get("external_id"),
                    source=entry.get("source", "DIRECT"),
                    original_url=entry.get("original_url", ""),
                    title=entry.get("title", ""),
                    organization=entry.get("organization", ""),
                    type=entry.get("type", "INTERNSHIP"),
                    mode=entry.get("mode", "REMOTE"),
                    location=entry.get("location"),
                    deadline=deadline_val,
                    stipend=entry.get("stipend"),
                    description_raw=entry.get("description_raw", ""),
                    fingerprint=fingerprint,
                    is_active=True,
                    extracted_at=datetime.utcnow()
                )
                db.add(new_opp)
                db.flush()  # Ensures new_opp.id is assigned
                opp_target = new_opp
                stats["inserted"] += 1

            # Sync required skill tags
            # Clear old tags for this opportunity to maintain clean sync
            db.query(OpportunitySkillTag).filter(
                OpportunitySkillTag.opportunity_id == opp_target.id
            ).delete()

            raw_skills = entry.get("required_skills", [])
            for s in raw_skills:
                skill_id = s.get("skill_id")
                if not skill_id:
                    continue
                tag = OpportunitySkillTag(
                    opportunity_id=opp_target.id,
                    skill_id=skill_id,
                    raw_mention=s.get("raw_mention", skill_id),
                    min_proficiency=s.get("min_proficiency", "BEGINNER")
                )
                db.add(tag)
                stats["tags_created"] += 1

        db.commit()
    except Exception as e:
        db.rollback()
        stats["errors"] += 1
        raise e
    finally:
        if session_created:
            db.close()

    return stats


if __name__ == "__main__":
    print("==================================================")
    print("  Vidyut Opportunity Index — Manual Seed Loader   ")
    print("==================================================")
    try:
        results = load_seed_opportunities()
        print(f"-> Total Items Processed : {results['total_in_file']}")
        print(f"-> Newly Inserted Rows   : {results['inserted']}")
        print(f"-> Updated / Deduplicated: {results['updated']}")
        print(f"-> Skill Tags Created    : {results['tags_created']}")
        print("-> Status                : SUCCESS - Database is seeded and demo-ready!")
        print("==================================================")
    except Exception as err:
        print(f"[ERROR] Failed to seed opportunities: {err}", file=sys.stderr)
        sys.exit(1)
