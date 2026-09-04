import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

try:
    from src.database.session import Base
except ImportError:
    from sqlalchemy.orm import declarative_base
    Base = declarative_base()


class Opportunity(Base):
    """
    Opportunity model representing internships, hackathons, and challenges
    stored in the Vidyut Opportunity Index (Owned by Member 5 - Data Engineer).
    Schema specification: Section 6 of MASTER_DATABASE_SCHEMA.md.
    """
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String(512), nullable=True)
    source = Column(String(50), nullable=False)  # UNSTOP, INTERNSHALA, AICTE, DIRECT
    original_url = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    organization = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # INTERNSHIP, HACKATHON, PROJECT
    mode = Column(String(50), nullable=False)  # REMOTE, ON_SITE, HYBRID
    location = Column(Text, nullable=True)
    deadline = Column(Date, nullable=True)
    stipend = Column(Text, nullable=True)
    description_raw = Column(Text, nullable=False)
    fingerprint = Column(String(512), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    extracted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    skill_tags = relationship(
        "OpportunitySkillTag",
        back_populates="opportunity",
        cascade="all, delete-orphan",
        lazy="joined"
    )

    def __init__(self, **kwargs):
        if "id" not in kwargs:
            kwargs["id"] = str(uuid.uuid4())
        if "is_active" not in kwargs:
            kwargs["is_active"] = True
        if "extracted_at" not in kwargs:
            kwargs["extracted_at"] = datetime.utcnow()
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "source": self.source,
            "original_url": self.original_url,
            "title": self.title,
            "organization": self.organization,
            "type": self.type,
            "mode": self.mode,
            "location": self.location,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "stipend": self.stipend,
            "description_raw": self.description_raw,
            "fingerprint": self.fingerprint,
            "is_active": self.is_active if self.is_active is not None else True,
            "extracted_at": self.extracted_at.isoformat() if self.extracted_at else None,
            "skill_tags": [tag.to_dict() for tag in (self.skill_tags or [])]
        }


class OpportunitySkillTag(Base):
    """
    Tags linking an opportunity to canonical skill IDs and required minimum proficiency.
    Schema specification: Section 6 of MASTER_DATABASE_SCHEMA.md.
    """
    __tablename__ = "opportunity_skill_tags"

    opportunity_id = Column(
        String(36),
        ForeignKey("opportunities.id", ondelete="CASCADE"),
        primary_key=True
    )
    skill_id = Column(String(255), primary_key=True)
    raw_mention = Column(Text, nullable=True)
    min_proficiency = Column(String(50), default="BEGINNER", nullable=False)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="skill_tags")

    def __init__(self, **kwargs):
        if "min_proficiency" not in kwargs:
            kwargs["min_proficiency"] = "BEGINNER"
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "opportunity_id": self.opportunity_id,
            "skill_id": self.skill_id,
            "raw_mention": self.raw_mention,
            "min_proficiency": self.min_proficiency
        }
