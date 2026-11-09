from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List
from datetime import datetime, timezone
import uuid

class GitHubEventPayload(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    repo_name: str = Field(default="vercel/next.js")
    event_type: str = Field(..., description="push, pull_request, issues, watch, fork")
    actor_login: str = Field(default="octocat")
    actor_avatar: str = Field(default="https://avatars.githubusercontent.com/u/583231?v=4")
    commit_count: int = Field(default=1)
    pr_status: Optional[str] = Field(default=None, description="opened, in_review, approved, merged, closed")
    issue_status: Optional[str] = Field(default=None, description="opened, closed")
    lines_added: int = Field(default=0)
    lines_deleted: int = Field(default=0)
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class GitHubSyncRequest(BaseModel):
    repo_name: str = "vercel/next.js"
    days: int = 14
    github_token: Optional[str] = None

class GitHubSyncResponse(BaseModel):
    status: str = "success"
    repo_name: str
    synced_events: int
    message: str

class RepoKPISummary(BaseModel):
    total_commits: int
    commits_change_pct: float
    active_contributors: int
    contributors_change_pct: float
    pr_merge_rate: float
    pr_rate_change_pct: float
    total_prs: int
    merged_prs: int
    open_issues: int
    issue_resolution_rate: float
    total_stars: int
    stars_change_pct: float
    lines_added_total: int
    lines_deleted_total: int
    # Actionable DORA & Velocity metrics
    lead_time_hours: float = 16.5
    lead_time_change_pct: float = -12.4
    time_to_first_review_hours: float = 3.6
    ttfr_change_pct: float = -18.2
    pr_size_distribution: Dict[str, int] = Field(default_factory=lambda: {"small": 22, "medium": 14, "large": 6})

class ActivityTimelinePoint(BaseModel):
    time_bucket: str
    commits: int
    pull_requests: int
    issues: int
    stars: int

class PRFunnelStage(BaseModel):
    stage_name: str
    count: int
    conversion_from_previous_pct: float
    drop_off_pct: float
    # Shopify-style diagnostic
    is_bottleneck: bool = False
    diagnostic_tip: Optional[str] = None

class ContributorLeaderboardItem(BaseModel):
    login: str
    avatar_url: str
    commits: int
    prs_opened: int
    prs_merged: int
    issues_closed: int
    lines_added: int
    lines_deleted: int
    velocity_score: int
    # Kalodata-style momentum & ranking
    rank: int = 1
    rank_badge: str = "standard"  # gold | silver | bronze | standard
    momentum_tag: str = "📈 Steady"

class ContributorJourneyEvent(BaseModel):
    timestamp: str
    event_type: str  # push | pull_request | issues
    title: str
    lines_added: int = 0
    lines_deleted: int = 0
    badge: str = "commit"

class ContributorJourneyResponse(BaseModel):
    login: str
    avatar_url: str
    repo_name: str
    total_commits: int
    prs_merged: int
    velocity_score: int
    rank: int
    events: List[ContributorJourneyEvent]

class DORAAnomalyAlert(BaseModel):
    id: str
    timestamp: str
    metric: str
    anomaly_type: str  # 'spike' | 'drop' | 'warning'
    severity: str      # 'info' | 'warning' | 'critical'
    description: str
    z_score: float

class AIInsightRequest(BaseModel):
    query: str
    repo_name: str = "vercel/next.js"

class AIInsightResponse(BaseModel):
    query: str
    generated_sql: str
    summary: str
    chart_type: Optional[str] = "bar"
    chart_data: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = 0.95
    execution_time_ms: int = 10
    action: Optional[Dict[str, Any]] = None
