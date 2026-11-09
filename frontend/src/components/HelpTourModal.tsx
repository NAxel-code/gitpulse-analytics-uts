"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Key,
  Terminal,
  Activity,
  Layers,
  Check,
  Compass,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export interface HelpTourModalProps {
  isHelpOpen: boolean;
  onCloseHelp: () => void;
  isTourActive: boolean;
  onStartTour: () => void;
  onCloseTour: () => void;
  onSelectRepo?: (repo: string) => void;
  onOpenAI?: () => void;
}

interface TourStep {
  targetId: string;
  badge: string;
  title: string;
  description: string;
  hint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-repo-sync",
    badge: "Step 1 of 5",
    title: "Select Repository & Live Sync",
    description:
      "Type any public GitHub repository name (format: 'owner/repo', e.g. 'vercel/next.js') or use quick presets. Click 'Sync Live Repo' to ingest the latest commits & PRs into DuckDB columnar storage.",
    hint: "💡 Set a free GitHub Personal Access Token (PAT) via 'Set PAT' to increase your quota from 60 to 5,000 req/hr.",
  },
  {
    targetId: "tour-ai-search",
    badge: "Step 2 of 5",
    title: "AI Natural Language Search",
    description:
      "Press ⌘K or Ctrl+K to ask engineering questions in plain English. The AI translates inquiries into high-speed, read-only AST-sanitized DuckDB SQL queries.",
    hint: "💡 Type '@username' (e.g., '@sokra') to inspect a contributor profile card, or type 'sync' for instant synchronization.",
  },
  {
    targetId: "tour-kpi-cards",
    badge: "Step 3 of 5",
    title: "Executive KPIs & DORA Sub-Strip",
    description:
      "Monitor team engineering health: Active Contributors, Total Commits, PR Merge Velocity, Lead Time to Merge, Time to First Review (TTFR), and PR Size Hygiene distribution.",
    hint: "💡 PRs sized <200 LoC (Small) are proven to be reviewed 2x faster with minimal risk of regression.",
  },
  {
    targetId: "tour-pr-funnel",
    badge: "Step 4 of 5",
    title: "PR Lifecycle Funnel & Bottlenecks",
    description:
      "Visualize the 4-stage PR journey from creation to merge. The system visually highlights review bottlenecks (amber) and suggests actionable mitigation steps.",
    hint: "💡 Percentage and drop-off rates are presented in monospace tabular numbers for easy comparison.",
  },
  {
    targetId: "tour-contributors",
    badge: "Step 5 of 5",
    title: "Contributor Velocity & Action Stream",
    description:
      "Rank contributors by velocity scores, podium medals (Gold, Silver, Bronze), and momentum tags. Click any developer row to open their chronological contribution journey (Action Stream).",
    hint: "💡 Sort the table by commits, PRs merged, lines added/deleted, or velocity score.",
  },
];

