# Pulse - Feature Impact Tracker

Pulse helps product and marketing teams measure the real impact of Bloomreach Engagement features on key business metrics. It syncs campaign and experiment data from Bloomreach, stores it in Supabase, and uses Claude to generate plain-language impact summaries -- so stakeholders can quickly understand what moved the needle and why.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | Supabase Cloud (PostgreSQL + Auth + Row-Level Security + Storage) |
| Data Source | Bloomreach Engagement API |
| AI Analysis | Anthropic Claude API |

## Project Structure

```
feature-impact/
├── backend/            # FastAPI application
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── routers/
│   ├── services/       # Bloomreach sync, Claude analysis
│   ├── models/
│   └── requirements.txt
├── frontend/           # React + Vite application
│   ├── src/
│   └── package.json
├── supabase/           # Migrations and seed data
│   └── migrations/
├── .env.example
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- A [Supabase](https://supabase.com) cloud project
- A Bloomreach Engagement account with API credentials
- An Anthropic API key

## Setup

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd feature-impact
   ```

2. **Create a Supabase project**

   Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project. From your project's **Settings > API** page, copy:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon (public) key** → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - **service_role (secret) key** → `SUPABASE_SERVICE_ROLE_KEY`

3. **Create your environment file**

   ```bash
   cp .env.example .env
   # Fill in your Supabase, Bloomreach, and Anthropic keys
   ```

4. **Run database migrations**

   Link your Supabase project and push migrations:

   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

   This applies all migrations from `supabase/migrations/` to your cloud database.

5. **Start the backend**

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

6. **Start the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Development Commands

| Command | Description |
|---------|-------------|
| `npx supabase login` | Authenticate with Supabase CLI |
| `npx supabase link --project-ref <ref>` | Link to your cloud project |
| `npx supabase db push` | Push migrations to cloud database |
| `npx supabase db reset --linked` | Reset cloud database and re-run migrations |
| `npx supabase migration new <name>` | Create a new migration file |
| `uvicorn main:app --reload` | Start FastAPI dev server |
| `pytest` | Run backend tests |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Lint frontend code |

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

- `SUPABASE_URL` / `SUPABASE_ANON_KEY` -- connect to your Supabase cloud project
- `SUPABASE_SERVICE_ROLE_KEY` -- used by the backend for service-role operations (bypasses RLS)
- `BLOOMREACH_*` -- authenticate with the Bloomreach Engagement API
- `ANTHROPIC_API_KEY` -- used by the backend to call Claude for impact analysis
- `SYNC_INTERVAL_HOURS` -- how often the backend syncs data from Bloomreach (default: 6)
- `DEFAULT_COMPARISON_WINDOW_DAYS` -- default before/after window for impact comparison (default: 14)

## License

Private -- all rights reserved.
