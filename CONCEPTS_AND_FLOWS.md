# Addis Music — Concepts, Flows & Feature Explanations

Study this file to understand *why* every piece of the project works the way it does.

---

## 1. Full Application Data Flow

```
Browser (React)
  │
  ├─ User clicks a button
  ├─ Component dispatches a Redux action  →  Redux Store
  │                                              │
  │                                         Redux-Saga middleware intercepts
  │                                              │
  │                                         Saga calls api.ts (fetch)
  │                                              │
  │                                         Express REST API (Node.js)
  │                                              │
  │                                         Mongoose queries MongoDB Atlas
  │                                              │
  │                                         Response flows back up
  │                                              │
  │                                         Saga dispatches success/failure action
  │                                              │
  │                                         Redux Store updates state
  │                                              │
  └─ React re-renders components from new state (no page reload)
```

---

## 2. Redux — Core Concepts

### What is Redux?
Redux is a **predictable state container**. All application data lives in one central JavaScript object called the **store**. Components read from it and write to it through a strict one-way data flow.

### The three principles
1. **Single source of truth** — one store holds all state
2. **State is read-only** — you never mutate state directly; you dispatch actions
3. **Changes are made with pure functions** — reducers take the old state + action and return new state

### Key pieces

| Piece | What it is | In this project |
|---|---|---|
| **Store** | The single state container | `frontend/src/store/index.ts` |
| **State** | The data shape | `SongsState`, `StatsState` |
| **Action** | A plain object describing what happened | `{ type: 'songs/addSong', payload: song }` |
| **Reducer** | Pure function: `(state, action) => newState` | Inside `songsSlice.ts` |
| **Dispatch** | Function to send an action to the store | `dispatch(createSongRequest(data))` |
| **Selector** | Function to read a slice of state | `useAppSelector(s => s.songs.songs)` |

### Redux Toolkit (`createSlice`)
Without Redux Toolkit you write action creators and reducers separately — lots of boilerplate. `createSlice` generates both from one object:

```ts
const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    addSong(state, action: PayloadAction<Song>) {
      state.songs.push(action.payload); // Immer lets you "mutate" safely
    },
  },
});
// Auto-generates: songsSlice.actions.addSong, songsSlice.reducer
```

### Immer (built into Redux Toolkit)
Normally you cannot mutate state in a reducer. Redux Toolkit uses **Immer** under the hood, which lets you write `state.songs.push(song)` and Immer converts it to an immutable update behind the scenes.

### Typed hooks
```ts
// store/index.ts
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
```
These give you full TypeScript autocomplete when reading state or dispatching actions.

---

## 3. Redux-Saga — Core Concepts

### What is Redux-Saga?
Redux-Saga is a middleware that intercepts Redux actions and runs **side effects** (API calls, timers, etc.) in a controlled way using **generator functions**.

### Why not just use async/await in components?
- Components should only render UI — mixing API calls in components makes them hard to test and reuse
- Sagas are completely separate from the UI — you can test them without rendering anything
- Sagas can handle complex flows: cancellation, retries, race conditions

### Generator functions
A generator function uses `function*` and `yield`. It can pause and resume:

```js
function* example() {
  console.log('step 1');
  yield 'pause here';
  console.log('step 2');
}
const gen = example();
gen.next(); // logs "step 1", pauses
gen.next(); // logs "step 2"
```

Redux-Saga uses this to pause at each `yield` and wait for the result before continuing.

### The four effects you use

| Effect | What it does | Example |
|---|---|---|
| `call(fn, arg)` | Calls a function (usually async), waits for result | `yield call(getSongs)` |
| `put(action)` | Dispatches an action to the Redux store | `yield put(fetchSongsSuccess(songs))` |
| `takeLatest(type, worker)` | Watches for an action; if a new one arrives, cancels the previous | `takeLatest(fetchSongsRequest.type, fetchSongsWorker)` |
| `takeEvery(type, worker)` | Watches for an action; runs worker for every occurrence | `takeEvery(deleteSongRequest.type, deleteSongWorker)` |
| `all([...])` | Runs multiple watchers concurrently | `yield all([watchFetchSongs(), watchCreateSong()])` |

### Worker vs Watcher pattern
```
Watcher saga          Worker saga
─────────────         ─────────────────────────────────────
watchFetchSongs  →    fetchSongsWorker
  takeLatest            put(fetchSongsStart)
  (fetchSongsRequest)   call(getSongs)  ← actual API call
                        put(fetchSongsSuccess(songs))
                        OR
                        put(fetchSongsFailure(error.message))
```

