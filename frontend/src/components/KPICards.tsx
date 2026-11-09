"use client";

import {
  Users,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Layers,
} from "lucide-react";
import { NumberTicker } from "./magicui/number-ticker";

interface RepoKPIData {
  total_commits: number;
  commits_change_pct: number;
  active_contributors: number;
  contributors_change_pct: number;
  pr_merge_rate: number;
  pr_rate_change_pct: number;
  total_prs: number;
  merged_prs: number;
  open_issues: number;
  issue_resolution_rate: number;
  total_stars: number;
  stars_change_pct: number;
  lines_added_total: number;
  lines_deleted_total: number;
  lead_time_hours?: number;
  lead_time_change_pct?: number;
  time_to_first_review_hours?: number;
  ttfr_change_pct?: number;
  pr_size_distribution?: { small: number; medium: number; large: number };
}

export function KPICards({ data }: { data: RepoKPIData | null }) {
  if (!data) {
    return (
      <div className="border border-white/10 bg-[#0d0d0f] p-8 animate-pulse mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/[0.03] rounded" />
          ))}
        </div>
      </div>
    );
  }

  const scrollToSection = (targetId: string) => {
    if (typeof window === "undefined") return;
    const element = document.getElementById(targetId);
    if (!element) return;

    const navHeight = 96;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = Math.max(0, elementPosition - navHeight);

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    element.classList.remove("ring-1", "ring-white/40");
    void element.offsetWidth;
    element.classList.add("ring-1", "ring-white/40");

    setTimeout(() => {
      element.classList.remove("ring-1", "ring-white/40");
    }, 1500);
  };

  const kpis = [
    {
      title: "Active Contributors",
      targetId: "tour-contributors",
      targetName: "Contributor Velocity Table",
      value: data.active_contributors,
      suffix: "",
      delta: data.contributors_change_pct,
      icon: Users,
      meta: `${data.total_stars.toLocaleString()} Stars`,
      code: "AUTHORS",
    },
    {
      title: "Total Commits",
      targetId: "section-activity",
      targetName: "Commit & Activity Timeline",
      value: data.total_commits,
      suffix: "",
      delta: data.commits_change_pct,
      icon: GitCommit,
      meta: `+${(data.lines_added_total / 1000).toFixed(1)}k / -${(data.lines_deleted_total / 1000).toFixed(1)}k LoC`,
      code: "VOLUME",
    },
    {
      title: "PR Merge Velocity",
      targetId: "tour-pr-funnel",
      targetName: "PR Lifecycle Funnel",
      value: data.pr_merge_rate,
      decimalPlaces: 1,
      suffix: "%",
      delta: data.pr_rate_change_pct,
      icon: GitPullRequest,
      meta: `${data.merged_prs} of ${data.total_prs} Merged`,
      code: "THROUGHPUT",
    },
    {
      title: "Issue Resolution",
      targetId: "section-dora-feed",
      targetName: "DORA & Engineering Feed",
      value: data.issue_resolution_rate,
      decimalPlaces: 1,
      suffix: "%",
      delta: 6.8,
      icon: CheckCircle2,
      meta: `${data.open_issues} Open Issues`,
      code: "RESOLUTION",
    },
  ];

  const hasPRs = (data.total_prs || 0) > 0;
  const leadTime = hasPRs ? data.lead_time_hours || 0 : 0;
  const leadTimeDelta = data.lead_time_change_pct || 0;
  const ttfr = hasPRs ? data.time_to_first_review_hours || 0 : 0;
  const ttfrDelta = data.ttfr_change_pct || 0;
  const prDist = data.pr_size_distribution || { small: 0, medium: 0, large: 0 };
  const actualTotalDist = prDist.small + prDist.medium + prDist.large;
  const totalDist = actualTotalDist || 1;

  return (
    <div className="mb-8 border border-white/[0.08] bg-[#0c0c0e]">
      {/* Primary KPI Row — Monolithic Swiss Architectural Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        {kpis.map((kpi, idx) => {
          const isPositive = kpi.delta >= 0;

          return (
            <div
              key={idx}
              onClick={() => scrollToSection(kpi.targetId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToSection(kpi.targetId);
                }
              }}
              tabIndex={0}
              role="button"
              title={`Inspect ${kpi.targetName}`}
              className="group p-6 cursor-pointer hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:bg-white/[0.03]"
            >
              {/* Corner Metadata Line */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-3">
                <span className="uppercase tracking-wider font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {kpi.code}
                </span>
                <div
                  className={`flex items-center gap-0.5 font-semibold ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{isPositive ? `+${kpi.delta}%` : `${kpi.delta}%`}</span>
                </div>
              </div>

              {/* Massive Display Numeral (Awwwards Style) */}
              <div className="flex items-baseline gap-1 my-2">
                <NumberTicker
                  value={kpi.value}
                  decimalPlaces={kpi.decimalPlaces || 0}
                  className="text-4xl md:text-5xl font-bold tracking-tight text-white display-num tabular-nums"
                />
                {kpi.suffix && (
                  <span className="text-2xl font-light text-zinc-400 font-mono">
                    {kpi.suffix}
                  </span>
                )}
              </div>

              {/* Title & Context */}
              <div className="mt-3">
                <div className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {kpi.title}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                  {kpi.meta}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-Ribbon: DORA Latency & PR Size Hygiene */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border-t border-white/[0.08] bg-black/20 text-xs font-mono">
        {/* Lead Time */}
        <div
          onClick={() => scrollToSection("tour-pr-funnel")}
          className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Lead Time to Merge
            </span>
            <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
              {hasPRs ? `${leadTime.toFixed(1)} hrs` : "—"}
            </span>
          </div>
          <div
            className={`text-[10px] font-semibold text-right ${
              hasPRs
                ? leadTimeDelta <= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
                : "text-zinc-600"
            }`}
          >
            {hasPRs
              ? leadTimeDelta <= 0
                ? `▼ ${Math.abs(leadTimeDelta)}% faster`
                : `▲ ${leadTimeDelta}% slower`
              : "No PR records"}
          </div>
        </div>

        {/* TTFR */}
        <div
          onClick={() => scrollToSection("tour-pr-funnel")}
          className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Time to First Review
            </span>
            <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
              {hasPRs ? `${ttfr.toFixed(1)} hrs` : "—"}
            </span>
          </div>
          <div
            className={`text-[10px] font-semibold text-right ${
              hasPRs
                ? ttfrDelta <= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
                : "text-zinc-600"
            }`}
          >
            {hasPRs
              ? ttfrDelta <= 0
                ? `▼ ${Math.abs(ttfrDelta)}% faster`
                : `▲ ${ttfrDelta}% slower`
              : "No PR records"}
          </div>
        </div>

        {/* PR Size Distribution */}
        <div
          onClick={() => scrollToSection("section-dora-feed")}
          className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
        >
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              PR Hygiene Ratio
            </span>
            <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">
              {actualTotalDist > 0
                ? `${Math.round((prDist.small / totalDist) * 100)}% Small (<200 LoC)`
                : "0 PRs"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
            <span className="text-zinc-300">S:{prDist.small}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">M:{prDist.medium}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500">L:{prDist.large}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
