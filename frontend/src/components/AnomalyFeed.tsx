"use client";

import { AlertTriangle, TrendingDown, Zap, Sparkles, CheckCircle2 } from "lucide-react";

interface AnomalyItem {
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

export function AnomalyFeed({
  anomalies,
  summary,
}: {
  anomalies: AnomalyItem[];
  summary: ExecutiveSummaryData | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* AI Daily Executive Summary Card */}
      {summary && (
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">
                AI Daily Executive Summary
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/60">
              {summary.generated_at}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-300 mb-3">
            {summary.executive_summary}
          </p>

          <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
              Strategic Takeaways
            </span>
            {summary.key_takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automated Anomaly Alert Feed */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">
              Live Anomaly Alerts
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Z-score &gt; ±2.0</span>
        </div>

        <div className="space-y-3">
          {anomalies.map((item) => {
            const isSpike = item.anomaly_type === "spike";
            const isCritical = item.severity === "critical" || item.severity === "warning";

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition ${
                  isCritical
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isSpike ? (
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    )}
                    <span className="font-semibold text-xs text-white">{item.metric}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      item.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : item.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-snug">{item.description}</p>

                <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 font-mono">
                  <span>{item.timestamp}</span>
                  <span>Z-score: {item.z_score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
