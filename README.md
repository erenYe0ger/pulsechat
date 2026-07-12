# PulseChat

A real-time one-to-one chat application built to demonstrate production-inspired full-stack engineering — clean architecture, real-time messaging via native WebSockets, and a deployed, working system rather than just a local demo.

**Live app:** https://pulsechat-nu.vercel.app/

**Backend health check:** https://pulsechat-backend-jt4v.onrender.com/health

---

## Features

- **Authentication** — Register, login, logout, JWT-based auth, hashed passwords, protected routes

- **Users** — Search users, edit profile name, live online/offline status

- **Messaging** — One-to-one real-time chat over native WebSockets, persisted chat history, message timestamps, typing indicators, read receipts, unread counts, auto-scroll

- **UI** — Responsive (WhatsApp-style mobile layout), light/dark mode with per-user persistence, loading and empty states throughout

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, React Router, Axios

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT, native WebSockets, Pydantic

**Infra:** Docker (local dev), Vercel (frontend), Render (backend), Neon (Postgres)

## Architecture

- **Connection model:** one WebSocket connection per logged-in user (not per conversation). Auth is passed as a query param (`?token=<jwt>`) since browsers don't support custom WebSocket headers.

- **In-memory connection registry:** a single `ConnectionManager` maps `user_id → WebSocket`, used to route real-time events (messages, typing, read receipts, online status) to the right recipient.

- **Database sessions on the WebSocket route are scoped per-event, not per-connection** — a long-lived socket does NOT hold one database session open for its whole lifetime. Each incoming event opens a short-lived session, uses it, and releases it immediately. This was a deliberate fix after early production testing–see *Key Engineering Decisions* below.

## Database Schema

- `users` — id, name, email, hashed_password, is_online, created_at
- `conversations` — id, created_at (one-to-one only)
- `conversation_members` — id, conversation_id, user_id
- `messages` — id, conversation_id, sender_id, content, is_read, created_at

## Key Engineering Decisions & Bugs Fixed

A few non-obvious issues surfaced during development and deployment that are worth calling out, since they reflect real production lessons rather than textbook implementation:

- **WebSocket + SQLAlchemy session lifecycle:** Initially, one database session was opened per WebSocket connection and reused for its entire lifetime. Under a single transient failure (a dropped connection, a network blip against a pooled remote database), SQLAlchemy marks that session's transaction invalid — and every subsequent query on it fails silently. Fixed by opening a fresh, short-lived session per event instead of one long-lived session per connection.
- **Dead WebSocket connections weren't cleaned up on failed sends.** If a browser tab closed abruptly, the server's in-memory connection registry could still hold a reference to it. Fixed by catching failed sends and immediately evicting that connection from the registry.
- **Online status not synced for the first-connecting user:** a user connecting only got notified about future presence changes, not the *current* online state of their existing conversation partners. Fixed by explicitly syncing current partner presence on connect.
- **SQLAlchemy connection pool tuning for hosted Postgres (Neon):** default pool settings under-provision for a mix of persistent WebSocket connections and frequent REST polling under concurrent test load; tuned `pool_size`, `max_overflow`, and added `pool_pre_ping` for connection health checks.

## Known Limitations (Free-Tier Hosting)

This is a portfolio deployment on free infrastructure, which comes with real, expected tradeoffs:

- **In-memory WebSocket connection state does not survive a backend restart.** If Render restarts the service (deploys, sleep/wake cycles), all users are disconnected and appear offline until they reconnect — expected behavior for a single-instance, no-Redis architecture at this scale.
- **Neon's free tier has a modest connection ceiling.** Under heavy concurrent testing (many rapid logins/reconnects across multiple tabs), the connection pool can be temporarily exhausted, causing slow responses until connections are released. A production deployment would use a paid tier with a higher connection ceiling or an external pooler.
- **No horizontal scaling.** The connection registry is in-process memory, which means this architecture is intentionally single-instance. Multi-instance scaling would require an external pub/sub layer (e.g. Redis) — explicitly out of scope for this project by design.

## Local Development

Requires Docker and Docker Compose.

```bash
git clone https://github.com/erenYe0ger/pulsechat
cd pulsechat
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://pulsechat:pulsechat@postgres:5432/pulsechat
SECRET_KEY=<any-long-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

Then:
```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8000/health

## Deployment

Deployed from a dedicated `deploy` branch:

- **Frontend (Vercel):** root directory `frontend`, env vars `VITE_API_URL` / `VITE_WS_URL` pointing at the Render backend (`wss://` for the WebSocket URL in production)
- **Backend (Render):** Docker deploy using `backend/Dockerfile.prod`, env vars `DATABASE_URL` / `SECRET_KEY` / `ALGORITHM` / `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Database (Neon):** managed Postgres, connected via pooled connection string

## Project Structure

```
pulsechat/
├── backend/
│   └── app/
│       ├── core/          # config, security (JWT/hashing), WebSocket connection manager
│       ├── db/             # engine, session, table init
│       ├── models/         # SQLAlchemy models
│       ├── schemas/        # Pydantic request/response schemas
│       ├── services/       # business logic (auth, users, conversations, messages)
│       └── routes/         # HTTP + WebSocket route handlers
└── frontend/
    └── src/
        ├── api/            # axios instance + typed API calls
        ├── context/        # Auth, Socket, Theme contexts
        ├── components/     # chat UI, conversation list, message input, etc.
        ├── pages/          # Login, Register, Home, Settings
        └── hooks/          # useSocket, useTheme
```

## What's Deliberately Not Included

By design, to keep the scope focused on core real-time chat architecture rather than feature breadth: group chats, file/image uploads, message editing/deletion, reactions, message search, push notifications, and third-party auth providers.