### Why `takeLatest` for fetch/create/update?
If the user clicks "Add Song" twice quickly, `takeLatest` cancels the first saga and only processes the second. This prevents duplicate submissions.

### Why `takeEvery` for delete?
If the user deletes two songs quickly, you want **both** deletions to go through. `takeEvery` runs a new worker for each action without cancelling previous ones.

---

## 4. Feature Flows

### Flow 1: App loads → songs appear

```
1. App.tsx mounts
2. useEffect fires → dispatch(fetchSongsRequest())
3. watchFetchSongs saga picks it up (takeLatest)
4. fetchSongsWorker runs:
   a. put(fetchSongsStart())       → store: loading = true
   b. call(getSongs)               → GET /api/songs
   c. Express returns JSON array
   d. put(fetchSongsSuccess(songs)) → store: songs = [...], loading = false
5. SongList reads songs from store → renders rows
```

### Flow 2: User adds a song

```
1. User fills SongForm and clicks "Add Song"
2. handleSubmit validates fields (client-side)
3. dispatch(createSongRequest({ title, artist, album, genre }))
4. watchCreateSong saga picks it up
5. createSongWorker runs:
   a. call(createSong, data)       → POST /api/songs
   b. Express validates, saves to MongoDB, returns 201 + new song
   c. put(addSong(song))           → store: songs.push(newSong)
   d. put(fetchStatsRequest())     → triggers stats refresh
6. SongList re-renders with new song (no page reload)
7. StatsDashboard re-renders with updated counts
```

### Flow 3: User edits a song

```
1. User clicks ✏ on a song row
2. App.tsx sets editingSong state → opens modal
3. SongForm receives song prop → useEffect pre-populates fields
4. User changes fields, clicks "Update Song"
5. dispatch(updateSongRequest({ id: song._id, data }))
6. watchUpdateSong saga picks it up
7. updateSongWorker runs:
   a. call(apiUpdateSong, id, data) → PUT /api/songs/:id
   b. Express finds doc, updates with runValidators: true, returns 200
   c. put(updateSong(updatedSong))  → store: replaces song at matching _id
   d. put(fetchStatsRequest())
8. SongList row updates in place (no page reload)
```

### Flow 4: User deletes a song

```
1. User clicks ✕ on a song row
2. dispatch(deleteSongRequest(song._id))
3. watchDeleteSong saga picks it up (takeEvery)
4. deleteSongWorker runs:
   a. call(deleteSong, id)         → DELETE /api/songs/:id
   b. Express finds and removes doc, returns 200
   c. put(removeSong(id))          → store: filters out song with that _id
   d. put(fetchStatsRequest())
5. SongList re-renders without the deleted song
```

### Flow 5: Genre filter

```
1. GenreFilter derives distinct genres from store using useMemo
2. User clicks a genre chip
3. dispatch(setSelectedGenre('Jazz'))
4. songsSlice reducer: state.selectedGenre = 'Jazz'
5. SongList reads selectedGenre from store
6. useMemo recomputes displayedSongs = songs.filter(s => s.genre === 'Jazz')
7. Only Jazz songs render — no API call needed (client-side filter)
8. User clicks "All" → dispatch(setSelectedGenre(null)) → all songs show
```

### Flow 6: Statistics load and refresh

```
Initial load:
1. StatsDashboard mounts
2. useEffect → dispatch(fetchStatsRequest())
3. fetchStatsWorker → GET /api/stats
4. Express runs 7 parallel aggregation pipelines via Promise.all
5. Returns totalSongs, totalArtists, totalAlbums, totalGenres,
   songsPerGenre, songsAndAlbumsPerArtist, songsPerAlbum
6. put(fetchStatsSuccess(data)) → store: stats.data = data
7. StatsDashboard renders cards and panels

After any mutation (create/update/delete):
- The song saga dispatches fetchStatsRequest after success
- Stats saga re-fetches → store updates → dashboard re-renders automatically
```

### Flow 7: Error handling

```
Backend error path:
1. Controller calls next(err)
2. errorHandler middleware catches it
3. If Mongoose ValidationError → 400 + { error: message }
4. Otherwise → 500 + { error: 'Internal server error' }

Frontend error path:
1. api.ts fetch gets non-2xx response
2. Parses { error: string } from response body
3. Throws new Error(message)
4. Saga catch block: put(fetchSongsFailure(error.message))
5. store: error = 'message', loading = false
6. SongList reads error from store → renders error banner
```

