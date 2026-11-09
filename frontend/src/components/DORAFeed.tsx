"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { ContributorItem, isBotAccount } from "./ContributorTable";

interface DORAAlert {
  id: string;
  timestamp: string;
  metric: string;
  anomaly_type: string;
  severity: string;
  description: string;
  z_score: number;
}

interface ExecutiveSummaryData {
  status: string;
  generated_at: string;
  executive_summary: string;
  key_takeaways: string[];
}

export function DORAFeed({
  alerts,
  summary,
  contributors = [],
  onOpenExport,
}: {
  alerts: DORAAlert[];
  summary: ExecutiveSummaryData | null;
  contributors?: ContributorItem[];
  onOpenExport?: () => void;
}) {
  const humanContribs = (contributors || []).filter((c) => !isBotAccount(c.login));
  const totalCommits = humanContribs.reduce((acc, c) => acc + (c.commits || 0), 0);
  const sorted = [...humanContribs].sort((a, b) => (b.commits || 0) - (a.commits || 0));

  let cumulative = 0;
  let busFactor = 0;
  const topContributors: { login: string; pct: number }[] = [];

  for (const c of sorted) {
    busFactor++;
    cumulative += c.commits || 0;
    const pct = totalCommits > 0 ? Math.round((c.commits / totalCommits) * 100) : 0;
    topContributors.push({ login: c.login, pct });
    if (cumulative >= totalCommits * 0.65 || busFactor >= 4) break;
  }

  const busFactorDisplay = Math.max(
    1,
    busFactor || (humanContribs.length > 0 ? 1 : 0)
  );
  const top1Pct = topContributors[0]?.pct || 0;
  const top2Pct =
    (topContributors[0]?.pct || 0) + (topContributors[1]?.pct || 0);

  const isHighRisk = busFactorDisplay === 1 || top1Pct >= 60;
  const isModerateRisk = busFactorDisplay === 2 || top2Pct >= 70;

  return (
    <div className="flex flex-col gap-6">
      {/* Team Resilience & Bus Factor Index */}
      <div className="border border-white/[0.08] bg-[#0c0c0e] p-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            RESILIENCE AUDIT
          </span>
          <span className="text-xs font-mono text-zinc-400">
            {isHighRisk ? "CONCENTRATED RISK" : isModerateRisk ? "MODERATE" : "DISTRIBUTED"}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-3xl font-bold font-sans tracking-tight text-white display-num">
              {busFactorDisplay}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-1">
              Minimum Maintainer Bus Factor
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-zinc-400">
            Top {topContributors.length} maintainers author{" "}
            <span className="text-white font-bold">
              {topContributors.reduce((s, c) => s + c.pct, 0)}%
            </span>{" "}
            of code
          </div>
        </div>

        {/* Minimal Hairline Stack */}
        <div className="h-1.5 w-full bg-white/[0.05] overflow-hidden flex my-3">
          {topContributors.map((c, i) => (
            <div
              key={i}
              style={{ width: `${c.pct}%` }}
              className={`h-full ${i === 0 ? "bg-white" : i === 1 ? "bg-zinc-400" : "bg-zinc-600"}`}
              title={`@${c.login}: ${c.pct}%`}
            />
          ))}
        </div>

        <p className="text-[11px] text-zinc-500 font-mono leading-relaxed pt-2">
          {isHighRisk
            ? "Primary velocity anchored to 1 contributor. Recommend wider code review delegation."
            : "Commit throughput distributed across core team members."}
        </p>
      </div>

      {/* Daily Executive Brief */}
      {summary && (
        <div className="border border-white/[0.08] bg-[#0c0c0e] p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              EXECUTIVE BRIEF
            </span>
            <div className="flex items-center gap-2">
              {onOpenExport && (
                <button
                  onClick={onOpenExport}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <Share2 className="h-3 w-3" />
                  <span>Export</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-zinc-600">
                {summary.generated_at}
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-zinc-300 font-sans mb-4">
            {summary.executive_summary}
          </p>

          <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs font-mono">
            {summary.key_takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-400">
                <span className="text-zinc-600 font-bold">•</span>
                <span className="leading-snug text-zinc-300">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Velocity Alerts */}
      <div className="border border-white/[0.08] bg-[#0c0c0e] p-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            SYSTEM ALERTS
          </span>
          <span className="text-[11px] font-mono text-zinc-600">
            {alerts.length} EVENTS
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((item) => (
            <div
              key={item.id}
              className="border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0 text-xs font-mono"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">
                  {item.metric}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {item.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
