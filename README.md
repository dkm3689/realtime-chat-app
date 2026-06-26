# Realtime Chat App

A full-stack real-time chat application with room-based messaging, online presence, and typing indicators.

## Tech Stack

**Client**
- React 18 + TypeScript
- Vite
- Socket.io-client
- Axios + React Router

**Server**
- Node.js + Express + TypeScript
- Socket.io
- Redis (pub/sub + online presence via `@socket.io/redis-adapter`)
- PostgreSQL (users, rooms, messages)
- JWT authentication + bcrypt

## Features

- Register and log in with JWT-based auth
- Join chat rooms
- Real-time messaging via WebSockets
- Typing indicators (shows when someone is typing)
- Online presence (see who's currently connected)
- Message history loaded from PostgreSQL on room join
- Redis adapter for scalable multi-instance support

## Project Structure

```
realtime-chat-app/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/         # Axios instance + API calls
│       ├── contexts/    # Auth + Socket context providers
│       ├── pages/       # Login, Register, Chat
│       └── components/  # ChatWindow and other UI
├── server/          # Express + Socket.io backend
│   └── src/
│       ├── config/      # DB, Redis, env config
│       ├── db/          # Migration script
│       ├── middleware/  # JWT auth middleware
│       ├── routes/      # auth, rooms, messages
│       └── socket/      # Socket.io handlers
└── render.yaml      # Render deployment config
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### 1. Clone the repo

```bash
git clone https://github.com/dkm3689/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Server setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

Run the database migration:

```bash
npm run migrate
```

Start the server:

```bash
npm run dev
```

### 3. Client setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

## Environment Variables

### Server

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3001) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLIENT_URL` | Frontend URL (for CORS) |

### Client

| Variable | Description |
|---|---|
| `VITE_SERVER_URL` | Backend server URL (leave unset for local dev) |

## Deployment

| Service | Platform |
|---|---|
| Client | Vercel |
| Server | Render |
| PostgreSQL | Neon (free tier) |
| Redis | Upstash (free tier) |

Set `VITE_SERVER_URL` on Vercel to your Render server URL.  
Set `CLIENT_URL` on Render to your Vercel client URL.

## Database Schema

```sql
users    — id, username, email, password_hash, avatar_color, created_at
rooms    — id, name, description, created_by, created_at
messages — id, room_id, user_id, content, created_at
```
