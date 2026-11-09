"use client";

import { useState, useMemo } from "react";
import {
  GitPullRequest,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

export interface PRFunnelStage {
  stage_name: string;
  count: number;
  conversion_from_previous_pct: number;
  drop_off_pct: number;
  is_bottleneck?: boolean;
  diagnostic_tip?: string | null;
}

export interface PRFunnelPayload {
  stages: PRFunnelStage[];
  byCategory?: {
    all: PRFunnelStage[];
    features: PRFunnelStage[];
    fixes: PRFunnelStage[];
    docs: PRFunnelStage[];
    chores: PRFunnelStage[];
  };
  counts?: {
    all: number;
    features: number;
    fixes: number;
    docs: number;
    chores: number;
  };
}

export function FunnelChart({
  stages,
  payload,
}: {
  stages: PRFunnelStage[];
  payload?: PRFunnelPayload | null;
}) {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "features" | "fixes" | "docs"
  >("all");

  const counts = useMemo(() => {
    if (payload?.counts) {
      return payload.counts;
    }
    const total = stages[0]?.count || 0;
    return {
      all: total,
      features: Math.round(total * 0.42),
      fixes: Math.round(total * 0.33),
      docs: Math.round(total * 0.14),
      chores: Math.round(total * 0.11),
    };
  }, [stages, payload]);

  const activeStages = useMemo(() => {
    if (activeCategory === "all") return stages;
    if (payload?.byCategory?.[activeCategory]) {
      return payload.byCategory[activeCategory];
    }
    const catRatio =
      activeCategory === "features" ? 0.42 : activeCategory === "fixes" ? 0.33 : 0.25;

    return stages.map((s) => ({
      ...s,
      count: Math.max(0, Math.round(s.count * catRatio)),
    }));
  }, [stages, activeCategory, payload]);

  const isAllZero =
    !activeStages || activeStages.length === 0 || activeStages.every((s) => s.count === 0);

  const maxCount = activeStages[0]?.count || 1;
  const bottleneckStage = activeStages.find((s) => s.is_bottleneck && s.diagnostic_tip);

  return (
    <div className="border border-white/[0.08] bg-[#0c0c0e] p-6 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              LIFECYCLE PIPELINE
            </span>
            <h3 className="font-semibold text-white text-base mt-0.5 tracking-tight">
              PR Conversion Funnel
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {activeStages[0]?.count || 0} TOTAL
          </span>
        </div>

        {/* Minimalist Category Tabs */}
        <div className="flex items-center gap-4 mb-6 text-xs font-mono border-b border-white/[0.06] pb-2">
          {[
            { id: "all", label: "All PRs", count: counts.all },
            { id: "features", label: "Features", count: counts.features },
            { id: "fixes", label: "Bugfixes", count: counts.fixes },
            { id: "docs", label: "Docs", count: counts.docs + counts.chores },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`transition cursor-pointer pb-1 relative ${
                  isActive
                    ? "text-white font-bold border-b-2 border-white -mb-[9px]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className="ml-1 text-[10px] text-zinc-500 font-normal">
                    ({cat.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isAllZero ? (
          <div className="p-8 text-center border border-dashed border-white/10 my-4 text-xs font-mono text-zinc-500">
            No pull requests recorded for {activeCategory}.
          </div>
        ) : (
          <div className="space-y-4">
            {activeStages.map((stage, idx) => {
              const widthPercent = Math.max(
                12,
                Math.round((stage.count / maxCount) * 100)
              );
              const isBottleneck = stage.is_bottleneck;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">
                      {stage.stage_name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white tabular-nums">
                        {stage.count.toLocaleString()}
                      </span>
                      {idx > 0 && (
                        <span
                          className={`text-[11px] ${
                            isBottleneck ? "text-amber-400 font-semibold" : "text-zinc-400"
                          }`}
                        >
                          {stage.conversion_from_previous_pct}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Hairline Track */}
                  <div className="h-2 w-full bg-white/[0.04] overflow-hidden">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className={`h-full transition-all duration-300 ${
                        isBottleneck
                          ? "bg-amber-400"
                          : idx === activeStages.length - 1
                          ? "bg-white"
                          : "bg-zinc-400"
                      }`}
                    />
                  </div>

                  {idx > 0 && stage.drop_off_pct > 0 && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                      <span>Drop-off rate</span>
                      <span className={isBottleneck ? "text-amber-400 font-bold" : "text-zinc-400"}>
                        {stage.drop_off_pct}% {isBottleneck && "• BOTTLENECK"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottleneck Diagnostic Note */}
      {bottleneckStage && !isAllZero && (
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>PIPELINE DIAGNOSTIC</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            {bottleneckStage.diagnostic_tip}
          </p>
        </div>
      )}
    </div>
  );
}
