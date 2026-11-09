"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { ActivityChart } from "@/components/ActivityChart";
import { FunnelChart } from "@/components/FunnelChart";
import { ContributorTable } from "@/components/ContributorTable";
import { ContributorJourneyModal } from "@/components/ContributorJourneyModal";
import { DORAFeed } from "@/components/DORAFeed";
import { AIModal } from "@/components/AIModal";
import { HelpTourModal } from "@/components/HelpTourModal";
import { RepoLeaderboardModal } from "@/components/RepoLeaderboardModal";
import { SprintExportModal } from "@/components/SprintExportModal";
import { GitPulseLogo } from "@/components/GitPulseLogo";
import { GITHUB_API_URL } from "@/lib/api";
import { getFallbackDashboardData } from "@/lib/fallback";
import { Terminal, Database, Cpu, Command } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export default function GitPulseDashboard() {
  const [currentRepo, setCurrentRepo] = useState("vercel/next.js");
  const [days, setDays] = useState(14);
  const [githubToken, setGithubToken] = useState("");
  const [kpiData, setKpiData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [funnelPayload, setFunnelPayload] = useState<any>(null);
  const [contributors, setContributors] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load saved GitHub PAT from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("gitpulse_github_token");
      if (savedToken) {
        setGithubToken(savedToken);
      }
    } catch (e) {
      console.warn("Could not read localStorage for token:", e);
    }
  }, []);

  const handleTokenChange = (token: string) => {
    setGithubToken(token);
    try {
      if (token) {
        localStorage.setItem("gitpulse_github_token", token);
      } else {
        localStorage.removeItem("gitpulse_github_token");
      }
    } catch (e) {
      console.warn("Could not write localStorage token:", e);
    }
  };

  // Keyboard shortcut Cmd+K or Ctrl+K for AI modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsAIModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global shortcut '?' for Help & Documentation modal
  useEffect(() => {
    const handleHelpKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !isHelpModalOpen &&
        !isTourActive &&
        !isAIModalOpen &&
        !isJourneyModalOpen &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsHelpModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleHelpKeyDown);
    return () => window.removeEventListener("keydown", handleHelpKeyDown);
  }, [isHelpModalOpen, isTourActive, isAIModalOpen, isJourneyModalOpen]);

  const fetchData = async (targetRepo = currentRepo) => {
    try {
      const [kpiRes, timelineRes, funnelRes, contribRes, anomalyRes, summaryRes] = await Promise.all([
        fetch(`${GITHUB_API_URL}/overview?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/timeline?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/pr-funnel?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/contributors?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/anomalies?repo=${encodeURIComponent(targetRepo)}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/executive-summary?repo=${encodeURIComponent(targetRepo)}`).then((r) => r.json()),
      ]);

      // Use authentic real API responses directly from DuckDB & GitHub
      if (Array.isArray(timelineRes)) {
        setTimelineData(timelineRes);
      }
      if (kpiRes && typeof kpiRes === "object") {
        setKpiData(kpiRes);
      }
      if (Array.isArray(funnelRes)) {
        setFunnelData(funnelRes);
        setFunnelPayload(null);
      } else if (funnelRes && Array.isArray(funnelRes.stages)) {
        setFunnelData(funnelRes.stages);
        setFunnelPayload(funnelRes);
      }
      if (Array.isArray(contribRes)) {
        setContributors(contribRes);
      }
      if (Array.isArray(anomalyRes)) {
        setAnomalies(anomalyRes);
      }
      if (summaryRes && typeof summaryRes === "object") {
        setExecutiveSummary(summaryRes);
      }
    } catch (err) {
      console.warn("API unavailable, falling back to resilient preview dataset:", err);
      const fallback = getFallbackDashboardData(targetRepo, days);
      setKpiData(fallback.kpis);
      setTimelineData(fallback.timeline);
      setFunnelData(fallback.funnel);
      setContributors(fallback.contributors);
      setAnomalies(fallback.anomalies);
      setExecutiveSummary(fallback.executiveSummary);
    }
  };

  const handleSyncRepo = async (repoName: string) => {
    setSyncing(true);
    try {
      await fetch(`${GITHUB_API_URL}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: repoName,
          days: days,
          github_token: githubToken ? githubToken.trim() : undefined,
        }),
      });
      await fetchData(repoName);
    } catch (e) {
      console.error("Sync error:", e);
      await fetchData(repoName);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData(currentRepo);
  }, [currentRepo, days]);

  const handleOpenJourney = (login: string) => {
    setSelectedContributor(login);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navigation Header */}
      <Header
        currentRepo={currentRepo}
        onRepoChange={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onSyncRepo={handleSyncRepo}
        syncing={syncing}
        days={days}
        onDaysChange={(d) => setDays(d)}
        onOpenAI={() => setIsAIModalOpen(true)}
        githubToken={githubToken}
        onTokenChange={handleTokenChange}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Content Area */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8"
      >
        {/* Repository Overview Context */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6 border-b border-white/[0.08]"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono text-zinc-500">
              <span className="uppercase tracking-wider">TARGET REPOSITORY</span>
              <span>/</span>
              <span className="text-zinc-400">{days}D OBSERVATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white display-num">
              {currentRepo}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span>DuckDB Columnar</span>
            <span className="text-zinc-700">/</span>
            <span>Sub-second AST</span>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
        </motion.div>

        {/* Primary Monolithic Metric Strip */}
        <motion.div variants={itemVariants} id="tour-kpi-cards">
          <KPICards key={currentRepo} data={kpiData} />
        </motion.div>

        {/* Middle Section: Activity Timeline (65%) vs PR Lifecycle Funnel (35%) */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div
            id="section-activity"
            className="lg:col-span-8 scroll-mt-28"
          >
            <ActivityChart
              data={timelineData}
              repoName={currentRepo}
              onSync={() => handleSyncRepo(currentRepo)}
              isSyncing={syncing}
            />
          </div>
          <div
            id="tour-pr-funnel"
            className="lg:col-span-4 scroll-mt-28 h-full"
          >
            <FunnelChart stages={funnelData} payload={funnelPayload} />
          </div>
        </motion.div>

        {/* Bottom Section: Contributor Table (65%) vs DORA Feed (35%) */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div
            id="tour-contributors"
            className="lg:col-span-8 scroll-mt-28"
          >
            <ContributorTable
              data={contributors}
              onSelectContributor={handleOpenJourney}
            />
          </div>
          <div
            id="section-dora-feed"
            className="lg:col-span-4 scroll-mt-28"
          >
            <DORAFeed
              alerts={anomalies}
              summary={executiveSummary}
              contributors={contributors}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          </div>
        </motion.div>

        {/* Minimalist Four-Corners Footer */}
        <motion.footer
          variants={itemVariants}
          className="pt-8 pb-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500"
        >
          <div className="flex items-center gap-3">
            <GitPulseLogo size={20} />
            <span className="text-white font-bold font-mono">GITPULSE</span>
            <span className="text-zinc-700">/</span>
            <span>DuckDB Embedded Storage</span>
            <span className="text-zinc-700">/</span>
            <span>AST Query Sandbox</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <span>Press <kbd className="text-zinc-300 font-bold border border-white/[0.1] bg-white/[0.04] px-1 py-0.5">⌘K</kbd> to query</span>
            <span>·</span>
            <span>Press <kbd className="text-zinc-300 font-bold border border-white/[0.1] bg-white/[0.04] px-1 py-0.5">?</kbd> for documentation</span>
          </div>
        </motion.footer>
      </motion.main>

      {/* Contributor Action Stream Journey Modal */}
      <ContributorJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        login={selectedContributor}
        repoName={currentRepo}
      />

      {/* AI Text-to-Insight Modal */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentRepo={currentRepo}
        onViewJourney={handleOpenJourney}
        onRepoChange={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onSyncRepo={handleSyncRepo}
      />

      {/* Interactive Guided Tour & Feature Help Modal */}
      <HelpTourModal
        isHelpOpen={isHelpModalOpen}
        onCloseHelp={() => setIsHelpModalOpen(false)}
        isTourActive={isTourActive}
        onStartTour={() => setIsTourActive(true)}
        onCloseTour={() => setIsTourActive(false)}
        onSelectRepo={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onOpenAI={() => setIsAIModalOpen(true)}
      />

      {/* Benchmark Repository Leaderboard Modal */}
      <RepoLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentRepo={currentRepo}
        onSelectRepo={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
      />

      {/* Engineering Sprint Brief Export & Share Modal */}
      <SprintExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        repoName={currentRepo}
        days={days}
        kpiData={kpiData}
        contributors={contributors}
        executiveSummary={executiveSummary}
      />
    </div>
  );
}
