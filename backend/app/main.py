from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.services.storage import get_storage
from app.services.postgres import postgres_service
from app.api.v1.github import router as github_router
from app.api.v1.ai import router as ai_router
from app.api.v1.bookmarks import router as bookmarks_router
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("gitpulse")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing GitPulse Developer Intelligence Engine...")
    storage = get_storage()
    # Initialize PostgreSQL schema
    postgres_service.init_db()
    # Seed initial repo if empty
    from app.services.github_syncer import github_syncer
    existing = storage.conn.execute("SELECT COUNT(*) FROM github_events").fetchone()[0]
    if existing == 0:
        logger.info("Database empty, auto-populating initial vercel/next.js data...")
        github_syncer.sync_repository("vercel/next.js", days=14)
        github_syncer.sync_repository("facebook/react", days=14)
    yield
    logger.info("Shutting down GitPulse Analytics Engine...")

app = FastAPI(
    title="GitPulse Analytics",
    version="1.0.0",
    description="High-Throughput GitHub Developer & Repository Intelligence API with Hybrid AI",
    lifespan=lifespan
)

cors_origins = ["*"] if settings.ENV == "development" else settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)
app.include_router(bookmarks_router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    pg_health = postgres_service.check_health()
    return {
        "status": "healthy",
        "service": "GitPulse Analytics",
        "version": "1.0.0",
        "database": {
            "postgres": pg_health,
            "duckdb": {"status": "ready", "engine": "embedded-columnar"}
        }
    }

@app.get("/api/v1/watchlist/default")
def default_watchlist():
    return {
        "watchlist": ["vercel/next.js", "facebook/react", "tailwindlabs/tailwindcss"],
        "active": "vercel/next.js"
    }