export function HelpTourModal({
  isHelpOpen,
  onCloseHelp,
  isTourActive,
  onStartTour,
  onCloseTour,
  onSelectRepo,
  onOpenAI,
}: HelpTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"quickstart" | "cheatsheet" | "dora">("quickstart");
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Check first-time visitor for welcome toast banner
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("gitpulse_has_seen_tour");
      if (!hasSeen) {
        setShowWelcomeBanner(true);
      }
    } catch {
      // ignore localStorage disabled
    }
  }, []);

  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
    try {
      localStorage.setItem("gitpulse_has_seen_tour", "true");
    } catch {
      // ignore
    }
  };

  const handleStartTourFromBanner = () => {
    handleDismissBanner();
    setCurrentStep(0);
    onStartTour();
  };

  // Keyboard navigation for Tour (ArrowLeft, ArrowRight, Escape) and Help Modal (?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger help modal with '?' when not typing in an input
      if (
        e.key === "?" &&
        !isHelpOpen &&
        !isTourActive &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        onCloseTour();
        // open help modal
        return;
      }

      if (isTourActive) {
        if (e.key === "Escape") {
          onCloseTour();
        } else if (e.key === "ArrowRight") {
          if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            onCloseTour();
          }
        } else if (e.key === "ArrowLeft") {
          if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
          }
        }
      } else if (isHelpOpen && e.key === "Escape") {
        onCloseHelp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourActive, isHelpOpen, currentStep, onCloseTour, onCloseHelp]);

  // Measure target position without triggering scroll
  const measureTarget = useCallback(() => {
    if (!isTourActive) return;
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStep]);

  // Smooth scroll to target and measure once when step changes
  useEffect(() => {
    if (!isTourActive) {
      setTargetRect(null);
      return;
    }
    const step = TOUR_STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTargetRect(el.getBoundingClientRect());
      const timer = setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStep]);

  // Update target rect on window resize or scroll without re-scrolling
  useEffect(() => {
    if (!isTourActive) return;
    const onScrollOrResize = () => {
      measureTarget();
    };
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize);
    };
  }, [isTourActive, measureTarget]);

  const handleNextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        localStorage.setItem("gitpulse_has_seen_tour", "true");
      } catch {}
      onCloseTour();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* 1. First-time Visitor Welcome Banner */}
      {showWelcomeBanner && !isTourActive && !isHelpOpen && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md border border-white/[0.14] bg-[#0c0c0e] p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/[0.12] bg-white/[0.04] text-white">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Welcome to GitPulse Telemetry
              </h4>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-sans">
                Take a 1-minute guided tour to explore DORA engineering metrics, DuckDB query console, and contributor velocity.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleStartTourFromBanner}
                  className="bg-white hover:bg-zinc-200 text-black px-3 py-1.5 text-xs font-mono font-medium uppercase tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Tour</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDismissBanner}
                  className="border border-white/[0.1] bg-white/[0.02] hover:border-white/20 text-zinc-300 px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissBanner}
              aria-label="Close banner"
              className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive Spotlight Tour Overlay with Cutout */}
      {isTourActive && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
          {/* SVG Mask Definition with cutout hole for target element */}
          <svg className="fixed w-0 h-0" aria-hidden="true">
            <defs>
              <mask id="tour-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={Math.max(0, targetRect.left - 6)}
                    y={Math.max(0, targetRect.top - 6)}
                    width={targetRect.width + 12}
                    height={targetRect.height + 12}
                    rx="4"
                    ry="4"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
          </svg>

          {/* Dark Backdrop with Cutout for Spotlight (No blur or dimming over target!) */}
          <div
            onClick={(e) => {
              if (targetRect) {
                const pad = 6;
                if (
                  e.clientX >= targetRect.left - pad &&
                  e.clientX <= targetRect.right + pad &&
                  e.clientY >= targetRect.top - pad &&
                  e.clientY <= targetRect.bottom + pad
                ) {
                  return; // clicked inside spotlight cutout
                }
              }
              onCloseTour();
            }}
            style={
              targetRect
                ? {
                    mask: "url(#tour-spotlight-mask)",
                    WebkitMask: "url(#tour-spotlight-mask)",
                  }
                : undefined
            }
            className="absolute inset-0 bg-black/80 transition-opacity duration-300 cursor-pointer"
          />

          {/* Spotlight Highlight Ring around active element */}
          {targetRect && (
            <div
              style={{
                top: `${Math.max(0, targetRect.top - 6)}px`,
                left: `${Math.max(0, targetRect.left - 6)}px`,
                width: `${targetRect.width + 12}px`,
                height: `${targetRect.height + 12}px`,
              }}
              className="absolute pointer-events-none ring-1 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all duration-300"
            />
          )}

          {/* Floating Step Card */}
          <div
            className={`fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 w-full md:max-w-xl transition-all duration-300 pointer-events-auto ${
              targetRect && typeof window !== "undefined" && targetRect.top > window.innerHeight * 0.45
                ? "top-6 md:top-8"
                : "bottom-6 md:bottom-10"
            }`}
          >
            <div className="border border-white/[0.14] bg-[#09090b] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-zinc-300">
                  {TOUR_STEPS[currentStep].badge}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-500">
                    {currentStep + 1} / {TOUR_STEPS.length}
                  </span>
                  <button
                    onClick={onCloseTour}
                    aria-label="Close tour"
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm md:text-base font-bold text-white font-mono">
                {TOUR_STEPS[currentStep].title}
              </h3>
              <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed font-sans">
                {TOUR_STEPS[currentStep].description}
              </p>

              {/* Practical Pro Tip Hint */}
              <div className="mt-3 border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[11px] font-mono text-zinc-400 leading-snug">
                {TOUR_STEPS[currentStep].hint}
              </div>

              {/* Controls */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <button
                  onClick={onCloseTour}
                  className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1 border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-black px-3.5 py-1.5 text-xs font-mono font-semibold uppercase tracking-tight transition-colors cursor-pointer"
                  >
                    <span>{currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Help & Feature Cheat Sheet Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl border border-white/[0.14] bg-[#09090b] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border border-white/[0.12] bg-white/[0.04] text-white">
                  <BookOpen className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-white text-sm md:text-base uppercase tracking-wider">
                      GitPulse Documentation
                    </h3>
                    <span className="border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-mono text-zinc-400">
                      v1.1
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Operational manual, query syntax, and telemetry schema
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseHelp}
                aria-label="Close guide"
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-4 border-b border-white/[0.08] pb-2 shrink-0">
              <button
                onClick={() => setActiveTab("quickstart")}
                className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === "quickstart"
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:border-white/[0.08]"
                }`}
              >
                Quickstart &amp; PAT
              </button>
              <button
                onClick={() => setActiveTab("cheatsheet")}
                className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === "cheatsheet"
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:border-white/[0.08]"
                }`}
              >
                AI &amp; Command Syntax
              </button>
              <button
                onClick={() => setActiveTab("dora")}
                className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                  activeTab === "dora"
                    ? "bg-white text-black font-bold"
                    : "text-zinc-400 hover:text-white border border-transparent hover:border-white/[0.08]"
                }`}
              >
                DORA Metrics Glossary
              </button>

              <button
                onClick={() => {
                  onCloseHelp();
                  setCurrentStep(0);
                  onStartTour();
                }}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Open Visual Tour</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 text-xs text-zinc-300">
              {activeTab === "quickstart" && (
                <div className="space-y-4">
                  {/* Step 1: Token */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2 font-semibold text-zinc-100 text-sm">
                      <Key className="h-4 w-4 text-emerald-400" />
                      <h4>1. Why do you need a GitHub Personal Access Token (PAT)?</h4>
                    </div>
                    <p className="leading-relaxed text-zinc-300">
                      GitHub imposes strict unauthenticated rate limits: only <strong>60 requests/hour</strong>. By setting a free Personal Access Token (PAT):
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-zinc-400">
                      <li>Rate limit increases up to <strong>5,000 requests/hour</strong>.</li>
                      <li>Tokens are stored securely only in your browser&apos;s local storage (<code className="font-mono text-zinc-300">localStorage</code>).</li>
                      <li>A *Classic* token with minimal scope (<code className="font-mono text-zinc-300">public_repo</code>) is all that&apos;s required.</li>
                    </ul>
                    <div className="mt-3">
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 transition"
                      >
                        <span>Generate Token in GitHub Settings</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Custom Repo */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2 font-semibold text-zinc-100 text-sm">
                      <Terminal className="h-4 w-4 text-indigo-400" />
                      <h4>2. How to Analyze Any Repository</h4>
                    </div>
                    <p className="leading-relaxed text-zinc-300">
                      Enter the <code className="font-mono text-zinc-200">owner/repo-name</code> in the top navigation bar (e.g. <code className="font-mono text-zinc-200">astral-sh/uv</code>, <code className="font-mono text-zinc-200">vllm-project/vllm</code>, or <code className="font-mono text-zinc-200">facebook/react</code>). Click <strong>Sync Live Repo</strong> to ingest real-time GitHub data into the high-performance columnar engine.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "cheatsheet" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-2 mb-1.5 font-semibold text-zinc-100 text-sm">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      <h4>Text-to-SQL AST-Sanitized AI Search</h4>
                    </div>
                    <p className="leading-relaxed text-zinc-400 mb-3">
                      Press <kbd className="font-mono bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700 text-zinc-200">⌘K</kbd> or <kbd className="font-mono bg-zinc-800 px-1 py-0.5 rounded border border-zinc-700 text-zinc-200">Ctrl+K</kbd> anywhere to open AI search. Here are example queries you can try:
                    </p>

                    <div className="divide-y divide-zinc-800/80">
                      {[
                        {
                          query: "Top human contributors",
                          desc: "Display active contributors excluding GitHub Actions automated bots",
                        },
                        {
                          query: "Pull Request status distribution",
                          desc: "Visualize ratio of merged, closed, and open PRs",
                        },
                        {
                          query: "Daily commit activity trend",
                          desc: "Generate 14-day time-series volume of daily commits",
                        },
                        {
                          query: "Code churn and lines delta",
                          desc: "Display ratio of lines added vs lines deleted",
                        },
                        {
                          query: "@sokra",
                          desc: "Open developer profile card, commits count, and merged PRs",
                        },
                        {
                          query: "sync",
                          desc: "Instant command shortcut to synchronize active repository",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-mono text-zinc-200 text-xs font-medium">
                              &quot;{item.query}&quot;
                            </span>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => {
                              onCloseHelp();
                              onOpenAI?.();
                            }}
                            className="shrink-0 rounded bg-zinc-800 px-2 py-1 text-[11px] font-mono text-indigo-300 hover:bg-zinc-700 border border-zinc-700/50 transition"
                          >
                            Ask This ↵
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "dora" && (
                <div className="space-y-3">
                  {[
                    {
                      name: "Lead Time to Merge",
                      badge: "DORA Metric",
                      desc: "Measures the duration from a developer's first commit until the PR is merged into the main branch. Lower values indicate faster code validation and deployment to production.",
                    },
                    {
                      name: "Time to First Review (TTFR)",
                      badge: "Speed Metric",
                      desc: "Initial response time from a reviewer once a PR is opened. A response under 4 hours minimizes context switching for the PR author.",
                    },
                    {
                      name: "PR Size Hygiene",
                      badge: "Code Quality",
                      desc: "Distribution of PR sizes: Small (<200 LoC), Medium (200-500 LoC), Large (>500 LoC). Small PRs yield a 3x higher bug detection rate during review.",
                    },
                    {
                      name: "Z-Score Deviation (σ)",
                      badge: "Anomaly Watcher",
                      desc: "Statistical anomaly detector. Deviations above +2.0σ signal abnormal spikes (e.g. PR reviews waiting >48h) that require team attention.",
                    },
                  ].map((m, idx) => (
                    <div key={idx} className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">{m.name}</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-700/50">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-zinc-500 font-mono">
                Press <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">Esc</kbd> to close
              </span>
              <button
                onClick={onCloseHelp}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-1.5 text-xs font-medium transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
