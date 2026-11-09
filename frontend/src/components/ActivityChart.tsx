"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw } from "lucide-react";

interface ActivityPoint {
  time_bucket: string;
  commits: number;
  pull_requests: number;
  issues: number;
  stars: number;
}

export function ActivityChart({
  data,
  repoName,
  onSync,
  isSyncing = false,
}: {
  data: ActivityPoint[];
  repoName: string;
  onSync?: () => void;
  isSyncing?: boolean;
}) {
  const [metric, setMetric] = useState<"code" | "community">("code");

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: d.time_bucket.slice(5),
  }));

  const computedMax = Math.max(
    ...(formattedData.length > 0
      ? formattedData.map((d) =>
          metric === "code"
            ? Math.max(d.commits || 0, d.pull_requests || 0)
            : Math.max(d.issues || 0, d.stars || 0)
        )
      : [0]),
    5
  );

  const isAllZero =
    formattedData.length > 0 &&
    formattedData.every((d) =>
      metric === "code"
        ? d.commits === 0 && d.pull_requests === 0
        : d.issues === 0 && d.stars === 0
    );

  return (
    <div className="border border-white/[0.08] bg-[#0c0c0e] p-6 h-full flex flex-col justify-between">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
            CHRONOLOGY
          </span>
          <h3 className="font-semibold text-white text-base mt-0.5 tracking-tight">
            Activity &amp; Commit Velocity
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Daily timeline for <span className="text-zinc-300 font-medium">{repoName}</span>
          </p>
        </div>

        {/* View Switcher (Text Links, Awwwards Style) */}
        <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setMetric("code")}
            className={`transition cursor-pointer pb-0.5 relative ${
              metric === "code"
                ? "text-white font-bold border-b border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Commits &amp; PRs
          </button>
          <span className="text-zinc-700">/</span>
          <button
            onClick={() => setMetric("community")}
            className={`transition cursor-pointer pb-0.5 relative ${
              metric === "community"
                ? "text-white font-bold border-b border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Issues &amp; Stars
          </button>
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 text-xs font-mono text-zinc-500">
          <p>No activity history recorded for this repository.</p>
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="mt-3 inline-flex items-center gap-1.5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/30 transition cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync from GitHub"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="h-[280px] w-full relative">
          {isAllZero && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0c0e]/90 text-center z-10 text-xs font-mono text-zinc-400">
              <p>No {metric === "code" ? "commits or pull requests" : "issues or stars"} in this timeframe.</p>
              {onSync && (
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="mt-3 border border-white/20 px-3.5 py-1.5 text-xs text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Sync Live Data
                </button>
              )}
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="areaGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#a1a1aa" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#52525b"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
              />
              <YAxis
                stroke="#52525b"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                tickLine={false}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
                allowDecimals={false}
                domain={[0, Math.ceil(computedMax * 1.15)]}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#080808",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "0px",
                  color: "#f4f4f5",
                  fontSize: "11px",
                  fontFamily: "ui-monospace, monospace",
                }}
              />
              {metric === "code" && (
                <Area
                  type="monotone"
                  dataKey="commits"
                  name="Commits"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#areaGradientPrimary)"
                  isAnimationActive={false}
                />
              )}
              {metric === "code" && (
                <Area
                  type="monotone"
                  dataKey="pull_requests"
                  name="Pull Requests"
                  stroke="#a1a1aa"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#areaGradientSecondary)"
                  isAnimationActive={false}
                />
              )}
              {metric === "community" && (
                <Area
                  type="monotone"
                  dataKey="issues"
                  name="Issues"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#areaGradientPrimary)"
                  isAnimationActive={false}
                />
              )}
              {metric === "community" && (
                <Area
                  type="monotone"
                  dataKey="stars"
                  name="New Stars"
                  stroke="#a1a1aa"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#areaGradientSecondary)"
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
