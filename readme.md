# LearnAI

**LearnAI** turns a PDF into a study workspace: an AI summary, concept explanations, flashcards,
quizzes and a chat that answers from the document. React + Vite on the front end, Express +
MongoDB + Google Gemini on the back end.

[![Powered by Google Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
![Runtime](https://img.shields.io/badge/Node.js-%E2%89%A520.19-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)

---

## Features

| Feature | Description |
|---|---|
| AI document chat | Answers questions about the PDF and keeps the conversation history |
| Concept explainer | Explains any term using the document as primary context |
| Flashcards | Generates a deck, saves it, and tracks favourites |
| Quizzes | Generates multiple-choice quizzes with explanations and stores the best score |
| Learning dashboard | Documents, flashcard count, quizzes taken and average score |
| Auth | JWT sessions, bcrypt password hashing, rate-limited login |

---

## Tech stack

### Frontend
React 19, Vite, Tailwind CSS v4, React Router, Axios, Lucide icons, canvas-confetti.

### Backend
Node.js 22 LTS, Express 5, MongoDB + Mongoose, Multer (memory storage), pdf-parse v2,
`@google/generative-ai`, JWT, Helmet, express-rate-limit.

---

## How a request flows

```
React -> Axios (Bearer token) -> Express app
                                   |-- helmet + cors + rate limit
                                   |-- auth middleware (JWT -> req.user)
                                   |-- controller (validation)
                                   |-- service (PDF text / Gemini / document access)
                                   `-- Mongoose -> MongoDB
```

Design rules used throughout the backend:

- Controllers validate input and throw `ApiError`; one error middleware owns status codes.
- Services never touch `req`/`res`, so they can be unit tested.
- Environment variables are read in `config/env.js` and validated once at startup.
- Uploaded PDFs are parsed in memory; only the extracted text is persisted, because a Render
  instance's disk is wiped on every deploy.

---

## Project structure

```
learnAI/
├── backend/
│   ├── app.js                 # Express app (middleware + routes), exported for tests
│   ├── server.js              # Process entry point: config, DB, listen, shutdown
│   ├── config/
│   │   ├── env.js             # Env parsing + startup validation
│   │   └── db.js              # Mongo connection with backoff and retries
│   ├── controllers/           # Request/response handling and input validation
│   ├── middleware/            # auth, error handling, rate limiting, upload
│   ├── models/                # Mongoose schemas and indexes
│   ├── routes/                # Express routers
│   ├── services/              # aiService, pdfService, documentService
│   ├── tests/                 # node:test unit tests
│   └── utils/                 # ApiError, logger
├── frontend/                  # React + Vite app
├── render.yaml                # Render blueprint (backend)
├── .env.example               # Documented environment variables
└── README.md
```

---

## Local setup

### Prerequisites

- Node.js **22.3 or newer** within the Node 22 LTS line (pinned via `engines`) and npm 10+
- MongoDB Atlas cluster or a local MongoDB instance
- A Google AI Studio API key

### 1. Clone and configure

```bash
git clone https://github.com/iftakharH/learnAI.git
cd learnAI
cp .env.example .env
```

Fill in `MONGODB_URI`, `JWT_SECRET` and `GEMINI_API_KEY`. The backend reads `.env` from the
repository root and `backend/.env`.

### 2. Backend

```bash
cd backend
npm install
npm run dev        # node --watch, restarts on change
```

The API listens on `http://localhost:5000`. Check it with `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. To point it at a remote API, set `VITE_API_URL` in
`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | yes | - | MongoDB connection string (`MONGO_URI` also accepted) |
| `JWT_SECRET` | yes | - | Token signing key, 16+ characters |
| `GEMINI_API_KEY` | yes | - | Google AI Studio key |
| `MONGODB_DB_NAME` | no | `learnai` | Database name |
| `GEMINI_MODEL` | no | `gemini-3.5-flash` | Gemini model ID |
| `CORS_ORIGINS` | no | localhost + Vercel URLs | Comma-separated allowlist, or `*` |
| `PORT` | no | `5000` | HTTP port (Render sets this) |
| `NODE_ENV` | no | `development` | `production` enables strict validation |
| `AI_TIMEOUT_MS` | no | `45000` | Gemini request timeout |
| `AI_MAX_TEXT_CHARS` | no | `400000` | Document text sent to the model |
| `AI_MAX_RETRIES` | no | `1` | Retries for 429/5xx provider errors |
| `JWT_EXPIRES_IN` | no | `30d` | Token lifetime |
| `UPLOAD_MAX_BYTES` | no | `15728640` | Max PDF size (15 MB) |
| `RATE_LIMIT_MAX` | no | `300` | Requests per window per IP |
| `AUTH_RATE_LIMIT_MAX` | no | `20` | Failed auth attempts per window |
| `RATE_LIMIT_WINDOW_MS` | no | `900000` | Rate-limit window (15 min) |

---

## Scripts

Run from `backend/`:

| Command | What it does |
|---|---|
| `npm start` | Start the API (`node server.js`) |
| `npm run dev` | Start with file watching |
| `npm test` | Run the unit tests with Node's built-in runner |
| `npm run test:coverage` | Tests with coverage report |

Run from `frontend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | oxlint |

---

## API reference

All routes are prefixed with `/api`. Routes marked **auth** need
`Authorization: Bearer <token>`.

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Liveness + database state (503 when Mongo is down) |
| GET | `/` | no | Service metadata |

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | no | Create an account, returns `{ _id, name, email, token }` |
| POST | `/auth/login` | no | Sign in, returns the same shape |
| GET | `/auth/profile` | yes | Current user |
| PUT | `/auth/update-password` | yes | Body: `{ currentPassword, password }` |

### Documents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/documents` | yes | List documents (text omitted) |
| POST | `/documents/upload` | yes | `multipart/form-data`, field `document`, PDF only |
| GET | `/documents/:id` | yes | Document including extracted text |
| DELETE | `/documents/:id` | yes | Deletes the document and everything generated from it |

### AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/:documentId/summary` | yes | Structured summary |
| POST | `/ai/:documentId/explain` | yes | Body: `{ concept }` |
| POST | `/ai/:documentId/flashcards` | yes | Body: `{ count }` (1-50) |
| POST | `/ai/:documentId/quiz` | yes | Body: `{ numQuestions }` (1-20) |
| POST | `/ai/:documentId/chat` | yes | Body: `{ query }`, returns `{ response, messages }` |

### Flashcards and quizzes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/flashcards?document=:id` | yes | List flashcards |
| POST | `/flashcards/bulk` | yes | Body: `{ documentId, flashcards: [{ front, back }] }` |
| PUT | `/flashcards/:id/favorite` | yes | Toggle favourite |
| DELETE | `/flashcards/:id` | yes | Delete one card |
| GET | `/quizzes?document=:id` | yes | List quizzes |
| POST | `/quizzes` | yes | Body: `{ documentId, title, questions }` |
| PUT | `/quizzes/:id/submit` | yes | Body: `{ score }` |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | yes | `{ totalDocuments, flashcardCount, quizzesTaken, averageScore }` |

Errors always return `{ "message": "..." }` with a matching HTTP status.

---

## Deployment

### Backend on Render

The repository contains a blueprint (`render.yaml`). Recommended path:

1. Push to GitHub.
2. In Render choose **New -> Blueprint** and select this repository.
3. Render creates `learnai-backend` with:
   - **Root Directory**: `backend`
   - **Build**: `npm ci --omit=dev --no-audit --no-fund`
   - **Start**: `npm start`
   - **Health check**: `/api/health`
4. Fill the secret environment variables when prompted: `MONGODB_URI`, `JWT_SECRET`,
   `GEMINI_API_KEY`.

If you create the service manually instead, set **Root Directory** to `backend`. This is the
single most common deployment mistake for this repository.

As a fallback, the repository root also has a `package.json` whose `postinstall` installs the
backend dependencies and whose `start` runs `node backend/server.js`. A service created at the
repository root with `npm install` + `npm start` therefore works too, but setting Root
Directory to `backend` is still the preferred setup.

#### Troubleshooting a failed Render deploy

| Build log says | Cause | Fix |
|---|---|---|
| `npm error code ENOENT` / `Could not read package.json` | Root Directory is the repo root, which has no manifest | Set Root Directory to `backend` |
| `npm error Missing script: "start"` | Start command runs outside `backend` | Use `npm start` with Root Directory `backend` |
| `npm error code ETARGET ... cors@...` | A dependency version that does not exist | Run `npm ci` locally and commit the updated lock file |
| `npm error code EBADENGINE` | Node too old for Mongoose 9 | Set `NODE_VERSION=22` in Render |
| `Missing required environment variables` | Secrets not set on the service | Add them under Environment, then redeploy |
| `Could not connect to MongoDB after N attempts` | Wrong URI, or Atlas IP allowlist blocks Render | Allow `0.0.0.0/0` in Atlas, check the password |
| `Exited with status 1` with no other message | Process crashed at startup | Open the full log; the first error line is the cause |

`GET /api/health` returns `200 {"status":"ok","database":"connected"}` when the service is
healthy.

### Frontend on Vercel

1. Import the repository, set **Root Directory** to `frontend`.
2. Vercel detects Vite automatically.
3. Add `VITE_API_URL=https://<your-service>.onrender.com/api`.
4. Deploy, then add the Vercel domain to `CORS_ORIGINS` on Render if it is not a
   `*.vercel.app` address.

---

## Testing

```bash
cd backend
npm test
```

The suite covers error-status mapping and AI response parsing/history normalisation. Both run
without a database or an API key.

For a manual smoke test, start the backend and use:

```bash
curl http://localhost:5000/api/health
```

---

## Security notes

- Passwords are hashed with bcrypt (cost 10) and never returned by any endpoint.
- JWTs are verified on every protected route; expired tokens return `401`.
- Login and register are rate limited separately from the rest of the API.
- Uploads are limited to PDFs and 15 MB; the parser rejects encrypted or corrupt files.
- CORS only accepts configured origins plus `*.vercel.app`.
- MongoDB queries always filter by the authenticated user id, so one account cannot read
  another account's documents.

## AI notes

- Google retires model IDs regularly. `gemini-2.0-flash` and `gemini-2.5-flash` no longer
  exist; the default is `gemini-3.5-flash`, and the service falls back to
  `gemini-flash-latest` if a configured model disappears.
- The Gemini free tier allows roughly five generate requests per minute per model. Generating
  a summary, a deck and a quiz in quick succession can hit that limit; the API returns a
  friendly 502/503 and the client can retry.
- Responses are requested as JSON and validated before use; invalid cards or questions are
  dropped rather than shown to the user.

## License

MIT (c) 2026 LearnAI. Built for educational use.
