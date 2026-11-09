// High-fidelity fallback generator for offline / static Vercel preview resilience
export function getFallbackDashboardData(repoName: string, days: number = 14) {
  const cleanRepo = repoName || "vercel/next.js";
  const owner = cleanRepo.includes("/") ? cleanRepo.split("/")[0] : "developer";
  const name = cleanRepo.includes("/") ? cleanRepo.split("/")[1] : cleanRepo;

  // Generate 14-day timeline
  const now = new Date();
  const timeline = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCommits = isWeekend ? 12 : 38;
    const variance = (i * 7) % 19;

    timeline.push({
      time_bucket: dateStr,
      commits: Math.max(4, baseCommits + variance),
      pull_requests: isWeekend ? 2 : Math.max(1, 5 + ((i * 3) % 6)),
      issues: Math.max(1, 2 + ((i * 2) % 4)),
      stars: Math.max(0, 1 + ((i * 5) % 5)),
    });
  }

  const kpis = {
    total_commits: 462,
    commits_change_pct: 14.8,
    active_contributors: 18,
    contributors_change_pct: 12.5,
    pr_merge_rate: 78.4,
    pr_rate_change_pct: 5.2,
    total_prs: 51,
    merged_prs: 40,
    open_issues: 12,
    issue_resolution_rate: 75.0,
    total_stars: 320,
    stars_change_pct: 18.2,
    lines_added_total: 48920,
    lines_deleted_total: 14210,
    lead_time_hours: 14.8,
    lead_time_change_pct: -16.4,
    time_to_first_review_hours: 3.2,
    ttfr_change_pct: -22.5,
    pr_size_distribution: { small: 28, medium: 17, large: 6 },
  };

  const funnel = [
    {
      stage_name: "1. PRs Created",
      count: 51,
      conversion_from_previous_pct: 100.0,
      drop_off_pct: 0.0,
      is_bottleneck: false,
      diagnostic_tip: null,
    },
    {
      stage_name: "2. Code Review Active",
      count: 44,
      conversion_from_previous_pct: 86.3,
      drop_off_pct: 13.7,
      is_bottleneck: false,
      diagnostic_tip: null,
    },
    {
      stage_name: "3. Changes Approved",
      count: 41,
      conversion_from_previous_pct: 93.2,
      drop_off_pct: 6.8,
      is_bottleneck: false,
      diagnostic_tip: null,
    },
    {
      stage_name: "4. Merged to Main",
      count: 40,
      conversion_from_previous_pct: 97.6,
      drop_off_pct: 2.4,
      is_bottleneck: false,
      diagnostic_tip: null,
    },
  ];

  const contributors = [
    {
      login: owner,
      avatar_url: `https://github.com/${owner}.png`,
      commits: 184,
      prs_opened: 16,
      prs_merged: 15,
      issues_closed: 8,
      lines_added: 18420,
      lines_deleted: 4100,
      velocity_score: 720,
      rank: 1,
      rank_badge: "gold",
      momentum_tag: "🔥 High Velocity",
    },
    {
      login: "alexdev",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      commits: 92,
      prs_opened: 11,
      prs_merged: 10,
      issues_closed: 6,
      lines_added: 9140,
      lines_deleted: 2310,
      velocity_score: 410,
      rank: 2,
      rank_badge: "silver",
      momentum_tag: "🔥 High Velocity",
    },
    {
      login: "sarah-codes",
      avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
      commits: 64,
      prs_opened: 8,
      prs_merged: 7,
      issues_closed: 4,
      lines_added: 6200,
      lines_deleted: 1800,
      velocity_score: 295,
      rank: 3,
      rank_badge: "bronze",
      momentum_tag: "⚡ Surging",
    },
    {
      login: "kenji-oss",
      avatar_url: "https://avatars.githubusercontent.com/u/2048030?v=4",
      commits: 48,
      prs_opened: 5,
      prs_merged: 4,
      issues_closed: 2,
      lines_added: 4150,
      lines_deleted: 950,
      velocity_score: 210,
      rank: 4,
      rank_badge: "standard",
      momentum_tag: "⚡ Surging",
    },
    {
      login: "elena_eng",
      avatar_url: "https://avatars.githubusercontent.com/u/3072040?v=4",
      commits: 34,
      prs_opened: 4,
      prs_merged: 3,
      issues_closed: 3,
      lines_added: 3200,
      lines_deleted: 750,
      velocity_score: 165,
      rank: 5,
      rank_badge: "standard",
      momentum_tag: "📈 Steady",
    },
  ];

  const anomalies = [
    {
      metric: "PR Review Latency",
      severity: "low",
      message: `Merge velocity for ${name} is stable at an average of 14.8 hours with 78.4% PR completion rate without bottlenecks.`,
      detected_at: "Today at 08:30 AM",
      recommended_action: "Maintain current daily code review cadence.",
    },
  ];

  const executiveSummary = {
    status: "success",
    generated_at: "Today at 09:00 AM",
    executive_summary: `Over the past 14 days on repository ${cleanRepo}, the engineering team recorded 462 commits with a PR Merge Rate of 78.4% (40 PRs successfully merged). Top contributor is '@${owner}'. Lead Time to Merge aligns with DORA High Performer benchmarks.`,
    key_takeaways: [
      `PR Merge Velocity is stable at 78.4%`,
      `Total code volume: +48,920 lines added, -14,210 lines removed`,
      `Lead contributor: @${owner}`,
      "Lead Time to Merge aligns with DORA High Performer benchmarks",
    ],
  };

  return {
    kpis,
    timeline,
    funnel,
    contributors,
    anomalies,
    executiveSummary,
  };
}
