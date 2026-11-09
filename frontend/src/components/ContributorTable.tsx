"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  Bot,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const isBotAccount = (login: string) => {
  const l = login.toLowerCase();
  return (
    l.includes("[bot]") ||
    l.endsWith("-bot") ||
    l.endsWith("_bot") ||
    l.startsWith("bot-") ||
    l.startsWith("bot_") ||
    l.includes("robot") ||
    l === "dependabot" ||
    l === "renovate" ||
    l === "k8s-ci-robot" ||
    l === "github-actions" ||
    l === "codecov" ||
    l === "snyk-bot" ||
    l === "greenkeeper" ||
    l === "stale"
  );
};

export interface ContributorItem {
  login: string;
  avatar_url: string;
  commits: number;
  prs_opened: number;
  prs_merged: number;
  issues_closed: number;
  lines_added: number;
  lines_deleted: number;
  velocity_score: number;
  rank?: number;
  rank_badge?: string;
  momentum_tag?: string;
}

interface ContributorTableProps {
  data: ContributorItem[];
  onSelectContributor?: (login: string) => void;
}

export function ContributorTable({
  data,
  onSelectContributor,
}: ContributorTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] =
    useState<keyof ContributorItem>("velocity_score");
  const [sortAsc, setSortAsc] = useState(false);
  const [excludeBots, setExcludeBots] = useState(true);

  const botCount = useMemo(
    () => data.filter((item) => isBotAccount(item.login)).length,
    [data]
  );

  const filtered = useMemo(() => {
    return data
      .filter((item) => {
        if (excludeBots && isBotAccount(item.login)) return false;
        return item.login.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA ?? "").localeCompare(String(valB ?? ""))
          : String(valB ?? "").localeCompare(String(valA ?? ""));
      });
  }, [data, search, sortField, sortAsc, excludeBots]);

  const handleSort = (field: keyof ContributorItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="border border-white/[0.08] bg-[#0c0c0e] p-6">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
            INDEX DIRECTORY
          </span>
          <h3 className="font-semibold text-white text-base mt-0.5 tracking-tight">
            Contributor Velocity Index
          </h3>
        </div>

        {/* Search & Bot Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setExcludeBots(!excludeBots)}
            className={`px-2.5 py-1 text-xs font-mono border transition cursor-pointer shrink-0 ${
              excludeBots
                ? "border-white/20 text-white bg-white/5"
                : "border-white/10 text-zinc-500 hover:text-zinc-300"
            }`}
            title="Toggle automated bots"
          >
            <span className="flex items-center gap-1.5">
              <Bot className="h-3 w-3" />
              <span>{excludeBots ? "Bots Hidden" : "All Accounts"}</span>
              {botCount > 0 && <span>({botCount})</span>}
            </span>
          </button>

          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-white/10 bg-black/40 pl-8 pr-3 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px] text-left text-xs font-mono">
          <thead className="border-b border-white/[0.08] text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[180px]">Developer</th>
              <th
                onClick={() => handleSort("commits")}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Commits</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort("prs_merged")}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>PRs Merged</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort("lines_added")}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Lines +/-</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort("velocity_score")}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Velocity</span>
                  <ArrowUpDown className="h-2.5 w-2.5 text-zinc-600" />
                </div>
              </th>
              <th className="py-2.5 px-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No contributors matching filter.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 10).map((dev, idx) => {
                const isBot = isBotAccount(dev.login);
                const displayRank = String(idx + 1).padStart(2, "0");

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectContributor?.(dev.login)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    title={`Inspect journey for @${dev.login}`}
                  >
                    <td className="py-3 px-3 text-center text-zinc-600 font-mono text-[11px]">
                      {displayRank}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <img
                          src={dev.avatar_url}
                          alt={dev.login}
                          className="h-5 w-5 rounded-full bg-zinc-800 object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all"
                        />
                        <span className="font-sans font-medium text-zinc-200 group-hover:text-white transition-colors truncate max-w-[150px]">
                          @{dev.login}
                        </span>
                        {isBot && (
                          <span className="text-[9px] text-zinc-600">
                            [BOT]
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white tabular-nums">
                      {formatNumber(dev.commits)}
                    </td>
                    <td className="py-3 px-3 text-center text-zinc-300 tabular-nums">
                      {formatNumber(dev.prs_merged)}
                    </td>
                    <td className="py-3 px-3 text-right text-[11px] tabular-nums">
                      <span className="text-zinc-300">+{formatNumber(dev.lines_added)}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-zinc-500">-{formatNumber(dev.lines_deleted)}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-zinc-100 tabular-nums">
                      {dev.velocity_score}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-white transition-colors inline" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
