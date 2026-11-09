"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Terminal,
  Loader2,
  Send,
  Check,
  User,
  GitCommit,
  GitPullRequest,
  Code2,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AI_API_URL } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
  onViewJourney?: (login: string) => void;
  onRepoChange?: (repo: string) => void;
  onSyncRepo?: (repo: string) => void;
}

interface AIResponse {
  query: string;
  generated_sql: string;
  summary: string;
  chart_type: string;
  chart_data: any[];
  confidence: number;
  execution_time_ms: number;
  action?: {
    type: string;
    login?: string;
    target?: string;
    repo?: string;
    label: string;
  } | null;
}

export function AIModal({
  isOpen,
  onClose,
  currentRepo,
  onViewJourney,
  onRepoChange,
  onSyncRepo,
}: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveRepos, setLiveRepos] = useState<any[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Live GitHub Repository Search as user types (like GitHub's ⌘K search bar)
  useEffect(() => {
    const q = prompt.trim();
    if (!q || q.length < 2) {
      setLiveRepos([]);
      setIsSearchingLive(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await fetch(`/api/github/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveRepos(data.items || []);
        }
      } catch (err) {
        console.warn("Live GitHub search error:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [prompt]);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setShowSQL(false);
    try {
      const res = await fetch(`${AI_API_URL}/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, repo_name: currentRepo }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copySQL = () => {
    if (result?.generated_sql) {
      navigator.clipboard.writeText(result.generated_sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecuteAction = () => {
    if (!result?.action) return;
    const { type, login, target, repo } = result.action;

    if (type === "view_journey" && login && onViewJourney) {
      onClose();
      onViewJourney(login);
    } else if (type === "switch_repo" && target && onRepoChange) {
      onClose();
      onRepoChange(target);
    } else if ((type === "sync" || type === "suggest_sync") && onSyncRepo) {
      onClose();
      onSyncRepo(repo || currentRepo);
    }
  };

  const sampleQueries = [
    "Top human contributors",
    "Pull Request status distribution",
    "Daily commit activity trend",
    "Code churn line volume",
    "@sokra",
    "sync",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl border border-white/[0.14] bg-[#09090b] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center border border-white/[0.12] bg-white/[0.04] text-zinc-200">
              <Search className="h-3.5 w-3.5 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-xs font-mono uppercase tracking-wider">
                Universal Search &amp; AI Analytics
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                Search global repositories, @developers, or query DuckDB AST · Active:{" "}
                <span className="text-zinc-300">{currentRepo}</span>
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

        {/* Input Form */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 border border-white/[0.12] bg-white/[0.03] p-2 focus-within:border-white/40 transition-colors"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search repos (e.g. react, uv), @developer, or ask natural language dev questions..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (result) setResult(null);
                }}
                className="w-full bg-transparent pl-9 pr-3 py-1 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-1.5 bg-white text-black px-3.5 py-1.5 text-xs font-mono font-medium tracking-tight uppercase hover:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer shrink-0"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
              ) : (
                <Send className="h-3.5 w-3.5 text-black" />
              )}
              <span>Execute</span>
            </button>
          </form>

          {/* Live GitHub Search Autocomplete Results */}
          {prompt.trim().length >= 2 && !result && (
            <div className="mt-3 border border-white/[0.1] bg-[#0c0c0e] shadow-xl overflow-hidden divide-y divide-white/[0.06] max-h-64 overflow-y-auto">
              <div className="px-3 py-2 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-zinc-400" />
                  <span>GitHub Repositories Matching &quot;{prompt}&quot;</span>
                </span>
                {isSearchingLive && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                    Searching GitHub...
                  </span>
                )}
              </div>

              {liveRepos.length > 0 ? (
                liveRepos.slice(0, 6).map((repo) => (
                  <button
                    key={repo.full_name}
                    type="button"
                    onClick={() => {
                      onClose();
                      onRepoChange?.(repo.full_name);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-white/[0.04] transition flex items-center justify-between gap-3 group cursor-pointer border-b border-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:underline truncate">
                          {repo.full_name}
                        </span>
                        {repo.language && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {repo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 shrink-0">
                      <Star className="h-3 w-3 fill-white/20 text-white" />
                      <span>{repo.stars_formatted}</span>
                    </div>
                  </button>
                ))
              ) : !isSearchingLive ? (
                <div className="p-3 text-center text-xs font-mono text-zinc-500">
                  No public repositories found. Press Execute or Enter for AI DuckDB query.
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(q);
                  handleAsk(q);
                }}
                className="border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:border-white/25 hover:text-white transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Response Visualization */}
        {result && (
          <div className="mt-5 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {/* Business / Engineering Summary */}
            <div className="border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs text-zinc-200 font-mono mb-2">
                <span className="uppercase tracking-wider text-[11px] text-zinc-400">Engineering Telemetry</span>
                <span className="font-mono text-[10px] tabular-nums text-zinc-400 border border-white/[0.08] px-1.5 py-0.5">
                  {result.execution_time_ms}ms · Conf: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {result.summary}
              </p>

              {/* Action shortcut button if available */}
              {result.action && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex justify-end">
                  <button
                    onClick={handleExecuteAction}
                    className="flex items-center gap-1.5 bg-white text-black px-3 py-1 text-xs font-mono font-medium uppercase tracking-tight hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <span>{result.action.label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Special 1: Developer Profile Card (When searching user/entity) */}
            {result.chart_type === "developer_profile" &&
              result.chart_data.length > 0 && (
                <div className="border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          result.chart_data[0].avatar_url ||
                          "https://avatars.githubusercontent.com/u/583231?v=4"
                        }
                        alt={result.chart_data[0].actor_login}
                        className="h-9 w-9 grayscale border border-white/[0.12] bg-[#141414] object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-bold text-white text-sm">
                            @{result.chart_data[0].actor_login}
                          </h4>
                          <span className="px-1.5 py-0.2 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/5">
                            Verified Contributor
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Target: {currentRepo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-2 border border-white/[0.06] bg-black">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Commits
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {formatNumber(result.chart_data[0].commits || 0)}
                      </span>
                    </div>
                    <div className="p-2 border border-white/[0.06] bg-black">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        PRs Merged
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {result.chart_data[0].prs_merged || 0}
                      </span>
                    </div>
                    <div className="p-2 border border-white/[0.06] bg-black">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Lines +/-
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        +{formatNumber(result.chart_data[0].lines_added || 0)} / -
                        {formatNumber(result.chart_data[0].lines_deleted || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Special 2: Not Found Visual Indicator */}
            {result.chart_type === "not_found" && (
              <div className="border border-white/[0.08] bg-white/[0.02] p-6 text-center font-mono">
                <AlertCircle className="h-5 w-5 text-zinc-500 mx-auto mb-2" />
                <span className="text-xs font-semibold text-zinc-300 block">
                  No Direct Activity Recorded
                </span>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  DuckDB analytics indexed 14 days of event history for{" "}
                  <code className="text-zinc-400">{currentRepo}</code>.
                </span>
              </div>
            )}

            {/* General Visual Chart (BarChart or LineChart) */}
            {result.chart_type !== "developer_profile" &&
              result.chart_type !== "not_found" &&
              result.chart_type !== "command_action" &&
              result.chart_data &&
              result.chart_data.length > 0 && (
                <div className="border border-white/[0.08] bg-white/[0.02] p-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 block">
                    Telemetry Stream Query Result
                  </span>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {result.chart_type === "line" ? (
                        <LineChart
                          data={result.chart_data}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <XAxis
                            dataKey={Object.keys(result.chart_data[0])[0]}
                            stroke="#52525b"
                            fontSize={10}
                            fontFamily="ui-monospace, monospace"
                          />
                          <YAxis stroke="#52525b" fontSize={10} fontFamily="ui-monospace, monospace" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#080808",
                              borderColor: "rgba(255, 255, 255, 0.15)",
                              borderRadius: "0px",
                              fontSize: "11px",
                              fontFamily: "ui-monospace, monospace",
                              color: "#f4f4f5",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey={
                              Object.keys(result.chart_data[0])[1] || "commits"
                            }
                            stroke="#f4f4f5"
                            strokeWidth={1.5}
                            dot={{ fill: "#f4f4f5", r: 2.5 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={result.chart_data}
                          margin={{ top: 10, right: 10, left: 0, bottom: 15 }}
                        >
                          <XAxis
                            dataKey={Object.keys(result.chart_data[0])[0]}
                            stroke="#52525b"
                            fontSize={10}
                            fontFamily="ui-monospace, monospace"
                            tickFormatter={(val: string) =>
                              val && val.length > 12 ? `${val.slice(0, 10)}…` : val
                            }
                          />
                          <YAxis stroke="#52525b" fontSize={10} fontFamily="ui-monospace, monospace" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#080808",
                              borderColor: "rgba(255, 255, 255, 0.15)",
                              borderRadius: "0px",
                              fontSize: "11px",
                              fontFamily: "ui-monospace, monospace",
                              color: "#f4f4f5",
                            }}
                          />
                          <Bar
                            dataKey={
                              Object.keys(result.chart_data[0])[1] ||
                              "total_commits"
                            }
                            fill="#f4f4f5"
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            {/* Generated SQL AST Sandbox (Collapsible & Non-Command Filtered) */}
            {result.generated_sql &&
              result.chart_type !== "command_action" &&
              !result.generated_sql.trim().startsWith("-- COMMAND:") && (
                <div className="border border-white/[0.08] bg-[#060608] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setShowSQL((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer select-none group"
                    >
                      <Terminal className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="font-medium">Sandboxed SQL (DuckDB Engine)</span>
                      <span className="border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.2 text-[10px] text-zinc-400 font-mono">
                        {showSQL ? "Hide" : "Inspect"}
                      </span>
                      {showSQL ? (
                        <ChevronUp className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      )}
                    </button>
                    {showSQL && (
                      <button
                        onClick={copySQL}
                        className="flex items-center gap-1 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : null}
                        <span>{copied ? "Copied" : "Copy SQL"}</span>
                      </button>
                    )}
                  </div>

                  {showSQL && (
                    <div className="p-3 bg-black border-t border-white/[0.06]">
                      <pre className="overflow-x-auto font-mono text-[11px] text-zinc-300 leading-relaxed selection:bg-white selection:text-black">
                        {result.generated_sql}
                      </pre>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
