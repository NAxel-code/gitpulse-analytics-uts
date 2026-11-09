import { NextRequest, NextResponse } from "next/server";
import {
  fetchRawGitHubData,
  computeKPISummary,
  computeActivityTimeline,
  computePRFunnel,
  computeContributors,
  computeContributorJourney,
  computeAnomalies,
  computeExecutiveSummary,
  KNOWN_REPOS,
} from "@/lib/github-serverless";
import {
  fetchGitHubTrending,
  fetchGitHubSearchLeaderboard,
  RepoLeaderboardItem,
} from "@/lib/leaderboard-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const endpoint = slug?.[0];
  const { searchParams } = new URL(request.url);

  const repo = searchParams.get("repo") || "vercel/next.js";
  const days = parseInt(searchParams.get("days") || "14", 10);
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  try {
    // 1. Search Repositories Autocomplete (Live GitHub Search)
    if (endpoint === "search") {
      const q = searchParams.get("q") || "";
      if (!q.trim()) {
        return NextResponse.json({ items: [] });
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitPulse-Analytics-Search",
      };
      if (token && token.trim()) {
        headers.Authorization = `Bearer ${token.trim()}`;
      }

      const ghRes = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(q.trim())}&per_page=8`,
        { headers }
      );
      if (!ghRes.ok) {
        const qClean = q.toLowerCase();
        const fallbackItems = Object.entries(KNOWN_REPOS)
          .filter(
            ([name, info]) =>
              name.includes(qClean) ||
              info.description.toLowerCase().includes(qClean) ||
              info.language.toLowerCase().includes(qClean)
          )
          .map(([name, info]) => ({
            full_name: name,
            description: info.description,
            stars: info.stars,
            stars_formatted:
              info.stars > 1000 ? `${(info.stars / 1000).toFixed(1)}k` : `${info.stars}`,
            language: info.language,
            license: info.license,
            avatar_url: `https://github.com/${name.split("/")[0]}.png`,
          }));
        return NextResponse.json({ items: fallbackItems });
      }
      const data = await ghRes.json();
      const items = (data.items || []).map((r: any) => ({
        full_name: r.full_name,
        description: r.description || "No description provided",
        stars: r.stargazers_count,
        stars_formatted: r.stargazers_count > 1000 ? `${(r.stargazers_count / 1000).toFixed(1)}k` : `${r.stargazers_count}`,
        language: r.language || "Unknown",
        license: r.license?.spdx_id || r.license?.name || "No License",
        avatar_url: r.owner?.avatar_url || "https://avatars.githubusercontent.com/u/583231?v=4",
      }));
      return NextResponse.json({ items });
    }

    // 2. Dynamic Benchmark Leaderboard (Live GitHub Trending & GitHub Search API)
    if (endpoint === "leaderboard") {
      const category = searchParams.get("category") || "all";
      const timeframe = (searchParams.get("timeframe") || "daily") as "daily" | "weekly" | "monthly";
      const q = searchParams.get("query") || "";
      const license = searchParams.get("license_filter") || "all";
      const sortBy = searchParams.get("sort_by") || "stars";

      let items: RepoLeaderboardItem[] = [];

      try {
        if (q && q.trim()) {
          // Live query across all repositories from GitHub Search API
          items = await fetchGitHubSearchLeaderboard({
            category,
            query: q.trim(),
            licenseFilter: license,
            sortBy,
            token,
          });
        } else if (category === "trending" || (timeframe === "daily" && category === "all")) {
          // Live trending from https://github.com/trending
          items = await fetchGitHubTrending("daily");
        } else if (category === "trending_weekly" || (timeframe === "weekly" && category === "all")) {
          items = await fetchGitHubTrending("weekly");
        } else {
          // Live query from GitHub Search API
          items = await fetchGitHubSearchLeaderboard({
            category,
            query: "",
            licenseFilter: license,
            sortBy,
            token,
          });
        }
      } catch (err) {
        console.warn("[Leaderboard Engine Warning]:", err);
        try {
          items = await fetchGitHubTrending("daily");
        } catch (trendingErr) {
          console.error("[Leaderboard Engine Error]:", trendingErr);
        }
      }

      return NextResponse.json(items);
    }

    // 3. Fetch raw data from GitHub API / Cache
    const rawData = await fetchRawGitHubData(repo, days, token);

    // 4. Dispatch to specific sub-endpoint
    if (endpoint === "overview") {
      const kpis = computeKPISummary(rawData, days);
      return NextResponse.json(kpis);
    }

    if (endpoint === "timeline") {
      const timeline = computeActivityTimeline(rawData, days);
      return NextResponse.json(timeline);
    }

    if (endpoint === "pr-funnel") {
      const funnel = computePRFunnel(rawData);
      return NextResponse.json(funnel);
    }

    if (endpoint === "contributors") {
      const contribs = computeContributors(rawData);
      return NextResponse.json(contribs);
    }

    if (endpoint === "contributor-journey") {
      const login = searchParams.get("login") || "contributor";
      const journey = computeContributorJourney(rawData, login);
      return NextResponse.json(journey);
    }

    if (endpoint === "anomalies") {
      const anomalies = computeAnomalies(rawData);
      return NextResponse.json(anomalies);
    }

    if (endpoint === "executive-summary") {
      const kpis = computeKPISummary(rawData, days);
      const summary = computeExecutiveSummary(rawData, kpis);
      return NextResponse.json(summary);
    }

    // Fallback: full summary
    const kpis = computeKPISummary(rawData, days);
    return NextResponse.json(kpis);
  } catch (error: any) {
    console.error(`[Serverless GitHub Error] /api/github/${endpoint}:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to process GitHub analytics" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const endpoint = slug?.[0];

  try {
    const body = await request.json().catch(() => ({}));
    const repo = body.repo_name || "vercel/next.js";
    const days = body.days || 14;
    const token = body.github_token;

    if (endpoint === "sync") {
      // Force refresh by bypassing cache timestamp
      const rawData = await fetchRawGitHubData(repo, days, token);
      const eventCount = rawData.commits.length + rawData.pulls.length + rawData.issues.length;

      return NextResponse.json({
        status: "success",
        repo_name: repo,
        synced_events: eventCount,
        message: `Berhasil mensinkronisasi ${eventCount} event developer untuk ${repo}`,
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[Serverless GitHub POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync repository" },
      { status: 500 }
    );
  }
}
