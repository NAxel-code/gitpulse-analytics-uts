"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  GitPullRequest,
  Sparkles,
  RefreshCw,
  Calendar,
  Key,
  Check,
  X,
  HelpCircle,
  Plus,
  Search,
  FolderGit2,
  Trophy,
  Star,
  Loader2,
  Globe,
} from "lucide-react";
import { GitPulseLogo } from "./GitPulseLogo";

interface HeaderProps {
  currentRepo: string;
  onRepoChange: (repo: string) => void;
  onSyncRepo: (repo: string) => void;
  syncing: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  onOpenAI: () => void;
  githubToken: string;
  onTokenChange: (token: string) => void;
  onOpenHelp?: () => void;
  onOpenLeaderboard?: () => void;
}

export function Header({
  currentRepo,
  onRepoChange,
  onSyncRepo,
  syncing,
  days,
  onDaysChange,
  onOpenAI,
  githubToken,
  onTokenChange,
  onOpenHelp,
  onOpenLeaderboard,
}: HeaderProps) {
  const [repoInput, setRepoInput] = useState(currentRepo);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [customRepo, setCustomRepo] = useState("");
  const [repoError, setRepoError] = useState("");
  const [tempToken, setTempToken] = useState(githubToken);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryPills, setSelectedCategoryPills] = useState<string>("all");

  useEffect(() => {
    setTempToken(githubToken);
  }, [githubToken]);

  // Live GitHub search autocomplete
  useEffect(() => {
    const q = customRepo.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/github/search?q=${encodeURIComponent(q)}`, {
          headers: githubToken ? { Authorization: `Bearer ${githubToken.trim()}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.items || []);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customRepo, githubToken]);

  const featuredPresets = [
    {
      repo: "ollama/ollama",
      label: "ollama",
      category: "AI",
      icon: "🤖",
      stars: "118k",
      tooltip: "Local AI & Large Language Model Runner (118k ⭐)",
    },
    {
      repo: "astral-sh/uv",
      label: "uv",
      category: "Systems",
      icon: "🦀",
      stars: "49k",
      tooltip: "Ultra-Fast Python Package Manager in Rust (49k ⭐)",
    },
    {
      repo: "vercel/next.js",
      label: "next.js",
      category: "Web",
      icon: "🌐",
      stars: "128k",
      tooltip: "The React Framework for the Web (128k ⭐)",
    },
    {
      repo: "kubernetes/kubernetes",
      label: "kubernetes",
      category: "DevOps",
      icon: "☸️",
      stars: "113k",
      tooltip: "Production-Grade Container Orchestration (113k ⭐)",
    },
    {
      repo: "NAxel-code/gitpulse-analytics",
      label: "gitpulse",
      category: "Featured",
      icon: "⚡",
      stars: "Self",
      tooltip: "GitPulse Analytics Platform (Author Project)",
      isHero: true,
    },
  ];

  const universalPresets = [
    { name: "NAxel-code/gitpulse-analytics", category: "personal", label: "GitPulse (Your Repo)", lang: "TypeScript" },
    { name: "vllm-project/vllm", category: "ai", label: "vLLM (AI Inference)", lang: "Python" },
    { name: "huggingface/transformers", category: "ai", label: "Transformers", lang: "Python" },
    { name: "ollama/ollama", category: "ai", label: "Ollama (Local LLM)", lang: "Go" },
    { name: "astral-sh/uv", category: "systems", label: "uv (Fast Python)", lang: "Rust" },
    { name: "torvalds/linux", category: "systems", label: "Linux Kernel", lang: "C" },
    { name: "oven-sh/bun", category: "systems", label: "Bun Runtime", lang: "Zig" },
    { name: "kubernetes/kubernetes", category: "devops", label: "Kubernetes", lang: "Go" },
    { name: "prometheus/prometheus", category: "devops", label: "Prometheus", lang: "Go" },
    { name: "flutter/flutter", category: "mobile", label: "Flutter", lang: "Dart" },
    { name: "facebook/react-native", category: "mobile", label: "React Native", lang: "C++ / JS" },
    { name: "vercel/next.js", category: "web", label: "Next.js", lang: "TypeScript" },
    { name: "facebook/react", category: "web", label: "React", lang: "JavaScript" },
    { name: "tailwindlabs/tailwindcss", category: "web", label: "Tailwind CSS", lang: "CSS" },
  ];

  const handleSelectPreset = (repo: string) => {
    setRepoInput(repo);
    onRepoChange(repo);
  };

  const handleCustomRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customRepo
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/$/, "");
    if (!trimmed.includes("/") || trimmed.split("/").length !== 2) {
      setRepoError("Repository format must be: owner/repo-name (e.g. NAxel-code/gitpulse-analytics)");
      return;
    }
    setRepoError("");
    setRepoInput(trimmed);
    onRepoChange(trimmed);
    setShowRepoModal(false);
    setCustomRepo("");
  };

  const handleSaveToken = () => {
    onTokenChange(tempToken.trim());
    setShowTokenModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#080808]">
        {/* Tier 1: Primary Navigation Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          {/* Brand & Active Target Repository */}
          <div id="tour-repo-sync" className="flex items-center gap-3.5 shrink-0">
            <GitPulseLogo size={30} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-sm font-mono">GITPULSE</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  / 1.1
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="text-zinc-600 font-mono text-[11px]">repo:</span>
                <button
                  onClick={() => setShowRepoModal(true)}
                  className="font-mono text-zinc-200 font-semibold hover:text-white underline decoration-zinc-600 underline-offset-4 transition cursor-pointer max-w-[200px] truncate"
                  title="Switch target repository"
                >
                  {currentRepo}
                </button>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1 shrink-0" />
              </div>
            </div>
          </div>

          {/* Center Search / Command Input */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4">
            <button
              id="tour-ai-search"
              onClick={onOpenAI}
              className="group flex w-full h-8 items-center justify-between gap-2 border border-white/10 bg-white/[0.02] px-3 text-xs text-zinc-400 transition hover:border-white/20 hover:text-zinc-200 cursor-pointer focus-visible:outline-none"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                  Search repos, @devs, or query...
                </span>
              </div>
              <kbd className="shrink-0 hidden sm:inline-flex items-center border border-white/10 px-1 py-0.2 text-[10px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile AI Button */}
            <button
              onClick={onOpenAI}
              className="md:hidden flex h-8 w-8 items-center justify-center border border-white/10 text-zinc-300 hover:bg-white/10"
              title="Ask AI (⌘K)"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Date Range Selector */}
            <div className="flex items-center border border-white/10 bg-black/40">
              {[
                { label: "7D", value: 7 },
                { label: "14D", value: 14 },
                { label: "30D", value: 30 },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => onDaysChange(item.value)}
                  className={`px-2.5 py-1 text-xs font-mono transition cursor-pointer ${
                    days === item.value
                      ? "bg-white text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sync Button */}
            <button
              onClick={() => onSyncRepo(currentRepo)}
              disabled={syncing}
              className="flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-3 py-1 text-xs font-mono font-medium text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
              title="Synchronize repository data with GitHub"
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync"}</span>
            </button>

            {/* Leaderboard Action Button */}
            <button
              onClick={onOpenLeaderboard}
              title="Open Benchmark Leaderboard"
              className="flex items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs font-mono font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              <Trophy className="h-3 w-3 text-zinc-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* GitHub Token / PAT Button */}
            <button
              onClick={() => setShowTokenModal(true)}
              title={githubToken ? "GitHub Token Active (5,000 req/hr)" : "Set PAT token"}
              className={`flex items-center gap-1.5 border px-2.5 py-1 text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                githubToken
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                  : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Key className="h-3 w-3 shrink-0" />
              <span className="hidden md:inline">{githubToken ? "PAT Active" : "Set PAT"}</span>
            </button>

            {/* Help & Guide Button */}
            <button
              onClick={onOpenHelp}
              title="GitPulse Guide (Press '?')"
              className="flex items-center gap-1.5 border border-white/10 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="h-3 w-3 shrink-0" />
              <span className="hidden md:inline">Guide</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Minimalist Monospaced Presets Strip */}
        <div className="flex items-center gap-3 px-6 py-2 border-t border-white/[0.06] bg-black/30 overflow-x-auto scrollbar-none text-xs font-mono">
          <span className="text-[11px] text-zinc-500 shrink-0">
            INDEX:
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {featuredPresets.map((p) => {
              const isActive = currentRepo.toLowerCase() === p.repo.toLowerCase();
              return (
                <button
                  key={p.repo}
                  onClick={() => handleSelectPreset(p.repo)}
                  title={p.tooltip}
                  className={`px-2 py-0.5 text-xs transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "text-white font-bold underline decoration-white underline-offset-4"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <span>{p.label}</span>
                  {p.isHero && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}

            {/* Custom Repo Button */}
            <button
              id="btn-ganti-repo"
              onClick={() => setShowRepoModal(true)}
              className="rounded-lg px-2.5 py-1 text-xs font-mono border border-dashed border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ml-1"
              title="Analyze any public GitHub repository worldwide"
            >
              <Plus className="h-3 w-3 text-indigo-400" />
              <span>Switch Repo...</span>
            </button>
          </div>
        </div>
      </header>

      {/* GitHub PAT Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md border border-white/[0.14] bg-[#09090b] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-zinc-300" />
                <h3 className="font-semibold text-white text-xs font-mono uppercase tracking-wider">GitHub Personal Access Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              By default GitHub limits unauthenticated requests to <strong className="text-zinc-200">60 req/hr</strong>. Enter your personal GitHub token (read-only) to increase quota up to <strong className="text-zinc-200">5,000 req/hr</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                className="w-full border border-white/[0.12] bg-white/[0.03] px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none"
              />
              <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                <span>Stored in browser (localStorage)</span>
                {githubToken && (
                  <button
                    onClick={() => {
                      setTempToken("");
                      onTokenChange("");
                      setShowTokenModal(false);
                    }}
                    className="text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove Token
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToken}
                className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black px-4 py-1.5 text-xs font-mono font-semibold tracking-tight uppercase transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Repository Switcher Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg border border-white/[0.14] bg-[#09090b] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center border border-white/[0.12] bg-white/[0.04] text-zinc-200">
                  <FolderGit2 className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-xs font-mono uppercase tracking-wider">
                    Switch / Analyze Repository
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    DuckDB telemetry indexed across public repositories
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRepoModal(false);
                  setRepoError("");
                }}
                className="p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCustomRepoSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
                  GitHub Repository Name:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    id="input-custom-repo"
                    type="text"
                    autoFocus
                    placeholder="owner/repo-name (e.g., astral-sh/uv, vllm-project/vllm, torvalds/linux)..."
                    value={customRepo}
                    onChange={(e) => {
                      setCustomRepo(e.target.value);
                      if (repoError) setRepoError("");
                    }}
                    className="w-full border border-white/[0.12] bg-white/[0.03] pl-9 pr-8 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-white/40 focus:outline-none transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                  )}
                </div>
                {repoError && (
                  <p className="text-[11px] font-mono text-rose-400 mt-1">{repoError}</p>
                )}

                {/* Live Autocomplete Results from GitHub Search */}
                {searchResults.length > 0 && (
                  <div
                    id="autocomplete-dropdown"
                    className="mt-2 border border-white/[0.1] bg-[#0c0c0e] max-h-48 overflow-y-auto divide-y divide-white/[0.06] shadow-lg"
                  >
                    {searchResults.map((sr) => (
                      <button
                        key={sr.full_name}
                        type="button"
                        onClick={() => {
                          setCustomRepo(sr.full_name);
                          setSearchResults([]);
                          setRepoError("");
                        }}
                        className="w-full text-left p-2.5 hover:bg-white/[0.04] transition flex items-start justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white group-hover:underline underline-offset-2">
                              {sr.full_name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {sr.language}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {sr.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 shrink-0">
                          <Star className="h-3 w-3 fill-white/20 text-white" />
                          <span>{sr.stars_formatted}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Sector Preset Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Multi-Sector &amp; Language Presets:
                  </span>
                  {/* Category Filter Mini Tabs */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {[
                      { id: "all", label: "All" },
                      { id: "ai", label: "🤖 AI" },
                      { id: "systems", label: "🦀 Systems" },
                      { id: "devops", label: "⚙️ DevOps" },
                      { id: "web", label: "🌐 Web" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryPills(cat.id)}
                        className={`px-1.5 py-0.5 rounded transition ${
                          selectedCategoryPills === cat.id
                            ? "bg-zinc-800 text-zinc-100 font-semibold"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {universalPresets
                    .filter((p) => selectedCategoryPills === "all" || p.category === selectedCategoryPills)
                    .map((r) => (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => {
                          handleSelectPreset(r.name);
                          setShowRepoModal(false);
                          setCustomRepo("");
                          setRepoError("");
                          setSearchResults([]);
                        }}
                        className={`rounded-md border px-2 py-1 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer ${
                          r.name === currentRepo
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold"
                            : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-800"
                        }`}
                        title={`${r.label} (${r.lang})`}
                      >
                        <span>{r.name}</span>
                        <span className="text-[9px] text-zinc-500">[{r.lang}]</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Direct Leaderboard Banner */}
              {onOpenLeaderboard && (
                <div className="border border-white/[0.08] bg-white/[0.02] p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Compare stars, licenses, and velocity:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRepoModal(false);
                      onOpenLeaderboard();
                    }}
                    className="font-mono text-[11px] text-white hover:underline underline-offset-2 shrink-0 cursor-pointer"
                  >
                    Open Leaderboard &rarr;
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepoModal(false);
                    setRepoError("");
                    setSearchResults([]);
                  }}
                  className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customRepo.trim()}
                  className="flex items-center gap-1.5 bg-white text-black px-4 py-1.5 text-xs font-mono font-medium tracking-tight uppercase hover:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Load Repository</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
