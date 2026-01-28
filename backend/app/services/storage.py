import hashlib
from datetime import datetime
from typing import Literal
from app.models.schemas import ResumeSummary


class ResumeStorage:
    """In-memory storage for resume data with MD5 caching"""

    def __init__(self):
        self._storage: dict[str, dict] = {}
        self._hash_cache: dict[str, str] = {}  # MD5 hash -> resume_id mapping

    def compute_hash(self, text_content: str) -> str:
        """Compute MD5 hash of normalized text content"""
        # Normalize text: strip whitespace, convert to lowercase for consistent hashing
        normalized = text_content.strip().lower()
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()

    def get_resume_by_hash(self, text_hash: str) -> dict | None:
        """Get resume by MD5 hash if cached"""
        resume_id = self._hash_cache.get(text_hash)
        if resume_id:
            return self.get_resume(resume_id)
        return None

    def store_resume(
        self,
        resume_id: str,
        file_name: str,
        file_content: str,
        status: Literal["processing", "completed", "error"] = "processing"
    ) -> dict:
        """Store a new resume"""
        self._storage[resume_id] = {
            "id": resume_id,
            "fileName": file_name,
            "file_content": file_content,
            "uploadDate": datetime.utcnow(),
            "status": status,
            "summary": None
        }
        return self._storage[resume_id]

    def cache_resume_hash(self, text_hash: str, resume_id: str) -> None:
        """Cache the MD5 hash to resume_id mapping"""
        self._hash_cache[text_hash] = resume_id

    def get_resume(self, resume_id: str) -> dict | None:
        """Get resume by ID"""
        return self._storage.get(resume_id)

    def update_summary(
        self,
        resume_id: str,
        summary: ResumeSummary,
        status: Literal["processing", "completed", "error"] = "completed"
    ) -> dict | None:
        """Update resume with parsed summary"""
        if resume_id not in self._storage:
            return None

        self._storage[resume_id]["summary"] = summary
        self._storage[resume_id]["status"] = status
        return self._storage[resume_id]

    def update_status(
        self,
        resume_id: str,
        status: Literal["processing", "completed", "error"]
    ) -> dict | None:
        """Update resume status"""
        if resume_id not in self._storage:
            return None

        self._storage[resume_id]["status"] = status
        return self._storage[resume_id]


# Singleton instance
storage = ResumeStorage()
