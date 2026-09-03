from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class SkillRequirement(BaseModel):
    """Skill tag requirement attached to an opportunity."""
    skill_id: str = Field(..., description="Canonical skill identifier e.g. skill-python")
    min_proficiency: Optional[str] = Field("BEGINNER", description="BEGINNER, INTERMEDIATE, PROFICIENT, EXPERT")
    raw_mention: Optional[str] = Field(None, description="Original raw text mention")


class OpportunitySkillTagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: str
    raw_mention: Optional[str] = None
    min_proficiency: str = "BEGINNER"


class OpportunityBase(BaseModel):
    title: str = Field(..., description="Opportunity title")
    organization: str = Field(..., description="Company or host institution")
    type: str = Field(..., description="INTERNSHIP, HACKATHON, PROJECT")
    mode: str = Field(..., description="REMOTE, ON_SITE, HYBRID")
    location: Optional[str] = Field(None, description="Location details")
    deadline: Optional[date] = None
    stipend: Optional[str] = Field(None, description="Stipend or prize details")


class OpportunityDirectCreate(OpportunityBase):
    """Schema for recruiter/company direct postings from Industry Portal."""
    description: str = Field(..., description="Job/opportunity description")
    original_url: Optional[str] = None
    required_skills: List[SkillRequirement] = []


class OpportunityCreate(OpportunityBase):
    """Full schema for pipeline ingestions."""
    external_id: Optional[str] = None
    source: str = "DIRECT"  # UNSTOP, INTERNSHALA, AICTE, DIRECT
    original_url: str
    description_raw: str
    fingerprint: Optional[str] = None
    required_skills: List[SkillRequirement] = []


class OpportunitySummary(BaseModel):
    """Clean summary item for list browse endpoints matching Frontend 2's contract."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    organization: str
    type: str
    mode: str
    stipend: Optional[str] = None
    deadline: Optional[date] = None
    source: str
    original_url: str
    location: Optional[str] = None
    skill_tags: List[OpportunitySkillTagResponse] = []
    is_active: Optional[bool] = True


class OpportunityDetail(OpportunitySummary):
    """Full detail view for single opportunity endpoint."""
    description_raw: str
    fingerprint: str
    extracted_at: Optional[datetime] = None


class PaginatedData(BaseModel):
    items: List[OpportunitySummary]
    total: int
    page: int = 1
    limit: int = 10
    pages: int = 1


class OpportunityListResponse(BaseModel):
    success: bool = True
    data: PaginatedData


class OpportunityDetailResponse(BaseModel):
    success: bool = True
    data: OpportunityDetail


class DirectOpportunityResponse(BaseModel):
    success: bool = True
    data: OpportunityDetail
    message: str = "Opportunity posted successfully"
