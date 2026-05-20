# 🎵 Addis Music — MERN Stack Music Manager

A full-stack music catalog application built with the MERN stack. Manage songs, browse statistics, and filter by genre — all without page reloads.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | _Deploy to Vercel and add link here_ |
| Backend  | _Deploy to Render and add link here_ |

---

## Features

### Core
- **Create, Read, Update, Delete** songs (title, artist, album, genre)
- **Real-time UI updates** — adding, editing, or deleting a song instantly reflects in the list and statistics without a page reload
- **Statistics dashboard** — total songs, artists, albums, genres; breakdown by genre, artist, and album
- **Genre filter** — filter the song list by any genre with a single click

### Technical highlights
- Redux-Saga handles all async API calls — components never call the API directly
- Stats auto-refresh after every create / update / delete operation
- TypeScript throughout the frontend with strict mode — no `any` types
- Backend containerized with Docker for consistent local development
- Deployment-ready: `render.yaml` for backend, `vercel.json` for frontend

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| MongoDB Atlas | Cloud database |
| Mongoose | Schema definition, validation, ODM |
| TypeScript | Type safety |
| Docker | Containerization |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI components |
| TypeScript | Type safety (strict, no `any`) |
| Redux Toolkit | State management |
| Redux-Saga | Async API calls via generator functions |
| Emotion (`@emotion/styled`) | CSS-in-JS component styling |
| Styled System | Theme-aware spacing, color, typography props |
| Vite | Build tool and dev server |

---

## Project Structure

```
addis-music/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── songController.ts   # CRUD handlers
│   │   │   └── statsController.ts  # Aggregation pipelines
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts     # Global error handler
│   │   │   └── validateObjectId.ts # ObjectId format check
│   │   ├── models/
│   │   │   └── Song.ts             # Mongoose schema + ISong interface
│   │   ├── routes/
│   │   │   ├── songRoutes.ts
│   │   │   └── statsRoutes.ts
│   │   ├── app.ts                  # Express app factory
│   │   └── server.ts               # Entry point (connects MongoDB, starts server)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── render.yaml
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── SongList.tsx         # Song table with edit/delete
    │   │   ├── SongForm.tsx         # Create/edit modal form
    │   │   ├── GenreFilter.tsx      # Genre chip filter bar
    │   │   └── StatsDashboard.tsx   # Stats cards + breakdown panels
    │   ├── sagas/
    │   │   ├── songsSaga.ts         # CRUD saga workers + watchers
    │   │   ├── statsSaga.ts         # Stats fetch saga
    │   │   └── rootSaga.ts          # Combines all sagas
    │   ├── services/
    │   │   └── api.ts               # Typed fetch wrapper
    │   ├── store/
    │   │   ├── songsSlice.ts        # Songs state + actions
    │   │   ├── statsSlice.ts        # Stats state + actions
    │   │   └── index.ts             # Store config, typed hooks
    │   ├── theme/
    │   │   ├── index.ts             # Styled System theme tokens
    │   │   └── ThemeProvider.tsx    # Emotion ThemeProvider wrapper
    │   ├── types/
    │   │   └── song.ts              # Song, SongFormData, StatsResponse interfaces
    │   ├── App.tsx                  # Root layout (sidebar + routing)
    │   └── main.tsx
    ├── vercel.json
    └── package.json
```

---

## API Reference

### Songs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/songs` | List all songs |
| `POST` | `/api/songs` | Create a song |
| `PUT` | `/api/songs/:id` | Update a song |
| `DELETE` | `/api/songs/:id` | Delete a song |

**Song object shape:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "album": "A Night at the Opera",
  "genre": "Rock",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get aggregated catalog statistics |

**Stats response shape:**
```json
{
  "totalSongs": 42,
  "totalArtists": 15,
  "totalAlbums": 20,
  "totalGenres": 6,
  "songsPerGenre": [
    { "genre": "Jazz", "count": 10 }
  ],
  "songsAndAlbumsPerArtist": [
    { "artist": "Miles Davis", "songCount": 8, "albumCount": 3 }
  ],
  "songsPerAlbum": [
    { "album": "Kind of Blue", "count": 5 }
  ]
}
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm 9+
- Docker + Docker Compose (for containerized backend)
- A MongoDB Atlas account (free M0 cluster)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/addis-music.git
cd addis-music
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Option A — run with Node directly:**
```bash
npm install
npm run dev
```

**Option B — run with Docker Compose (includes local MongoDB):**
```bash
docker-compose up --build
```

Backend will be available at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

```bash
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## Running Tests

### Backend
```bash
cd backend
npm test
```
Runs Jest with `mongodb-memory-server` — no real MongoDB needed. Includes unit tests, integration tests, and property-based tests (fast-check).

### Frontend
```bash
cd frontend
npm test
```
Runs Vitest with React Testing Library. Includes unit tests for Redux slices, saga tests, component tests, and property-based tests.

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo, set root directory to `backend/`
4. Set environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `PORT` — `5000`
   - `NODE_ENV` — `production`
   - `FRONTEND_URL` — your Vercel frontend URL (add after deploying frontend)
5. Build command: `npm install && npm run build`
6. Start command: `node dist/server.js`

### Frontend → Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Connect your GitHub repo, set root directory to `frontend/`
3. Set environment variable:
   - `VITE_API_BASE_URL` — your Render backend URL (e.g. `https://addis-music-api.onrender.com`)
4. Deploy — Vercel auto-detects Vite

---

## Key Concepts

### Why Redux-Saga over Redux Thunk?
Sagas use ES6 generator functions (`function*`), making complex async flows (sequencing, cancellation, retries) easier to read and test. Each `yield call(...)` is a declarative step — you can test the saga by stepping through yields without mocking the network.

### How the data flow works
```
User action
  → Component dispatches a Redux action (e.g. createSongRequest)
  → Saga watcher picks it up (takeLatest)
  → Saga worker calls the API service
  → On success: dispatches addSong → Redux store updates → React re-renders
  → Also dispatches fetchStatsRequest → stats panel updates automatically
```

### MongoDB aggregation pipelines
The stats endpoint uses `$group`, `$sum`, `$addToSet`, and `$size` stages to compute all statistics in a single round-trip per metric, rather than loading all documents into Node and computing in JavaScript.

### Docker setup
The `Dockerfile` uses a multi-stage build: the builder stage compiles TypeScript, the production stage copies only the compiled `dist/` and production `node_modules` — keeping the final image small. `docker-compose.yml` wires the API container to a local MongoDB container so you can run the full stack with one command.

---

## Author

Built as part of the Addis Software MERN Stack test project.
