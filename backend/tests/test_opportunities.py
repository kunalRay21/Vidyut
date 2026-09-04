import os
import sys
import pytest
from datetime import date
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

# Setup path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.modules.opportunities.models import Base, Opportunity, OpportunitySkillTag
from src.modules.opportunities.router import router as opp_router, get_db
from src.pipeline.deduplication import generate_fingerprint
from src.pipeline.connectors.unstop_connector import UnstopConnector
from src.pipeline.connectors.internshala_connector import InternshalaConnector
from src.pipeline.connectors.aicte_connector import AicteConnector
from src.pipeline.manual_seed_loader import load_seed_opportunities


# Setup shared in-memory test database using StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Provides a fresh database session for each test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden database session."""
    app = FastAPI(title="Vidyut Test API")
    app.include_router(opp_router, prefix="/api/v1/opportunities")

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ==========================================
# 1. Tests for Fingerprinting & Deduplication
# ==========================================

def test_fingerprint_deterministic():
    """Verify that identical inputs produce the identical SHA-256 fingerprint."""
    fp1 = generate_fingerprint(source="UNSTOP", external_id="12345")
    fp2 = generate_fingerprint(source="UNSTOP", external_id="12345")
    assert fp1 == fp2
    assert len(fp1) == 64  # SHA-256 hex string length


def test_fingerprint_fallback_formula():
    """Verify secondary fingerprint formula when external_id is absent."""
    fp1 = generate_fingerprint(
        source="DIRECT",
        title="ML Engineer",
        organization="Google",
        deadline="2026-10-15"
    )
    fp2 = generate_fingerprint(
        source="direct",
        title="  ml engineer  ",
        organization="google ",
        deadline="2026-10-15"
    )
    assert fp1 == fp2


def test_fingerprint_distinctness():
    """Different inputs must produce completely distinct fingerprints."""
    fp1 = generate_fingerprint(source="UNSTOP", external_id="101")
    fp2 = generate_fingerprint(source="UNSTOP", external_id="102")
    assert fp1 != fp2


# ==========================================
# 2. Tests for Opportunity Models & Tags
# ==========================================

def test_opportunity_model_creation(db_session):
    """Verify Opportunity and OpportunitySkillTag creation, constraints, and relationships."""
    opp = Opportunity(
        source="INTERNSHALA",
        original_url="https://internshala.com/internship/detail/test",
        title="Backend Engineering Intern",
        organization="Razorpay",
        type="INTERNSHIP",
        mode="REMOTE",
        description_raw="Develop FastAPI microservices.",
        fingerprint="test_fp_001"
    )
    db_session.add(opp)
    db_session.flush()

    tag1 = OpportunitySkillTag(
        opportunity_id=opp.id,
        skill_id="skill-python",
        raw_mention="Python",
        min_proficiency="INTERMEDIATE"
    )
    tag2 = OpportunitySkillTag(
        opportunity_id=opp.id,
        skill_id="skill-fastapi",
        raw_mention="FastAPI",
        min_proficiency="BEGINNER"
    )
    db_session.add_all([tag1, tag2])
    db_session.commit()

    saved = db_session.query(Opportunity).filter(Opportunity.id == opp.id).first()
    assert saved is not None
    assert saved.title == "Backend Engineering Intern"
    assert len(saved.skill_tags) == 2
    tag_ids = [t.skill_id for t in saved.skill_tags]
    assert "skill-python" in tag_ids
    assert "skill-fastapi" in tag_ids


# ==========================================
# 3. Tests for Seed Loader Idempotency
# ==========================================

def test_seed_loader_idempotency(db_session):
    """Ensure that loading seed opportunities twice results in 0 duplicate records."""
    # First seed run
    stats1 = load_seed_opportunities(db=db_session)
    assert stats1["total_in_file"] == 60
    assert stats1["inserted"] == 60
    assert stats1["updated"] == 0
    assert db_session.query(Opportunity).count() == 60

    # Second seed run (must deduplicate all items)
    stats2 = load_seed_opportunities(db=db_session)
    assert stats2["total_in_file"] == 60
    assert stats2["inserted"] == 0
    assert stats2["updated"] == 60
    assert db_session.query(Opportunity).count() == 60  # Total remains exactly 60


# ==========================================
# 4. Tests for Connector Normalization
# ==========================================

def test_unstop_connector_normalization():
    """Verify UnstopConnector converts raw data into canonical schema."""
    conn = UnstopConnector(delay_seconds=0.0)
    raw = {
        "id": "unstop-test-1",
        "title": "Hackathon 2026",
        "organisation": {"name": "Tech Org"},
        "seo_url": "https://unstop.com/hackathons/test",
        "mode": "ONLINE",
        "prizes": "₹1,00,000 Cash",
        "details": "Solve challenges",
        "tags": ["Python", "FastAPI"]
    }
    norm = conn.normalize(raw)
    assert norm["source"] == "UNSTOP"
    assert norm["type"] == "HACKATHON"
    assert norm["mode"] == "REMOTE"
    assert norm["organization"] == "Tech Org"
    assert len(norm["required_skills"]) == 2


