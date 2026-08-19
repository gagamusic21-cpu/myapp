# huec-api — Hawassa University Exams & Courses API

Express + Prisma + PostgreSQL backend for the platform. Pairs with the Vite/React frontend in the repo root.

## Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Runtime   | Node.js ≥ 18, Express 4                     |
| Database  | PostgreSQL (Neon / Supabase free tier)      |
| ORM       | Prisma 5                                    |
| Auth      | JWT (`jsonwebtoken`) + bcrypt password hash |

## Quick start

```bash
cd server
cp .env.example .env          # then set DATABASE_URL + JWT_SECRET
npm install
npx prisma db push            # creates all tables
npm run seed                  # creates the default staff account
npm run dev                   # http://localhost:4000
```

Default staff login (change in production via `.env`): **`admin` / `staff123`** (role `OWNER`).

## API reference

Base URL: `http://localhost:4000` (dev) · all bodies are JSON.
`🔒` = any Bearer token · `🛡` = Bearer token with `OWNER`/`STAFF` role.

### Meta

| Method | Route          | Auth | Description                              |
| ------ | -------------- | ---- | ---------------------------------------- |
| GET    | `/api/health`  | —    | Liveness check                           |
| GET    | `/api/stats`   | —    | Counts: exams, docs, photos, courses     |
| GET    | `/api/snapshot`| —    | Full public read of all published content |

### Auth

| Method | Route               | Auth | Body                                          | Returns            |
| ------ | ------------------- | ---- | --------------------------------------------- | ------------------ |
| POST   | `/api/auth/signup`  | —    | `{ username, password, name?, staffKey? }`    | `{ token, user }`  |
| POST   | `/api/auth/login`   | —    | `{ username, password }`                      | `{ token, user }`  |
| GET    | `/api/auth/me`      | 🔒   | —                                             | `{ user }`         |

A signup only becomes `STAFF` when `staffKey` matches the server's `STAFF_KEY` env var; otherwise the account is `STUDENT`.

### Content (CRUD per collection)

Collections: `exams`, `courses`, `documents`, `photos`, `announcements`, `ads`.

| Method | Route                    | Auth | Description                    |
| ------ | ------------------------ | ---- | ------------------------------ |
| POST   | `/api/{collection}`      | 🛡   | Create (server validates + whitelists fields) |
| DELETE | `/api/{collection}/:id`  | 🛡   | Delete (idempotent)            |

Example — publish an exam:

```bash
curl -X POST http://localhost:4000/api/exams \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "entityId": "mathematics",
    "title": "Mathematics — Final Exam 2016 E.C.",
    "courseCode": "MATH 1011", "type": "Final",
    "year": "2016 E.C.", "gYear": "2023/24", "semester": "II",
    "duration": "3 hrs", "marks": 70, "hasAnswers": true,
    "questions": [{ "q": "d/dx(x²) = ?", "o": ["2x","x","2","x²"], "a": 0, "e": "Power rule" }]
  }'
```

Photos carry their image as a base64 data-URL in `src` (the frontend downscales to ≤1280 px before upload); documents may attach the real file as base64 in `fileData`.

### Chat

| Method | Route                          | Auth | Description                         |
| ------ | ------------------------------ | ---- | ----------------------------------- |
| GET    | `/api/chat/:room`              | —    | Latest ≤200 messages for a room     |
| POST   | `/api/chat/:room`              | —    | Post `{ id?, author, text, time?, replyTo? }` |
| POST   | `/api/chat/message/:id/report` | —    | Flag a message for moderators       |
| DELETE | `/api/chat/:id`                | 🛡   | Remove a message (moderation)       |

Rooms: `general` plus one room per subject/department id.

## Security notes

- Passwords: bcrypt (cost 10). Hashes never leave the API.
- Writes are staff-gated (`staffRequired`); reads are public by design (open educational archive).
- Every input is length-capped and field-whitelisted in `content.routes.js` — unknown keys are dropped.
- CORS only allows origins listed in `CLIENT_ORIGIN`.
- Set a strong `JWT_SECRET` and rotate `SEED_ADMIN_PASSWORD` after first login in production.
