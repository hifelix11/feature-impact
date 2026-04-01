# Pulse - Feature Impact Tracker

Pulse helps product and marketing teams measure the real impact of Bloomreach Engagement features on key business metrics. It syncs campaign and experiment data from Bloomreach, stores it in Supabase, and uses Claude to generate plain-language impact summaries -- so stakeholders can quickly understand what moved the needle and why.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | Supabase (PostgreSQL + Auth + Row-Level Security) |
| Data Source | Bloomreach Engagement API |
| AI Analysis | Anthropic Claude API |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
feature-impact/
├── backend/            # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/   # Bloomreach sync, Claude analysis
│   │   └── models/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # React + Vite application
│   ├── src/
│   └── package.json
├── supabase/           # Migrations and seed data
│   └── migrations/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- Supabase CLI (`npm install -g supabase`)
- A Bloomreach Engagement account with API credentials
- An Anthropic API key

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd feature-impact
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env
   # Fill in your real keys in .env
   ```

3. **Start Supabase locally**

   ```bash
   npx supabase start
   ```

   This will print your local `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Copy them into `.env`.

4. **Start the backend**

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

5. **Start the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Using Docker Compose

To run the backend and a Postgres instance together:

```bash
docker compose up --build
```

For the full Supabase stack (Auth, Realtime, PostgREST), use the Supabase CLI as described above -- Docker Compose only provides the database container.

## Development Commands

| Command | Description |
|---------|-------------|
| `npx supabase start` | Start local Supabase stack |
| `npx supabase db reset` | Reset database and re-run migrations |
| `npx supabase migration new <name>` | Create a new migration file |
| `uvicorn app.main:app --reload` | Start FastAPI dev server |
| `pytest` | Run backend tests |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |
| `docker compose up --build` | Start all services via Docker |

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` -- connect to your Supabase project
- `BLOOMREACH_*` -- authenticate with the Bloomreach Engagement API
- `ANTHROPIC_API_KEY` -- used by the backend to call Claude for impact analysis
- `SYNC_INTERVAL_HOURS` -- how often the backend syncs data from Bloomreach (default: 6)
- `DEFAULT_COMPARISON_WINDOW_DAYS` -- default before/after window for impact comparison (default: 14)

## License

Private -- all rights reserved.