def test_internshala_connector_normalization():
    """Verify InternshalaConnector converts raw data into canonical schema."""
    conn = InternshalaConnector(delay_seconds=0.0)
    raw = {
        "id": "ish-test-1",
        "title": "Python Intern",
        "company": "Acme Corp",
        "url": "https://internshala.com/test",
        "stipend": "₹25,000 / month",
        "location": "Work From Home",
        "skills": ["Python", "Django"]
    }
    norm = conn.normalize(raw)
    assert norm["source"] == "INTERNSHALA"
    assert norm["type"] == "INTERNSHIP"
    assert norm["mode"] == "REMOTE"
    assert norm["organization"] == "Acme Corp"


def test_aicte_connector_normalization():
    """Verify AicteConnector converts raw data into canonical schema."""
    conn = AicteConnector(delay_seconds=0.0)
    raw = {
        "id": "aicte-test-1",
        "title": "Digital Apprenticeship",
        "ministry_or_org": "MeitY",
        "mode": "HYBRID",
        "location": "New Delhi",
        "stipend": "₹15,000 / month",
        "description": "Apprentice program",
        "skills": ["Python", "Cloud"]
    }
    norm = conn.normalize(raw)
    assert norm["source"] == "AICTE"
    assert norm["type"] == "INTERNSHIP"
    assert norm["mode"] == "HYBRID"
    assert norm["organization"] == "MeitY"


# ==========================================
# 5. Tests for Serving API Endpoints
# ==========================================

def test_get_opportunities_endpoint(client, db_session):
    """Verify GET /api/v1/opportunities returns paginated contract envelope."""
    # Seed 5 opportunities
    for i in range(5):
        opp = Opportunity(
            source="INTERNSHALA",
            original_url=f"https://test.com/{i}",
            title=f"Engineer {i}",
            organization="Acme",
            type="INTERNSHIP",
            mode="REMOTE" if i % 2 == 0 else "ON_SITE",
            description_raw=f"Job description {i}",
            fingerprint=f"fp_{i}"
        )
        db_session.add(opp)
    db_session.commit()

    # Test all
    res = client.get("/api/v1/opportunities?page=1&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["total"] == 5
    assert len(data["data"]["items"]) == 5

    # Test filter by mode=REMOTE
    res_remote = client.get("/api/v1/opportunities?mode=REMOTE")
    assert res_remote.status_code == 200
    data_remote = res_remote.json()
    assert data_remote["data"]["total"] == 3


def test_get_opportunity_by_id(client, db_session):
    """Verify GET /api/v1/opportunities/{id} returns opportunity detail."""
    opp = Opportunity(
        source="DIRECT",
        original_url="https://test.com/detail",
        title="Senior Python Engineer",
        organization="ISRO",
        type="PROJECT",
        mode="HYBRID",
        description_raw="Satellite telemetry analysis.",
        fingerprint="fp_detail_test"
    )
    db_session.add(opp)
    db_session.commit()

    res = client.get(f"/api/v1/opportunities/{opp.id}")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["id"] == opp.id
    assert data["data"]["organization"] == "ISRO"

    # Test 404 Not Found
    res_404 = client.get("/api/v1/opportunities/non-existent-id")
    assert res_404.status_code == 404


def test_post_direct_opportunity(client, db_session):
    """Verify POST /api/v1/opportunities/direct creates opportunity with skill tags."""
    payload = {
        "title": "Junior ML Engineer Intern",
        "organization": "OpenAI India",
        "type": "INTERNSHIP",
        "mode": "HYBRID",
        "location": "Bengaluru, Karnataka",
        "deadline": "2026-10-31",
        "stipend": "₹45,000 / month",
        "description": "Develop and fine-tune multimodal language models.",
        "required_skills": [
            {"skill_id": "skill-python", "min_proficiency": "PROFICIENT", "raw_mention": "Python"},
            {"skill_id": "skill-pytorch", "min_proficiency": "INTERMEDIATE", "raw_mention": "PyTorch"}
        ]
    }

    res = client.post("/api/v1/opportunities/direct", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Junior ML Engineer Intern"
    assert len(data["data"]["skill_tags"]) == 2

    # Verify duplicate submission is rejected with 409 Conflict
    res_duplicate = client.post("/api/v1/opportunities/direct", json=payload)
    assert res_duplicate.status_code == 409


def test_post_sync_endpoint(client, db_session):
    """Verify POST /api/v1/opportunities/sync executes on-demand scrape and returns ingestion counts."""
    res = client.post("/api/v1/opportunities/sync?keywords=backend")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "received" in data["data"]
    assert "inserted" in data["data"]


def test_get_sync_status_endpoint(client):
    """Verify GET /api/v1/opportunities/sync/status returns 24-hour scheduler status."""
    res = client.get("/api/v1/opportunities/sync/status")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "interval_hours" in data["data"]
    assert data["data"]["interval_hours"] == 24.0


def test_scheduler_lifecycle():
    """Verify OpportunityPipelineScheduler starts, reports running, and stops cleanly."""
    from src.pipeline.scheduler import OpportunityPipelineScheduler

    test_sched = OpportunityPipelineScheduler(interval_hours=0.01)
    assert test_sched.is_running is False
    test_sched.start(run_immediately=False)
    assert test_sched.is_running is True
    test_sched.stop()
    assert test_sched.is_running is False
