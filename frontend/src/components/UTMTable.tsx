"use client";

import { useState } from "react";
import { Search, ArrowUpDown, Globe, Tag, ExternalLink } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface UTMItem {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  visitors: number;
  leads: number;
  purchases: number;
  conversion_rate: number;
  revenue: number;
  estimated_roas: number;
}

export function UTMTable({ data }: { data: UTMItem[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof UTMItem>("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = data
    .filter(
      (item) =>
        item.utm_source.toLowerCase().includes(search.toLowerCase()) ||
        item.utm_medium.toLowerCase().includes(search.toLowerCase()) ||
        item.utm_campaign.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const handleSort = (field: keyof UTMItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              UTM & Campaign Breakdown
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Atribusi performa multi-touch per Source, Medium, dan Campaign
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter source/campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="py-2.5 px-3">Channel / Source</th>
              <th className="py-2.5 px-3">Campaign</th>
              <th
                onClick={() => handleSort("visitors")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Visitors</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("leads")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Leads</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("conversion_rate")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Conv. %</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("revenue")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Revenue</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("estimated_roas")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Est. ROAS</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.slice(0, 10).map((row, idx) => {
              const isHighRoas = row.estimated_roas >= 3.0;

              return (
                <tr key={idx} className="hover:bg-zinc-800/40 transition">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <Globe className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="capitalize">{row.utm_source}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">/ {row.utm_medium}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-300">
                    {row.utm_campaign}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white tabular-nums">
                    {formatNumber(row.visitors)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-zinc-300">
                    {formatNumber(row.leads)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium text-zinc-200">
                      {row.conversion_rate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white tabular-nums">
                    {formatCurrency(row.revenue)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isHighRoas
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      {row.estimated_roas}x
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
