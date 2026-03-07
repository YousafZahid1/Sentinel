from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class RiskFactor(BaseModel):
    label: str = Field(..., description="Short descriptor of the detected risk signal")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0–1")
    interpretation: str = Field(..., description="NLP-based explanation of this risk signal")


class Prediction(BaseModel):
    likely_outcome: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class AnalysisMetadata(BaseModel):
    people_detected: int
    overall_risk_score: float = Field(..., ge=0.0, le=1.0)
    prediction: Prediction


class AnalysisResponse(BaseModel):
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    risk_factors: List[RiskFactor]
    conclusion: str = Field(..., description="Summarized situational assessment")
    recommended_actions: List[str] = Field(..., description="Ordered list of actionable steps")
    metadata: AnalysisMetadata


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
