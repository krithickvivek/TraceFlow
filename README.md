# TraceFlow V2 — Interactive DSA Visualizer

> Learn Data Structures & Algorithms through live, step-by-step visual dry runs.

**Tech Stack:** React 18 + Vite | Tailwind CSS | D3.js | Framer Motion | Node.js + Express | SQLite

---

## Screenshots

> *(Add screenshots here)*

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

---

## Installation & Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd traceflow

# Install server dependencies
cd server
npm install
cp .env.example .env   # Edit JWT_SECRET for production

# Install client dependencies
cd ../client
npm install
```

---

## Running in Development

```bash
# Terminal 1 — Backend
cd server
node index.js
# SQLite DB auto-created as traceflow.db
# Server: http://localhost:4000

# Terminal 2 — Frontend
cd client
npm run dev
# App: http://localhost:5173
```

---

## Environment Variables

| Variable     | Default                         | Description              |
|--------------|---------------------------------|--------------------------|
| `PORT`       | `4000`                          | Server port              |
| `JWT_SECRET` | *(change this in production!)*  | JWT signing secret       |
| `NODE_ENV`   | `development`                   | Environment mode         |

---

## How to Add a New Algorithm

1. **Create** `client/src/algorithms/yourAlgo.js` — export `generateSteps`, `metadata`, and `pseudoCode`
2. **Register** it in `client/src/algorithms/index.js` — import and add to the `algorithms` map
3. **Add an icon** mapping in `Sidebar.jsx` if using a new category
4. **Done.** No other files need changing — the sidebar, info panel, and pseudocode panel all read from the registry automatically.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                           │
│                                                     │
│  React 18 + React Router                            │
│  ┌─────────┬──────────────────┬──────────────┐     │
│  │ Sidebar │   Visualizer     │  Right Panel  │     │
│  │ (algos) │   (D3.js SVG)    │  (Info/Code)  │     │
│  └─────────┴──────────────────┴──────────────┘     │
│                                                     │
│  Context: Auth | Trace | Toast                      │
│  Framer Motion page transitions                     │
└──────────────────┬──────────────────────────────────┘
                   │ Axios (credentials: true)
                   ▼
┌──────────────────────────────────────────────────────┐
│                EXPRESS SERVER (:4000)                  │
│                                                      │
│  /api/auth      → register, login, logout, me        │
│  /api/algorithms → list all algorithm metadata        │
│  /api/progress   → save/get user progress             │
│                                                      │
│  SQLite (better-sqlite3) → traceflow.db              │
│  JWT in httpOnly cookies                              │
└──────────────────────────────────────────────────────┘
```

---

## API Reference

| Method | Endpoint              | Auth     | Description                  |
|--------|-----------------------|----------|------------------------------|
| POST   | `/api/auth/register`  | No       | Create new user account      |
| POST   | `/api/auth/login`     | No       | Authenticate user            |
| POST   | `/api/auth/logout`    | No       | Clear auth cookie            |
| GET    | `/api/auth/me`        | Required | Get current user session     |
| GET    | `/api/algorithms`     | No       | List all algorithm metadata  |
| GET    | `/api/progress`       | Required | Get user's algorithm progress|
| POST   | `/api/progress`       | Required | Save algorithm completion    |

---

## Algorithms Included

| Algorithm       | Category  | Difficulty    | Time (Worst) |
|-----------------|-----------|---------------|--------------|
| Bubble Sort     | Sorting   | Beginner      | O(n²)        |
| Selection Sort  | Sorting   | Beginner      | O(n²)        |
| Insertion Sort  | Sorting   | Beginner      | O(n²)        |
| Merge Sort      | Sorting   | Intermediate  | O(n log n)   |
| Quick Sort      | Sorting   | Intermediate  | O(n²)        |
| Linear Search   | Searching | Beginner      | O(n)         |
| Binary Search   | Searching | Beginner      | O(log n)     |

---

## Scaling to Production

- **Database:** Replace SQLite with PostgreSQL via `pg` or Prisma ORM
- **Sessions:** Add Redis for session caching + rate limiting
- **Workers:** Extract algorithm step generation to a worker service
- **Real-time:** Add WebSocket support for collaborative sessions
- **CDN:** Serve the Vite build from a CDN (CloudFront, Vercel, etc.)

---

## License

MIT
