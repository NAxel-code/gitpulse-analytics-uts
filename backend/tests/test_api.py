import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"
    assert r1.json()["service"] == "GitPulse Analytics"

    r2 = client.get("/api/v1/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"

def test_default_watchlist_endpoint():
    response = client.get("/api/v1/watchlist/default")
    assert response.status_code == 200
    data = response.json()
    assert "watchlist" in data
    assert "active" in data
    assert "vercel/next.js" in data["watchlist"]

def test_github_sync_endpoint():
    payload = {"repo_name": "tailwindlabs/tailwindcss", "days": 7}
    response = client.post("/api/v1/github/sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["synced_events"] >= 0
    assert "tailwindlabs/tailwindcss" in data["repo_name"]

def test_github_webhook_push():
    payload = {
        "repository": {"full_name": "test-org/test-repo"},
        "sender": {"login": "dev-user", "avatar_url": "https://avatar.test/1"},
        "commits": [{"id": "c1", "message": "feat: new feature"}]
    }
    headers = {"X-GitHub-Event": "push"}
    response = client.post("/api/v1/github/webhook", json=payload, headers=headers)
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "accepted"
    assert data["event_type"] == "push"
    assert data["repo"] == "test-org/test-repo"

def test_github_webhook_pull_request():
    payload = {
        "repository": {"full_name": "test-org/test-repo"},
        "sender": {"login": "reviewer", "avatar_url": "https://avatar.test/2"},
        "action": "closed",
        "pull_request": {"merged": True}
    }
    headers = {"X-GitHub-Event": "pull_request"}
    response = client.post("/api/v1/github/webhook", json=payload, headers=headers)
    assert response.status_code == 202
    assert response.json()["status"] == "accepted"

def test_github_overview_endpoint():
    response = client.get("/api/v1/github/overview?repo=vercel/next.js&days=14")
    assert response.status_code == 200
    data = response.json()
    assert "total_commits" in data
    assert "pr_merge_rate" in data
    assert "active_contributors" in data
    assert "lines_added_total" in data
    assert "lead_time_hours" in data
    assert "pr_size_distribution" in data

def test_github_timeline_endpoint():
    response = client.get("/api/v1/github/timeline?repo=vercel/next.js&days=14")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        point = data[0]
        assert "time_bucket" in point
        assert "commits" in point
        assert "pull_requests" in point
        assert "issues" in point

def test_github_pr_funnel_endpoint():
    response = client.get("/api/v1/github/pr-funnel?repo=vercel/next.js&days=30")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    stages = [s["stage_name"] for s in data]
    assert "1. PRs Created" in stages
    assert "4. Merged to Main" in stages
    assert "is_bottleneck" in data[0]

def test_github_contributors_endpoint():
    response = client.get("/api/v1/github/contributors?repo=vercel/next.js&days=30")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        dev = data[0]
        assert "login" in dev
        assert "commits" in dev
        assert "prs_merged" in dev
        assert "velocity_score" in dev
        assert "rank_badge" in dev
        assert "momentum_tag" in dev

def test_github_contributor_journey_endpoint():
    response = client.get("/api/v1/github/contributor-journey?repo=vercel/next.js&login=octocat")
    assert response.status_code == 200
    data = response.json()
    assert data["login"] == "octocat"
    assert "events" in data
    assert isinstance(data["events"], list)
    assert "velocity_score" in data

def test_github_anomalies_endpoint():
    response = client.get("/api/v1/github/anomalies?repo=vercel/next.js")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "metric" in data[0]
    assert "severity" in data[0]

def test_github_executive_summary_endpoint():
    response = client.get("/api/v1/github/executive-summary?repo=vercel/next.js")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "executive_summary" in data
    assert "key_takeaways" in data
    assert len(data["key_takeaways"]) > 0

def test_github_ai_insight_endpoint():
    payload = {"query": "Siapa kontributor paling aktif?", "repo_name": "vercel/next.js"}
    response = client.post("/api/v1/ai/insight", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "generated_sql" in data
    assert "summary" in data
    assert data["execution_time_ms"] >= 0

def test_github_ai_insight_username_lookup():
    payload = {"query": "Naxel-code", "repo_name": "vercel/next.js"}
    response = client.post("/api/v1/ai/insight", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Naxel-code" in data["summary"]
    assert data["chart_type"] in ["developer_profile", "not_found"]

def test_github_ai_insight_command_sync():
    payload = {"query": "sync", "repo_name": "vercel/next.js"}
    response = client.post("/api/v1/ai/insight", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["chart_type"] == "command_action"
    assert data["action"]["type"] == "sync"