---

## 5. Backend Architecture

### Why separate `app.ts` and `server.ts`?
`app.ts` creates and configures the Express app (routes, middleware) but does **not** start listening. `server.ts` connects to MongoDB and then starts the server. This separation means tests can import `app` directly without starting a real server or connecting to a real database.

### Middleware order in `app.ts`
```
helmet()           ← security headers (must be first)
cors()             ← allow cross-origin requests
express.json()     ← parse request bodies
JSON error handler ← catch malformed JSON (must be after express.json)
/api/songs routes
/api/stats routes
errorHandler       ← global error handler (must be last)
```
Order matters because Express processes middleware top-to-bottom. The error handler must be last so it catches errors from all routes.

### `validateObjectId` middleware
MongoDB ObjectIds are 24-character hex strings. If you pass `"abc"` to `findById`, Mongoose throws a `CastError`. The middleware checks the format before the controller runs and returns a clean 400 response instead of an unhandled error.

### Mongoose validation flow
```
POST /api/songs with { title: "  " }
  → createSong controller: title !== '' so passes explicit check
  → new Song({ title: "  " }).save()
  → Mongoose runs trim: true → title becomes ""
  → Custom validator: "".length === 0 → throws ValidationError
  → next(err) → errorHandler → 400 { error: "title cannot be empty..." }
```

---

## 6. Docker — Complete Explanation

### What Docker solves
Without Docker: "It works on my machine" — different Node versions, OS differences, missing environment variables cause bugs in production that don't exist locally. Docker packages your app and its entire environment into a **container** that runs identically everywhere.

### Key terms

| Term | Meaning |
|---|---|
| **Image** | A read-only blueprint (like a class) |
| **Container** | A running instance of an image (like an object) |
| **Dockerfile** | Instructions to build an image |
| **docker-compose** | Tool to run multiple containers together |
| **Volume** | Persistent storage that survives container restarts |
| **Layer** | Each instruction in a Dockerfile creates a cached layer |

### Your Dockerfile explained line by line

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
# Use Node 18 on Alpine Linux (small ~5MB base image)
# "AS builder" names this stage so we can reference it later

WORKDIR /app
# All subsequent commands run in /app inside the container

COPY package*.json ./
# Copy ONLY package.json first (not source code)
# This is the layer caching trick: if package.json hasn't changed,
# Docker reuses the cached npm install layer → much faster rebuilds

RUN npm ci
# Install exact versions from package-lock.json (reproducible)
# npm ci is faster and stricter than npm install for CI/CD

COPY . .
# Now copy source code (after installing deps)

RUN npm run build
# Compile TypeScript → dist/ folder

# Stage 2: Production
FROM node:18-alpine
# Fresh base image — no build tools, no TypeScript compiler

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
# Install ONLY production dependencies (no Jest, ts-jest, etc.)
# Keeps the final image small

COPY --from=builder /app/dist ./dist
# Copy compiled JS from the builder stage

EXPOSE 5000
# Documents that the container listens on port 5000

CMD ["node", "dist/server.js"]
# Command that runs when the container starts
```

### Why multi-stage build?
The builder stage needs TypeScript, ts-node, and all dev tools. The production stage only needs Node and the compiled JS. Multi-stage builds let you use the builder's output without including its tools in the final image. Result: final image is ~150MB instead of ~500MB.

### docker-compose.yml explained

```yaml
services:
  api:
    build: .                          # Build from Dockerfile in current dir
    ports:
      - "5000:5000"                   # host:container port mapping
    environment:
      - MONGODB_URI=mongodb://mongo:27017/addis-music
      # "mongo" is the service name — Docker's internal DNS resolves it
      - PORT=5000
      - NODE_ENV=development
    depends_on:
      - mongo                         # Start mongo before api

  mongo:
    image: mongo:7                    # Use official MongoDB 7 image
    ports:
      - "27017:27017"                 # Expose for local tools (Compass, etc.)
    volumes:
      - mongo-data:/data/db           # Persist data between container restarts

volumes:
  mongo-data:                         # Named volume definition
```

### How containers communicate
Docker Compose creates a private network. Each service is reachable by its **service name** as a hostname. So `mongodb://mongo:27017` works because Docker resolves `mongo` to the MongoDB container's IP address automatically.

