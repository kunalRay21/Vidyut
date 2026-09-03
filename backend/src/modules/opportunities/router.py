import math
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from src.modules.opportunities.models import Opportunity, OpportunitySkillTag
from src.modules.opportunities.schemas import (
    OpportunitySummary,
    OpportunityDetail,
    OpportunityListResponse,
    OpportunityDetailResponse,
    OpportunityDirectCreate,
    DirectOpportunityResponse,
    PaginatedData
)
from src.pipeline.deduplication import generate_fingerprint

# Inter-team DB dependency from Team Leader with graceful fallback
try:
    from src.database.session import get_db
except ImportError:
    from src.pipeline.manual_seed_loader import SessionLocal

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

router = APIRouter()


@router.get("", response_model=OpportunityListResponse)
@router.get("/", response_model=OpportunityListResponse)
def list_opportunities(
    type: Optional[str] = Query(None, description="Filter by type: INTERNSHIP, HACKATHON, PROJECT"),
    mode: Optional[str] = Query(None, description="Filter by mode: REMOTE, ON_SITE, HYBRID"),
    source: Optional[str] = Query(None, description="Filter by source: UNSTOP, INTERNSHALA, AICTE, DIRECT"),
    search: Optional[str] = Query(None, description="Search keyword across title, company, description"),
    skill_id: Optional[str] = Query(None, description="Filter by canonical skill ID e.g. skill-python"),
    page: int = Query(1, ge=1, description="Page number starting from 1"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Public Opportunity Index browse endpoint for Frontend Developer 2.
    Supports filtering by type, mode, source, skill tag, and full-text keyword search with pagination.
    """
    query = db.query(Opportunity).filter(Opportunity.is_active.is_(True))

    if type:
        query = query.filter(Opportunity.type == type.strip().upper())
    if mode:
        query = query.filter(Opportunity.mode == mode.strip().upper())
    if source:
        query = query.filter(Opportunity.source == source.strip().upper())
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(search_pattern),
                Opportunity.organization.ilike(search_pattern),
                Opportunity.description_raw.ilike(search_pattern)
            )
        )
    if skill_id:
        query = query.join(Opportunity.skill_tags).filter(
            OpportunitySkillTag.skill_id == skill_id.strip().lower()
        )

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    items = query.order_by(Opportunity.extracted_at.desc()).offset(offset).limit(limit).all()

    summary_items = [OpportunitySummary.model_validate(item) for item in items]

    return OpportunityListResponse(
        success=True,
        data=PaginatedData(
            items=summary_items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
    )


@router.get("/{id}", response_model=OpportunityDetailResponse)
def get_opportunity(
    id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve single opportunity details including full description and skill tags.
    """
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opportunity with ID '{id}' not found"
        )

    return OpportunityDetailResponse(
        success=True,
        data=OpportunityDetail.model_validate(opp)
    )


@router.post("/direct", response_model=DirectOpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_direct_opportunity(
    payload: OpportunityDirectCreate,
    db: Session = Depends(get_db)
):
    """
    Direct Opportunity Posting endpoint for companies and recruiters via Industry Portal.
    Calculates cryptographic fingerprint and automatically registers required skill tags.
    """
    fingerprint = generate_fingerprint(
        source="DIRECT",
        title=payload.title,
        organization=payload.organization,
        deadline=str(payload.deadline) if payload.deadline else None
    )

    # Check for existing duplicate posting
    existing = db.query(Opportunity).filter(Opportunity.fingerprint == fingerprint).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An opportunity with this title, organization, and deadline has already been posted."
        )

    url = payload.original_url or f"https://vidyut.gov.in/opportunities/direct/{fingerprint[:12]}"

    new_opp = Opportunity(
        source="DIRECT",
        original_url=url,
        title=payload.title.strip(),
        organization=payload.organization.strip(),
        type=payload.type.strip().upper(),
        mode=payload.mode.strip().upper(),
        location=payload.location.strip() if payload.location else None,
        deadline=payload.deadline,
        stipend=payload.stipend.strip() if payload.stipend else None,
        description_raw=payload.description.strip(),
        fingerprint=fingerprint,
        is_active=True,
        extracted_at=datetime.utcnow()
    )

    db.add(new_opp)
    db.flush()

    # Link skill tags
    seen_skills = set()
    for s in payload.required_skills:
        skill_id = s.skill_id.strip().lower()
        if not skill_id or skill_id in seen_skills:
            continue
        seen_skills.add(skill_id)
        tag = OpportunitySkillTag(
            opportunity_id=new_opp.id,
            skill_id=skill_id,
            raw_mention=s.raw_mention or skill_id,
            min_proficiency=(s.min_proficiency or "BEGINNER").upper()
        )
        db.add(tag)

    db.commit()
    db.refresh(new_opp)

    return DirectOpportunityResponse(
        success=True,
        data=OpportunityDetail.model_validate(new_opp),
        message="Opportunity posted successfully"
    )
