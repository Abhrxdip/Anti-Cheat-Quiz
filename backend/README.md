# Quiz Backend

## Run

```bash
npm install
npm run dev
```

Server runs on http://localhost:4000 by default.

## Persistence

- Sessions and submissions are persisted to `backend/data/quiz-db.json`.
- Data remains available after backend restart.

## APIs

- `POST /api/quiz/start`
- `POST /api/quiz/violation`
- `POST /api/quiz/submit`
- `GET /api/admin/submissions`
