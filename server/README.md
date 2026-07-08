# AI Resume Screener — Backend (Node + Express + MongoDB)

REST API that powers the resume-vs-job-description analysis.
No login/signup — every endpoint is open. Uses **Groq** (free tier) for
the AI analysis and **MongoDB** to store results.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- `GROQ_API_KEY` — get a free key at https://console.groq.com/keys
- `MONGODB_URI` — either run MongoDB locally (`mongod`) or use a free
  MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas/register

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start
```

API runs at `http://localhost:8000/`.

## Endpoints

| Method | URL                     | Description                                   |
|--------|-------------------------|------------------------------------------------|
| POST   | `/api/analyze`          | Upload resume (PDF/DOCX) + job description → analysis |
| GET    | `/api/analyses`         | List the 50 most recent analyses                |
| GET    | `/api/analyses/:id`     | Get one analysis by id                          |

### POST /api/analyze

`multipart/form-data`:
- `resume`: file (`.pdf` or `.docx`, max 10 MB)
- `job_description`: text (30–8000 characters)

Response `201`:
```json
{
  "_id": "665f1c...",
  "resumeFilename": "john_doe.pdf",
  "matchScore": 78,
  "atsScore": 85,
  "matchingSkills": ["Python", "Django", "REST APIs"],
  "missingSkills": ["PostgreSQL", "Docker"],
  "strengths": ["Strong backend framework experience", "..."],
  "weaknesses": ["No mention of database experience", "..."],
  "suggestions": ["Add PostgreSQL projects", "..."],
  "summary": "Good overall fit with a few skill gaps to address.",
  "createdAt": "2026-07-01T10:00:00.000Z"
}
```

Error responses:
- `400` — missing/bad file, or job_description too short/long
- `422` — file uploaded but no text could be extracted (e.g. scanned image)
- `502` — the Groq API call failed (bad/missing key, rate limit, etc.)

## Connecting the React frontend

In `UploadResume.jsx`, replace the `onAnalyze` placeholder with a real
`fetch`/`FormData` POST to `http://localhost:8000/api/analyze`, then
render the returned fields (`matchScore`, `missingSkills`, etc.).

## Project structure

```
resume-backend-node/
├── package.json
├── .env.example
└── src/
    ├── server.js          # app entrypoint, CORS, error handling
    ├── config/
    │   └── db.js          # MongoDB connection
    ├── models/
    │   └── Analysis.js    # Mongoose schema
    ├── routes/
    │   └── analysis.js    # /api/analyze, /api/analyses
    └── utils/
        ├── extractText.js # PDF/DOCX → plain text
        ├── aiAnalysis.js  # Groq prompt + call
        └── upload.js      # multer config
```
