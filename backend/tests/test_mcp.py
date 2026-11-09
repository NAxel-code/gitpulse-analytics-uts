import pytest
from app.mcp.server import (
    mcp_server,
    gitpulse_get_developer_velocity,
    gitpulse_diagnose_pr_bottlenecks,
    gitpulse_get_dora_metrics,
    gitpulse_query_analytics
)

@pytest.mark.asyncio
async def test_mcp_server_tools_registered():
    tools = await mcp_server.list_tools()
    tool_names = [t.name for t in tools]
    assert "gitpulse_get_developer_velocity" in tool_names
    assert "gitpulse_diagnose_pr_bottlenecks" in tool_names
    assert "gitpulse_get_dora_metrics" in tool_names
    assert "gitpulse_query_analytics" in tool_names

def test_gitpulse_get_dora_metrics():
    res = gitpulse_get_dora_metrics(repo="vercel/next.js", days=14)
    assert res["status"] == "success"
    assert "dora_speed" in res
    assert "pr_health" in res
    assert "lead_time_hours" in res["dora_speed"]
    assert "time_to_first_review_hours" in res["dora_speed"]

def test_gitpulse_diagnose_pr_bottlenecks():
    res = gitpulse_diagnose_pr_bottlenecks(repo="vercel/next.js", days=30)
    assert res["status"] == "success"
    assert "funnel_stages" in res
    assert len(res["funnel_stages"]) == 4

def test_gitpulse_get_developer_velocity():
    res = gitpulse_get_developer_velocity(repo="vercel/next.js", username="sokra")
    assert res["status"] in ["success", "not_found"]
    if res["status"] == "success":
        assert "velocity_score" in res

def test_gitpulse_query_analytics_safe():
    res = gitpulse_query_analytics("SELECT repo_name, COUNT(*) as c FROM github_events GROUP BY repo_name")
    assert res["status"] == "success"
    assert "rows" in res

def test_gitpulse_query_analytics_rejects_unsafe():
    res = gitpulse_query_analytics("DROP TABLE github_events")
    assert res["status"] == "error"
    assert "rejected" in res["error"].lower() or "ast sanitizer" in res["error"].lower()
