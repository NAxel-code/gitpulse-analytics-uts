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
import { BarChart3 } from "lucide-react";

interface TrafficPoint {
  time_bucket: string;
  page_views: number;
  unique_visitors: number;
  conversions: number;
  conversion_value: number;
}

export function TrafficChart({ data }: { data: TrafficPoint[] }) {
  const [metric, setMetric] = useState<"traffic" | "revenue">("traffic");

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: d.time_bucket.slice(5), // 'MM-DD'
  }));

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              Traffic Volume vs Conversion Events
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tren harian pengunjung unik dan konversi teratribusi
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 self-start">
          <button
            onClick={() => setMetric("traffic")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              metric === "traffic"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Visitors & Conversions
          </button>
          <button
            onClick={() => setMetric("revenue")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              metric === "revenue"
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Revenue ($)
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderRadius: "0.5rem",
                color: "#f4f4f5",
                fontSize: "12px",
              }}
            />
            {metric === "traffic" && (
              <Area
                type="monotone"
                dataKey="unique_visitors"
                name="Unique Visitors"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
            )}
            {metric === "traffic" && (
              <Area
                type="monotone"
                dataKey="conversions"
                name="Conversions"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorConversions)"
              />
            )}
            {metric === "revenue" && (
              <Area
                type="monotone"
                dataKey="conversion_value"
                name="Revenue ($)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
