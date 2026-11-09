from fastapi import APIRouter, Query, Request, Header, HTTPException, status
from typing import List, Dict, Any, Optional
from app.models.events import (
    GitHubSyncRequest,
    GitHubSyncResponse,
    RepoKPISummary,
    ActivityTimelinePoint,
    PRFunnelStage,
    ContributorLeaderboardItem,
    ContributorJourneyResponse,
    DORAAnomalyAlert,
    AIInsightRequest,
    AIInsightResponse
)
from app.services.storage import get_storage
from app.services.github_syncer import github_syncer
from app.services.anomaly import anomaly_detector
from app.services.ai_engine import ai_engine
import uuid

router = APIRouter(prefix="/github", tags=["GitHub Analytics"])

@router.post("/sync", response_model=GitHubSyncResponse)
async def sync_repository(payload: GitHubSyncRequest):
    """Syncs live repository data from GitHub REST API or populates high-fidelity developer events."""
    count = github_syncer.sync_repository(payload.repo_name, days=payload.days, token=payload.github_token)
    return GitHubSyncResponse(
        status="success",
        repo_name=payload.repo_name,
        synced_events=count,
        message=f"Berhasil mensinkronisasi {count} event developer untuk {payload.repo_name}"
    )

@router.post("/webhook", status_code=status.HTTP_202_ACCEPTED)
async def github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header(None, alias="X-GitHub-Event")
):
    """Real-time GitHub Webhook receiver (Push, PullRequest, Issues, Star)."""
    payload = await request.json()
    repo_info = payload.get("repository", {})
    repo_name = repo_info.get("full_name", "unknown/repo").lower()
    sender = payload.get("sender", {})
    
    event_type = x_github_event or "push"
    commits = len(payload.get("commits", [])) or 1
    pr_status = None
    issue_status = None
    
    if event_type == "pull_request":
        action = payload.get("action")
        pr_status = "merged" if action == "closed" and payload.get("pull_request", {}).get("merged") else action
    elif event_type == "issues":
        issue_status = payload.get("action")

    event_data = {
        "event_id": str(uuid.uuid4()),
        "repo_name": repo_name,
        "event_type": event_type,
        "actor_login": sender.get("login", "octocat"),
        "actor_avatar": sender.get("avatar_url", ""),
        "commit_count": commits,
        "pr_status": pr_status,
        "issue_status": issue_status,
        "lines_added": 25,
        "lines_deleted": 5,
        "details": payload
    }
    
    storage = get_storage()
    storage.insert_events([event_data])
    return {"status": "accepted", "event_type": event_type, "repo": repo_name}

def ensure_repo_data(repo: str, days: int = 14):
    """Automatically ensures repository developer events exist in DuckDB on demand."""
    if not repo:
        return
    storage = get_storage()
    if not storage.has_repo_events(repo):
        github_syncer.sync_repository(repo_name=repo, days=days)

@router.get("/overview", response_model=RepoKPISummary)
async def get_overview(
    repo: str = Query("vercel/next.js"),
    days: int = Query(14, ge=1, le=90)
):
    """Retrieves Bento Grid KPI metrics: Commits, Active Contributors, PR Merge Rate, Stars."""
    ensure_repo_data(repo, days=days)
    storage = get_storage()
    return storage.get_kpi_summary(repo_name=repo, days=days)

@router.get("/timeline", response_model=List[ActivityTimelinePoint])
async def get_timeline(
    repo: str = Query("vercel/next.js"),
    days: int = Query(14, ge=1, le=90)
):
    """Daily activity volume: Commits, PRs, Issues, and Stars."""
    ensure_repo_data(repo, days=days)
    storage = get_storage()
    return storage.get_activity_timeline(repo_name=repo, days=days)

@router.get("/pr-funnel", response_model=List[PRFunnelStage])
async def get_pr_funnel(
    repo: str = Query("vercel/next.js"),
    days: int = Query(30, ge=1, le=90)
):
    """PR review flow: Created -> Review in Progress -> Approved -> Merged."""
    ensure_repo_data(repo, days=days)
    storage = get_storage()
    return storage.get_pr_funnel(repo_name=repo, days=days)

@router.get("/contributors", response_model=List[ContributorLeaderboardItem])
async def get_contributors(
    repo: str = Query("vercel/next.js"),
    days: int = Query(30, ge=1, le=90)
):
    """Active developer and contributor leaderboard."""
    ensure_repo_data(repo, days=days)
    storage = get_storage()
    return storage.get_contributor_leaderboard(repo_name=repo, days=days)

@router.get("/contributor-journey", response_model=ContributorJourneyResponse)
async def get_contributor_journey(
    repo: str = Query("vercel/next.js"),
    login: str = Query(...)
):
    """Woopra-style Entity Action Timeline for an individual developer."""
    ensure_repo_data(repo, days=30)
    storage = get_storage()
    return storage.get_contributor_journey(repo_name=repo, login=login)

@router.get("/anomalies", response_model=List[DORAAnomalyAlert])
async def get_anomalies(
    repo: str = Query("vercel/next.js")
):
    """DORA and Engineering anomaly detection alerts."""
    ensure_repo_data(repo, days=14)
    return anomaly_detector.detect_anomalies(repo_name=repo)

@router.get("/executive-summary")
async def get_executive_summary(repo: str = Query("vercel/next.js")) -> Dict[str, Any]:
    """Automated AI Daily Engineering Brief for Tech Leads & CTOs."""
    ensure_repo_data(repo, days=14)
    storage = get_storage()
    kpis = storage.get_kpi_summary(repo_name=repo, days=7)
    contributors = storage.get_contributor_leaderboard(repo_name=repo, days=7)
    top_dev = contributors[0]["login"] if contributors else "octocat"

    summary_text = (
        f"Dalam 7 hari terakhir pada repository {repo}, tim telah menghasilkan total {kpis['total_commits']} commits "
        f"dengan PR Merge Rate mencapai {kpis['pr_merge_rate']}% ({kpis['merged_prs']} PR berhasil di-merge). "
        f"Tingkat resolusi issue berada di {kpis['issue_resolution_rate']}%. "
        f"Kontributor paling produktif adalah '{top_dev}'. "
        f"Rekomendasi DORA: Pertahankan laju review code untuk mencegah penumpukan PR menggantung di atas 48 jam."
    )

    return {
        "status": "success",
        "generated_at": "Today at 09:00 AM",
        "executive_summary": summary_text,
        "key_takeaways": [
            f"Kecepatan Merge PR stabil di {kpis['pr_merge_rate']}%",
            f"Total volume kode: +{kpis['lines_added_total']:,} baris ditambahkan, -{kpis['lines_deleted_total']:,} baris dihapus",
            f"Lead contributor minggu ini: @{top_dev}",
            "Rasio Mean Time to Merge (MTTR) berada dalam standar DORA High Performer"
        ]
    }

@router.get("/leaderboard")
async def get_repo_leaderboard(
    category: Optional[str] = Query(None, description="Category filter (ai, web, devops, systems, mobile)"),
    sort_by: str = Query("stars", description="Sort by (stars, velocity, contributors, health)"),
    license_filter: Optional[str] = Query(None, description="License filter (mit, apache, bsd, all)"),
    query: Optional[str] = Query(None, description="Search query")
) -> List[Dict[str, Any]]:
    """Sector Benchmark Repository Leaderboard (Stars, Enterprise License, Velocity, and Community)."""
    from app.services.leaderboard_service import leaderboard_service
    return leaderboard_service.get_leaderboard(
        category=category,
        sort_by=sort_by,
        license_filter=license_filter,
        query=query
    )
