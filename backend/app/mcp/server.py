"""GitPulse Model Context Protocol (MCP) Server.

Enables LLM agents (Claude Desktop, Cursor, Continue, etc.) to query engineering velocity,
diagnose PR bottlenecks, extract DORA metrics, and execute sanitized analytical queries
over GitPulse's DuckDB warehouse.
"""

from typing import Dict, Any, List, Optional
from mcp.server import MCPServer
from mcp.types import ToolAnnotations
from app.services.storage import get_storage
from app.services.ai_engine import ai_engine

mcp_server = MCPServer(
    name="gitpulse_mcp",
    title="GitPulse Engineering Analytics MCP Server",
    description="Live GitHub Developer Intelligence, DORA Metrics, PR Funnels, and Analytics Engine"
)

READONLY_ANNOTATIONS = ToolAnnotations(
    title="Read Only Analytics Tool",
    read_only_hint=True,
    destructive_hint=False,
    idempotent_hint=True,
    open_world_hint=False
)


@mcp_server.tool(
    name="gitpulse_get_developer_velocity",
    title="Get Developer Velocity & Journey",
    description="Retrieve detailed velocity score, commit volume, PR merge count, lines changed, and recent action timeline for an individual GitHub developer on a repository.",
    annotations=READONLY_ANNOTATIONS
)
def gitpulse_get_developer_velocity(
    repo: str = "vercel/next.js",
    username: str = "sokra"
) -> Dict[str, Any]:
    """Retrieves individual developer performance and activity journey.

    Args:
        repo: GitHub repository name in format 'owner/repo' (default: 'vercel/next.js')
        username: GitHub username/login (e.g. 'sokra', 'timneutkens')
    """
    try:
        storage = get_storage()
        journey = storage.get_contributor_journey(repo_name=repo, login=username)
        
        # If user has no events recorded, also provide top contributors to help the agent
        if not journey.get("events") and journey.get("total_commits", 0) == 0:
            top_devs = storage.get_contributor_leaderboard(repo_name=repo, days=30)
            suggested = [d["login"] for d in top_devs[:5]]
            return {
                "status": "not_found",
                "message": f"Developer '{username}' was not found in repository '{repo}'.",
                "suggested_developers": suggested,
                "repo": repo
            }

        return {
            "status": "success",
            "repo": repo,
            "developer": journey.get("login"),
            "avatar_url": journey.get("avatar_url"),
            "total_commits": journey.get("total_commits"),
            "prs_merged": journey.get("prs_merged"),
            "velocity_score": journey.get("velocity_score"),
            "recent_events_count": len(journey.get("events", [])),
            "recent_events": journey.get("events", [])[:10]
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "suggestion": "Periksa apakah nama repository atau format username valid."
        }


@mcp_server.tool(
    name="gitpulse_diagnose_pr_bottlenecks",
    title="Diagnose PR Funnel Bottlenecks",
    description="Analyzes the PR review and merge pipeline (Created -> Review Active -> Approved -> Merged) to pinpoint engineering drop-offs, bottleneck stages, and actionable optimization tips.",
    annotations=READONLY_ANNOTATIONS
)
def gitpulse_diagnose_pr_bottlenecks(
    repo: str = "vercel/next.js",
    days: int = 30
) -> Dict[str, Any]:
    """Analyzes PR funnel stages and diagnoses bottlenecks.

    Args:
        repo: GitHub repository name in format 'owner/repo' (default: 'vercel/next.js')
        days: Time window in days (default: 30, range: 1 to 90)
    """
    try:
        clamped_days = max(1, min(90, days))
        storage = get_storage()
        funnel = storage.get_pr_funnel(repo_name=repo, days=clamped_days)
        
        bottlenecks = [stage for stage in funnel if stage.get("is_bottleneck")]
        
        return {
            "status": "success",
            "repo": repo,
            "days_analyzed": clamped_days,
            "has_bottlenecks": len(bottlenecks) > 0,
            "bottleneck_stages": [b.get("stage_name") for b in bottlenecks],
            "diagnostic_tips": [b.get("diagnostic_tip") for b in bottlenecks if b.get("diagnostic_tip")],
            "funnel_stages": funnel
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "suggestion": "Pastikan repository sudah tersinkronisasi data PR-nya."
        }


