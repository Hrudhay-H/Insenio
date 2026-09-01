from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.client import execute
from app.routers import applications, auth, intake, labs, matches, pi_dashboard, profile

app = FastAPI(title="Insenio — Genie Campus Lab Match")

# Vite dev server origins — the frontend runs on a different port than this
# API, so the browser enforces CORS on every fetch() call between them.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(intake.router)
app.include_router(matches.router)
app.include_router(labs.router)
app.include_router(applications.router)
app.include_router(pi_dashboard.router)


@app.get("/health")
def health():
    result = execute("SELECT 1 AS ok")
    return {"status": "ok", "warehouse_reachable": result == [{"ok": 1}]}
