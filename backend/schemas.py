import os
from pydantic import BaseModel, Field
from typing import List

class Evidence(BaseModel):
    item: str
    description: str

class Cause(BaseModel):
    cause: str
    likelihood: str = Field(description="HIGH, MEDIUM, or LOW")

class Action(BaseModel):
    title: str
    description: str
    expected_result: str

class DiagnosisResponse(BaseModel):
    problem: str
    category: str
    severity: str = Field(description="CRITICAL, HIGH, MEDIUM, LOW")
    confidence: int = Field(description="Confidence percentage 0-100")
    evidence: List[str]
    possible_causes: List[Cause]
    diagnosis: str
    recommended_actions: List[Action]
    warnings: List[str]
    simple_explanation: str
    technical_explanation: str
    ide_agent_instructions: str
    escalation_conditions: List[str]