@mcp_server.tool(
    name="gitpulse_get_dora_metrics",
    title="Get DORA & Engineering Metrics",
    description="Fetches core DORA and engineering metrics: Lead Time to Merge, Time to First Review (TTFR), PR merge rate, PR size distribution (small/medium/large), total commits, and active contributors.",
    annotations=READONLY_ANNOTATIONS
)
def gitpulse_get_dora_metrics(
    repo: str = "vercel/next.js",
    days: int = 14
) -> Dict[str, Any]:
    """Returns repository KPI & DORA speed indicators.

    Args:
        repo: GitHub repository name in format 'owner/repo' (default: 'vercel/next.js')
        days: Time window in days (default: 14, range: 1 to 90)
    """
    try:
        clamped_days = max(1, min(90, days))
        storage = get_storage()
        kpis = storage.get_kpi_summary(repo_name=repo, days=clamped_days)

        return {
            "status": "success",
            "repo": repo,
            "days": clamped_days,
            "dora_speed": {
                "lead_time_hours": kpis.get("lead_time_hours"),
                "lead_time_change_pct": kpis.get("lead_time_change_pct"),
                "time_to_first_review_hours": kpis.get("time_to_first_review_hours"),
                "ttfr_change_pct": kpis.get("ttfr_change_pct")
            },
            "pr_health": {
                "total_prs": kpis.get("total_prs"),
                "merged_prs": kpis.get("merged_prs"),
                "pr_merge_rate_pct": kpis.get("pr_merge_rate"),
                "pr_size_distribution": kpis.get("pr_size_distribution")
            },
            "volume": {
                "total_commits": kpis.get("total_commits"),
                "commits_change_pct": kpis.get("commits_change_pct"),
                "active_contributors": kpis.get("active_contributors"),
                "lines_added": kpis.get("lines_added_total"),
                "lines_deleted": kpis.get("lines_deleted_total")
            }
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "suggestion": "Pastikan repository sudah terdaftar dalam data warehouse GitPulse."
        }


@mcp_server.tool(
    name="gitpulse_query_analytics",
    title="Execute Read-Only Analytical SQL",
    description="Executes a safe, read-only SQL query on the 'github_events' DuckDB warehouse table. Validated via SQL AST sanitizer (only single SELECT allowed; DROP, DELETE, INSERT, UPDATE forbidden).",
    annotations=READONLY_ANNOTATIONS
)
def gitpulse_query_analytics(
    query: str,
    repo: str = "vercel/next.js"
) -> Dict[str, Any]:
    """Executes a sanitized read-only SQL query against DuckDB.

    Table schema for 'github_events':
    - time (TIMESTAMP): Event creation time
    - repo_name (VARCHAR): e.g. 'vercel/next.js'
    - event_type (VARCHAR): 'push', 'pull_request', 'issues', 'watch'
    - actor_login (VARCHAR): Developer GitHub username
    - commit_count (INT): Number of commits in push
    - pr_status (VARCHAR): 'in_review', 'approved', 'merged', 'closed'
    - lines_added (INT), lines_deleted (INT)
    - details (VARCHAR): JSON metadata

    Args:
        query: SQL SELECT query to execute
        repo: Repository context (default: 'vercel/next.js')
    """
    try:
        # Validate read-only SQL safety
        is_safe = ai_engine.validate_sql(query)
        if not is_safe:
            return {
                "status": "error",
                "error": "Query rejected by AST sanitizer. Hanya statement 'SELECT' tunggal yang diizinkan untuk keamanan data.",
                "suggestion": "Tulis query hanya menggunakan klausa SELECT ... FROM github_events WHERE repo_name = '...'"
            }

        # Apply limit safeguard if not present
        clean_query = query.strip().rstrip(";")
        if "limit" not in clean_query.lower():
            clean_query += " LIMIT 50"

        storage = get_storage()
        results = storage.execute_readonly_sql(clean_query)

        return {
            "status": "success",
            "query": clean_query,
            "row_count": len(results),
            "rows": results[:50]
        }
    except Exception as exc:
        return {
            "status": "error",
            "error": str(exc),
            "suggestion": "Periksa sintaks SQL DuckDB Anda (misal: 'SELECT actor_login, COUNT(*) as c FROM github_events GROUP BY actor_login ORDER BY c DESC LIMIT 10')."
        }


def run_mcp_server(transport: str = "stdio"):
    """Starts the GitPulse MCP Server on the given transport (stdio or streamable-http)."""
    mcp_server.run(transport=transport)


if __name__ == "__main__":
    run_mcp_server()
