"use client";

import { useEffect, useState } from "react";
import { X, GitCommit, GitPullRequest, AlertCircle, Award, Clock, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { GITHUB_API_URL } from "@/lib/api";

interface JourneyEvent {
  timestamp: string;
  event_type: string;
  title: string;
  lines_added: number;
  lines_deleted: number;
  badge: string;
}

interface JourneyData {
  login: string;
  avatar_url: string;
  repo_name: string;
  total_commits: number;
  prs_merged: number;
  velocity_score: number;
  rank: number;
  events: JourneyEvent[];
}

export function ContributorJourneyModal({
  isOpen,
  onClose,
  login,
  repoName,
}: {
  isOpen: boolean;
  onClose: () => void;
  login: string | null;
  repoName: string;
}) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !login) return;
    setLoading(true);
    fetch(`${GITHUB_API_URL}/contributor-journey?repo=${encodeURIComponent(repoName)}&login=${encodeURIComponent(login)}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error fetching journey:", err))
      .finally(() => setLoading(false));
  }, [isOpen, login, repoName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !login) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl border border-white/[0.14] bg-[#09090b] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Profile */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={data?.avatar_url || "https://avatars.githubusercontent.com/u/583231?v=4"}
              alt={login}
              className="h-10 w-10 grayscale border border-white/[0.14] bg-[#141414] object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-white text-base">@{login}</h3>
                <span className="border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  DEVELOPER DOSSIER
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Commit &amp; PR event record in <span className="text-zinc-300">{repoName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Stats Grid — Split Architecture */}
        {data && (
          <div className="grid grid-cols-3 divide-x divide-white/[0.08] border border-white/[0.08] bg-black my-4 p-4 shrink-0 text-center">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Total Commits</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">{formatNumber(data.total_commits)}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">PRs Merged</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">{data.prs_merged}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Velocity Score</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">{data.velocity_score} <span className="text-xs text-zinc-500 font-normal">pts</span></span>
            </div>
          </div>
        )}

        {/* Chronological Action Journey */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>Chronological Activity Ledger</span>
          </div>

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 border border-white/[0.06] bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : data?.events && data.events.length > 0 ? (
            <div className="relative border-l border-white/[0.1] ml-3 space-y-3 py-1">
              {data.events.map((evt, idx) => (
                <div key={idx} className="relative pl-5 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-2 h-2 w-2 border border-black bg-white" />

                  <div className="border border-white/[0.08] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="text-zinc-500 tabular-nums">{evt.timestamp}</span>
                      <span className="border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.2 text-[10px] uppercase text-zinc-400">
                        {evt.badge}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-snug">{evt.title}</p>

                    {(evt.lines_added > 0 || evt.lines_deleted > 0) && (
                      <div className="mt-1.5 font-mono tabular-nums text-[11px] text-zinc-400 flex gap-2">
                        <span className="text-zinc-300">+{formatNumber(evt.lines_added)} lines</span>
                        <span className="text-zinc-500">-{formatNumber(evt.lines_deleted)} lines</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-zinc-500 text-center py-6">No activity history recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
