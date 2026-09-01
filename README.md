# Insenio — Genie Campus Lab Match

A campus research-lab matching platform built entirely on Databricks, for a Databricks-sponsored hackathon. It connects students to faculty research labs through a conversational intake agent, transparent skill/interest matching, and AI-assisted (but always human-confirmed) applications.

This repo currently covers the **backend, database, and AI layers** — a real product frontend is intentionally out of scope for now; a minimal API-only build was the priority.

## What it does

- **Conversational intake** — a student builds their profile (skills, proficiency, research interests, availability) through a chat interface instead of a form. The agent stays strictly on-topic and resists prompt injection (verified by an automated eval suite, see below).
- **Transparent matching** — every lab a student sees comes with a `Ready now` / `Stretch pick` label and named, human-readable reasons (matched skills, missing skills, availability fit, interest overlap) — never a bare score.
- **Semantic interest alignment** — beyond keyword overlap, a Vector Search index over lab research-focus text catches matches that share no literal words (e.g. "model building" vs. "foundation models").
- **Apply Assist** — drafts a personalized outreach message and answers to a lab's application questions, strictly grounded in the student's actual profile — it will not invent skills or experience they don't have. The student must explicitly submit; the agent has no path to send anything on its own.
- **PI dashboard** — applicant list with matched/missing skills per applicant, view/engagement stats, and a lab reliability score that decays when a PI leaves applicants without a response.
- **Live marketplace** — labs created or updated by a PI reflect immediately in the student marketplace and matching results; no manual refresh or reseed needed.

## Tech stack (Databricks-only, per the hackathon constraint)

| Layer | Databricks service |
|---|---|
| Data | Unity Catalog + Delta Lake (`insenio.campus_lab_match`) |
| Query | Databricks SQL Warehouse (`databricks-sql-connector`) |
| Conversational agents | Foundation Model APIs (`databricks-meta-llama-3-3-70b-instruct`) — intake chat + Apply Assist |
| Semantic search | Vector Search (Delta Sync index, `databricks-gte-large-en` embeddings) |
| NL-over-SQL | Genie Space (ad-hoc natural-language queries over lab data) |
| Backend | FastAPI (Python), JWT auth |

See [`docs/architecture.md`](docs/architecture.md) for the full system design.

## Project layout

```
backend/
  app/
    config.py, security.py, auth_deps.py, workspace_client.py
    db/            # DDL, seed data, per-table query modules, Vector Search setup
    genie/         # Genie Space client (NL-over-SQL)
    matching/       # transparent matching engine, semantic scoring, reliability decay
    agents/         # intake conversation agent, Apply Assist agent, LLM client
    models/         # Pydantic request/response schemas
    routers/        # auth, profile, intake, matches, labs, applications, pi_dashboard
  evals/           # guardrail eval suites (scope classifier, apply-assist grounding)
  tests/           # pytest wrapper around the evals
docs/
  DatabricksPRDTRD.pdf
  Genie_Campus_Lab_Match_Design_Doc.md
  architecture.md
```

## Setup

Requires Python 3.12 (3.13 currently lacks prebuilt wheels for some dependencies on Windows).

```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate      # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # fill in your Databricks workspace details
```

`.env` needs (see `.env.example`):
- `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, `DATABRICKS_HTTP_PATH` — workspace + SQL warehouse connection
- `DATABRICKS_CATALOG` / `DATABRICKS_SCHEMA` — defaults to `insenio.campus_lab_match`
- `GENIE_LAB_SPACE_ID` — a Genie Space configured over the `labs` / `lab_required_skills` tables
- `FOUNDATION_MODEL_ENDPOINT`, `EMBEDDING_MODEL_ENDPOINT` — Foundation Model API endpoints
- `VECTOR_SEARCH_ENDPOINT_NAME`, `VECTOR_SEARCH_INDEX_NAME` — Vector Search endpoint/index names
- `JWT_SECRET` — any random string

### Initialize the database and demo data

Run these **once**, the first time you set up the project — both are idempotent (safe to re-run, they check what already exists rather than failing or duplicating):

```bash
python -m app.db.init_db            # creates all tables
python -m app.db.init_vector_search # enables CDF, creates VS endpoint + Delta Sync index
```

Then seed demo data — **also just once**, since data persists in Delta Lake between sessions:

```bash
python -m app.db.seed_data          # 18 demo labs + 3 demo students (Ananya persona)
```

Seeded student accounts can log in through the real `/auth/login` flow with password `campus2026` (e.g. `ananya@campus.edu`).

`seed_data` is destructive — it wipes all current data before reseeding — so only re-run it when you want to reset to this pristine demo state (e.g. the dataset picked up test clutter from a previous demo/dev session). It is **not** part of the normal startup routine.

### Run the server

Day-to-day, this is the only command you need — data is already there from setup:

```bash
python -m uvicorn app.main:app --port 8000
```

Interactive API docs at `http://localhost:8000/docs`.

## Testing

```bash
cd backend
python -m evals.run_evals                       # guardrail eval report (prints + writes evals/results/latest.json)
python -m pytest tests/test_guardrail_evals.py -m live   # same, as pytest with pass-rate assertions
```

The eval suite covers:
- **Scope guardrail** (19 cases) — off-topic Q&A, prompt injection, jailbreak attempts, and on-topic controls (to catch over-refusal, not just under-refusal).
- **Apply Assist grounding** (4 cases) — probes for fabricated skills, projects, and certifications the student's profile doesn't contain, plus a positive control verifying real skills do get mentioned.

## Status

All backend/AI/DB milestones are complete and verified against a live Databricks workspace (not mocked): auth, conversational intake, transparent + semantic matching, lab marketplace, Apply Assist, applications, PI dashboard, reliability decay, and guardrail evals. A dedicated product frontend is the next phase, built separately from this repo's scope.
