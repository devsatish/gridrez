# GridRez - AI-Powered Resume Parser

A web application that parses resumes using AI to extract structured information like name, skills, education, and work experience.

## Tech Stack

- **Frontend**: Angular 17, TypeScript, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, LangChain
- **AI**: OpenAI GPT-4

## Project Structure

```
gridrez/
├── frontend/          # Angular application
├── backend/           # Python FastAPI server
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

5. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

6. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

   The app will be available at `http://localhost:4200`

## API Endpoints

### POST /api/resumes/upload

Upload a resume file (PDF or TXT) for parsing.

**Request**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "id": "uuid-string",
  "fileName": "resume.pdf",
  "uploadDate": "2024-01-15T10:30:00Z",
  "status": "completed"
}
```

### GET /api/resumes/{id}/summary

Get the parsed summary for a resume.

**Response**:
```json
{
  "id": "uuid-string",
  "name": "John Doe",
  "currentRole": "Senior Software Engineer",
  "experienceYears": 7,
  "skills": ["JavaScript", "React", "Node.js"],
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "XYZ University",
      "graduationYear": 2016
    }
  ],
  "summary": "Experienced full-stack developer..."
}
```

## Usage

1. Start both the backend and frontend servers
2. Open `http://localhost:4200` in your browser
3. Drag and drop a resume file (PDF or TXT, max 5MB) or click to browse
4. Wait for the AI to analyze the resume
5. View the extracted information in a structured format

## Supported File Types

- PDF (.pdf)
- Doc (.docx)
- Plain text (.txt)


# gridrez
