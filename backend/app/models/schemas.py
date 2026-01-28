from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class Education(BaseModel):
    degree: str = Field(description="The degree obtained")
    institution: str = Field(description="Name of the educational institution")
    graduationYear: int | None = Field(default=None, description="Year of graduation")


class ResumeSummary(BaseModel):
    id: str = Field(description="Unique identifier for the resume")
    name: str = Field(description="Full name of the candidate")
    currentRole: str = Field(description="Current or most recent job title")
    experienceYears: int = Field(description="Total years of professional experience")
    skills: list[str] = Field(description="List of technical and professional skills")
    education: list[Education] = Field(description="List of educational qualifications")
    summary: str = Field(description="Brief professional summary")
    email: str | None = Field(default=None, description="Email address")
    phone: str | None = Field(default=None, description="Phone number")
    location: str | None = Field(default=None, description="Location")
    socialHandles: SocialHandles | None = Field(default=None, description="Social media handles")
    rawText: str | None = Field(default=None, description="Raw extracted text from the resume")


class ResumeUploadResponse(BaseModel):
    id: str
    fileName: str
    uploadDate: datetime
    status: Literal["processing", "completed", "error"]


class SocialHandles(BaseModel):
    """Social media and professional profile handles"""
    linkedin: str | None = Field(default=None, description="LinkedIn profile URL or username")
    github: str | None = Field(default=None, description="GitHub profile URL or username")
    twitter: str | None = Field(default=None, description="Twitter/X profile URL or username")
    portfolio: str | None = Field(default=None, description="Personal website or portfolio URL")
    other: list[str] = Field(default_factory=list, description="Other social media profiles or handles")


class ParsedResumeData(BaseModel):
    """Schema for LLM output parsing - handles partial resume data gracefully"""
    name: str | None = Field(default=None, description="Full name of the candidate. Set to null if not a resume.")
    currentRole: str | None = Field(default=None, description="Current or most recent job title. Use 'Not specified' if unavailable.")
    experienceYears: int | None = Field(default=None, description="Total years of professional experience, estimated from work history. Use 0 if cannot be determined.")
    skills: list[str] = Field(default_factory=list, description="List of technical and professional skills mentioned. Empty list if none found.")
    education: list[Education] = Field(default_factory=list, description="List of educational qualifications. Empty list if none found.")
    summary: str | None = Field(default=None, description="A brief 2-3 sentence professional summary of the candidate. Use 'No summary available' if cannot be generated.")
    email: str | None = Field(default=None, description="Email address if found in the resume")
    phone: str | None = Field(default=None, description="Phone number if found in the resume")
    location: str | None = Field(default=None, description="Location (city, state, country) if found in the resume")
    socialHandles: SocialHandles | None = Field(default=None, description="Social media and professional profile handles")


class ErrorResponse(BaseModel):
    detail: str
