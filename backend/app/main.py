from fastapi import FastAPI

from app.db.client import execute
from app.routers import applications, auth, intake, labs, matches, pi_dashboard, profile

app = FastAPI(title="Insenio — Genie Campus Lab Match")

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
