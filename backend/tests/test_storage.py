import pytest
from datetime import datetime, timezone
from app.services.storage import get_storage

def test_duckdb_storage_initialization():
    storage = get_storage()
    assert storage.conn is not None
    # Verify table exists
    tables = [r[0] for r in storage.conn.execute("SHOW TABLES").fetchall()]
    assert "github_events" in tables

def test_storage_insert_and_query():
    storage = get_storage()
    test_events = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_id": "test_evt_1",
            "repo_name": "test-org/storage-test",
            "event_type": "push",
            "actor_login": "tester1",
            "actor_avatar": "https://avatar.test/1",
            "commit_count": 3,
            "pr_status": None,
            "issue_status": None,
            "lines_added": 50,
            "lines_deleted": 10,
            "details": {}
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_id": "test_evt_2",
            "repo_name": "test-org/storage-test",
            "event_type": "pull_request",
            "actor_login": "tester1",
            "actor_avatar": "https://avatar.test/1",
            "commit_count": 0,
            "pr_status": "merged",
            "issue_status": None,
            "lines_added": 120,
            "lines_deleted": 30,
            "details": {}
        }
    ]
    storage.insert_events(test_events)

    # Query overview
    kpi = storage.get_kpi_summary("test-org/storage-test", days=7)
    assert kpi["total_commits"] >= 3
    assert kpi["active_contributors"] >= 1
    assert kpi["merged_prs"] >= 1

    # Query leaderboard
    leaderboard = storage.get_contributor_leaderboard("test-org/storage-test", days=7)
    assert len(leaderboard) >= 1
    assert leaderboard[0]["login"] == "tester1"
    assert leaderboard[0]["commits"] >= 3

def test_storage_empty_repo_fallback():
    storage = get_storage()
    kpi = storage.get_kpi_summary("nonexistent/repo-xyz-123", days=7)
    assert "total_commits" in kpi
    assert "pr_merge_rate" in kpi
    assert "active_contributors" in kpi

def test_storage_readonly_sql_execution():
    storage = get_storage()
    result = storage.execute_readonly_sql("SELECT COUNT(*) as total FROM github_events")
    assert len(result) == 1
    assert "total" in result[0]
    assert result[0]["total"] >= 0