---

## 7. TypeScript in This Project

### Why TypeScript?
JavaScript has no type checking — you can pass a string where a number is expected and only find out at runtime. TypeScript catches these errors at compile time, before the code runs.

### Key types in this project

```ts
// The Song shape returned by the API
interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

// What the form submits
interface SongFormData {
  title: string;
  artist: string;
  album: string;
  genre: string;
}

// Redux state shape
interface SongsState {
  songs: Song[];
  loading: boolean;
  error: string | null;
  selectedGenre: string | null;
}
```

### Strict mode
`tsconfig.json` has `"strict": true` which enables:
- `noImplicitAny` — every variable must have a type
- `strictNullChecks` — `null` and `undefined` are not assignable to other types
- `strictFunctionTypes` — function parameter types are checked strictly

### No `any`
Using `any` defeats the purpose of TypeScript — it turns off type checking for that value. Instead you use:
- `unknown` — must narrow the type before using it
- Specific interfaces — `Song`, `SongFormData`, etc.
- Generics — `Promise<Song[]>`, `PayloadAction<string>`

---

## 8. Emotion + Styled System

### Emotion
Emotion is a CSS-in-JS library. Instead of writing `.css` files, you write CSS inside JavaScript template literals:

```ts
const Button = styled.button`
  background: #8B5CF6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
`;
```

Benefits:
- Styles are scoped to the component — no class name collisions
- Dynamic styles based on props: `background: ${({ active }) => active ? 'purple' : 'gray'}`
- No separate CSS files to manage

### Styled System
Styled System adds **theme-aware utility props** to styled components:

```ts
// Instead of writing CSS for every spacing/color value:
<Box p={4} bg="primary" color="text" />
// p={4} → padding: 16px (from theme.space[4])
// bg="primary" → background: theme.colors.primary
```

### Theme
The central theme object (`theme/index.ts`) defines design tokens:
- `colors` — brand colors, text colors, backgrounds
- `space` — spacing scale `[0, 4, 8, 12, 16, 24, 32, 48, 64]`
- `fontSizes` — type scale
- `radii` — border radius values

All components reference the theme, so changing one value updates the entire app consistently.

---

## 9. API Service Layer (`services/api.ts`)

### Why a separate service layer?
Components and sagas should not contain raw `fetch` calls. The service layer:
- Centralizes the base URL (`VITE_API_BASE_URL`)
- Handles error parsing (extracts `{ error: string }` from responses)
- Provides typed functions so TypeScript knows what each call returns

### The `request<T>` generic function
```ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error ?? 'Request failed');
    // Throws with the API's error message → saga catches it
  }

  return response.json() as Promise<T>;
}
```

The `<T>` generic means the caller decides the return type:
- `request<Song[]>('/api/songs')` → TypeScript knows it returns `Song[]`
- `request<Song>('/api/songs', { method: 'POST', ... })` → returns `Song`

---

## 10. Things to Say in the Interview

**When asked "explain your project":**
> "Addis Music is a full-stack MERN application. The backend is a REST API built with Express and Mongoose that stores songs in MongoDB Atlas and exposes CRUD endpoints plus a statistics endpoint using aggregation pipelines. The frontend is a React TypeScript SPA that uses Redux Toolkit for state management and Redux-Saga for all async API calls. Every mutation — create, update, delete — updates the Redux store immediately so the UI reflects changes without a page reload. The backend is containerized with Docker and the app is deployed on Render and Vercel."

**When asked "why Redux-Saga over Thunk":**
> "Sagas use generator functions which make async flows declarative and easy to test. I can test a saga by stepping through its yields and asserting what it dispatches at each step, without mocking the network. Thunks are simpler for basic cases but sagas scale better for complex flows like cancellation, retries, and sequencing multiple API calls."

**When asked "explain the aggregation pipeline for artist stats":**
> "I use a `$group` stage that groups all songs by artist name. For each group I count the songs with `$sum: 1` and collect distinct album names with `$addToSet`. Then in a `$project` stage I use `$size` on the albums array to get the album count. This runs entirely in MongoDB — no data is loaded into Node.js."

**When asked "what does Docker solve":**
> "Docker ensures the app runs identically in development, CI, and production. I use a multi-stage build: the first stage compiles TypeScript, the second stage copies only the compiled output and production dependencies. This keeps the final image small and avoids shipping dev tools to production."
