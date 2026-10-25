# Project notes for agents

## Layout

| Path | What lives here |
|---|---|
| `backend/` | Express API (CommonJS). Entry point `server.js`, app wiring in `app.js` |
| `frontend/` | React + Vite SPA (ESM) |
| `render.yaml` | Render blueprint for the backend (`rootDir: backend`) |
| `.env.example` | Documented environment variables; copy to `.env` for local dev |

## Commands

| Task | Command | Directory |
|---|---|---|
| Start API | `npm start` | `backend` |
| Watch API | `npm run dev` | `backend` |
| Backend tests | `npm test` | `backend` |
| Frontend dev | `npm run dev` | `frontend` |
| Frontend build | `npm run build` | `frontend` |
| Frontend lint | `npm run lint` | `frontend` |

## Conventions

- **Backend layering:** `routes` -> `controllers` (validate, respond) -> `services` (logic).
  Controllers throw `ApiError`; only `middleware/errorMiddleware.js` sets error status codes.
- **Async handlers** rely on Express 5's promise rejection forwarding. Do not add try/catch that
  swallows errors; let them reach the error middleware.
- **Mongo queries** for user data must filter by `user: req.user._id`, never fetch then compare.
- **Uploads** stay in memory (Multer memoryStorage). Do not add disk storage: Render's filesystem
  is ephemeral and the extracted text in MongoDB is what the app uses.
- **AI models** are read from `config.geminiModel`. `services/aiService.js` owns retries, JSON
  extraction and prompt construction; keep provider calls out of controllers.
- **Frontend API contract** lives in `frontend/src/api/axios.js`; it appends `/api` to
  `VITE_API_URL`. Response shapes are documented in `README.md`.

## Verification before reporting done

```bash
cd backend && npm test
cd frontend && npm run build
```

Report any check you did not run as `UNVERIFIED`. Do not deploy, rotate secrets, or push
without explicit approval.
