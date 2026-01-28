import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.schemas import ResumeUploadResponse, ResumeSummary, ErrorResponse
from app.services.storage import storage
from app.services.parser import extract_text, parse_resume


router = APIRouter(prefix="/api/resumes", tags=["resumes"])


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided")

    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume file (PDF, TXT, or DOCX) for parsing.
    Maximum file size: 10MB
    """
    validate_file(file)

    # Read file content
    file_content = await file.read()

    # Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    if len(file_content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    # Generate unique ID
    resume_id = str(uuid.uuid4())

    try:
        # Extract text from file
        try:
            text_content = extract_text(file_content, file.filename)
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Could not extract text from file: {str(e)}. Please ensure the file is a valid PDF, DOCX, or TXT format."
            )

        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file. The file may be corrupted or empty.")
        
        # Check if extracted text is too short (likely not a resume)
        if len(text_content.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="The extracted text is too short to be a valid resume. Please upload a complete resume document."
            )

        # Check cache using MD5 hash of extracted text
        text_hash = storage.compute_hash(text_content)
        cached_resume = storage.get_resume_by_hash(text_hash)
        
        if cached_resume and cached_resume.get("summary") and cached_resume.get("status") == "completed":
            # Return cached result - use existing resume_id
            cached_id = cached_resume["id"]
            return ResumeUploadResponse(
                id=cached_id,
                fileName=file.filename,
                uploadDate=cached_resume.get("uploadDate", datetime.utcnow()),
                status="completed"
            )

        # Store resume
        storage.store_resume(
            resume_id=resume_id,
            file_name=file.filename,
            file_content=text_content,
            status="processing"
        )

        # Parse resume using LangChain
        summary = await parse_resume(text_content, resume_id)

        # Update storage with summary and cache the hash
        storage.update_summary(resume_id, summary, status="completed")
        storage.cache_resume_hash(text_hash, resume_id)

        return ResumeUploadResponse(
            id=resume_id,
            fileName=file.filename,
            uploadDate=datetime.utcnow(),
            status="completed"
        )

    except HTTPException:
        raise
    except ValueError as e:
        # Handle validation errors (e.g., non-resume files, partial data issues)
        if storage.get_resume(resume_id):
            storage.update_status(resume_id, "error")
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError as e:
        # Handle missing required fields in parsed data
        if storage.get_resume(resume_id):
            storage.update_status(resume_id, "error")
        raise HTTPException(
            status_code=400,
            detail="The resume appears to be incomplete or missing required information. "
                   "Please ensure the file contains a person's name and professional details."
        )
    except Exception as e:
        # Update status to error if stored
        if storage.get_resume(resume_id):
            storage.update_status(resume_id, "error")
        # Check if it's a parsing error
        error_str = str(e).lower()
        if any(keyword in error_str for keyword in [
            "parsedresumedata", "output parsing", "validation error", 
            "pydantic", "validation", "parse", "schema"
        ]):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file does not appear to be a resume or CV, or the format is not recognized. "
                       "Please upload a document containing a person's professional background, work experience, skills, and education."
            )
        # For other errors, provide a generic but helpful message
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred while processing the resume. Please try again or contact support if the issue persists."
        )


@router.get(
    "/{resume_id}/summary",
    response_model=ResumeSummary,
    responses={404: {"model": ErrorResponse}}
)
async def get_resume_summary(resume_id: str):
    """
    Get the parsed summary for a resume by ID.
    """
    resume_data = storage.get_resume(resume_id)

    if not resume_data:
        raise HTTPException(status_code=404, detail="Resume not found")

    if resume_data["status"] == "processing":
        raise HTTPException(status_code=202, detail="Resume is still being processed")

    if resume_data["status"] == "error":
        raise HTTPException(status_code=500, detail="Resume processing failed")

    if not resume_data["summary"]:
        raise HTTPException(status_code=500, detail="Resume summary not available")

    # Include raw text in the summary response
    summary = resume_data["summary"]
    # Create a new dict with rawText included
    summary_dict = summary.model_dump()
    summary_dict["rawText"] = resume_data.get("file_content")
    
    return ResumeSummary(**summary_dict)
