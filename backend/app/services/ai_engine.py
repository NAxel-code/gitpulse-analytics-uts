import os
import re
import time
import logging
from typing import Dict, Any, List, Optional, Tuple
import sqlglot
from sqlglot import exp
from app.core.config import settings
from app.services.storage import get_storage

logger = logging.getLogger("omnipulse.ai")

class AIEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")

    def validate_sql(self, sql_query: str) -> bool:
        """AST Sanitizer: Ensures query is strictly a single SELECT statement and safe."""
        cleaned = sql_query.strip().rstrip(";")
        try:
            parsed = sqlglot.parse(cleaned)
            if not parsed or len(parsed) != 1:
                return False
            
            expression = parsed[0]
            if not isinstance(expression, exp.Select):
                return False
                
            for node in expression.walk():
                if isinstance(node, (exp.Drop, exp.Delete, exp.Insert, exp.Update, exp.Alter, exp.Command)):
                    return False
            
            return True
        except Exception as e:
            logger.warning(f"SQL validation error: {e}")
            lower = cleaned.lower()
            if not lower.startswith("select"):
                return False
            forbidden = ["drop", "delete", "insert", "update", "alter", "create", "truncate", "--", ";"]
            for term in forbidden:
                if re.search(r'\b' + term + r'\b', lower):
                    return False
            return True

    def _detect_special_intent(self, query: str, repo_name: str) -> Optional[Dict[str, Any]]:
        """Handles developer entity search and command palette shortcuts."""
        q = query.strip()
        repo_filter = repo_name.lower()
        storage = get_storage()

        # 1. Command Palette: Sync shortcut
        if re.match(r'^(sync|sinkron|refresh)$', q, re.IGNORECASE):
            return {
                "generated_sql": f"-- COMMAND: SYNC REPO {repo_name}",
                "summary": f"Command recognized: Sync repository '{repo_name}' directly with GitHub API.",
                "chart_type": "command_action",
                "chart_data": [],
                "action": {
                    "type": "sync",
                    "repo": repo_name,
                    "label": f"Sync {repo_name} Now"
                }
            }

        # 2. Command Palette: Switch repo shortcut or direct "owner/repo" input
        switch_match = re.match(r'^(?:(?:switch|ganti|pindah|analisis)(?:\s+repo)?\s+)?([a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+)$', q, re.IGNORECASE)
        if not switch_match:
            switch_match = re.match(r'^(?:switch|ganti|pindah)(?:\s+repo)?\s+([a-zA-Z0-9_\-\.\/]+)$', q, re.IGNORECASE)

        if switch_match:
            raw_target = switch_match.group(1).strip()
            # Normalize preset names
            target_repo = raw_target
            if "/" not in raw_target:
                if "next" in raw_target.lower():
                    target_repo = "vercel/next.js"
                elif "react" in raw_target.lower():
                    target_repo = "facebook/react"
                elif "tailwind" in raw_target.lower():
                    target_repo = "tailwindlabs/tailwindcss"

            return {
                "generated_sql": f"-- COMMAND: SWITCH REPO TO {target_repo}",
                "summary": f"Command recognized: Switch target repository to '{target_repo}'.",
                "chart_type": "command_action",
                "chart_data": [],
                "action": {
                    "type": "switch_repo",
                    "target": target_repo,
                    "label": f"Switch to {target_repo}"
                }
            }

        # 3. Developer / Contributor Entity Search
        # Matches @handle, "user handle", "profil handle", or single word usernames like "Naxel-code", "sokra"
        is_user_search = False
        target_login = None

        if q.startswith("@"):
            is_user_search = True
            target_login = q.lstrip("@").strip()
        elif re.match(r'^(?:profil|user|developer|kontributor)\s+([a-zA-Z0-9_\-]+)$', q, re.IGNORECASE):
            m = re.match(r'^(?:profil|user|developer|kontributor)\s+([a-zA-Z0-9_\-]+)$', q, re.IGNORECASE)
            is_user_search = True
            target_login = m.group(1).strip()
        elif re.match(r'^[a-zA-Z0-9_\-]+$', q) and not re.match(r'^(?:top|pr|prs|commit|commits|trend|status|summary|code|help|sync)$', q, re.IGNORECASE):
            is_user_search = True
            target_login = q.strip()

        if is_user_search and target_login:
            clean_login = target_login.lower()
            sql = f"""
                SELECT actor_login,
                       MAX(actor_avatar) as avatar_url,
                       SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as commits,
                       COUNT(CASE WHEN event_type = 'pull_request' AND pr_status = 'merged' THEN 1 END) as prs_merged,
                       COUNT(CASE WHEN event_type = 'pull_request' AND (pr_status != 'merged' OR pr_status IS NULL) THEN 1 END) as prs_open,
                       SUM(lines_added) as lines_added,
                       SUM(lines_deleted) as lines_deleted
                FROM github_events
                WHERE repo_name = '{repo_filter}' AND LOWER(actor_login) = '{clean_login}'
                GROUP BY actor_login
            """
            rows = storage.execute_readonly_sql(sql)
            
            # If no exact match, try substring match
            if not rows:
                fallback_sql = f"""
                    SELECT actor_login,
                           MAX(actor_avatar) as avatar_url,
                           SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as commits,
                           COUNT(CASE WHEN event_type = 'pull_request' AND pr_status = 'merged' THEN 1 END) as prs_merged,
                           COUNT(CASE WHEN event_type = 'pull_request' AND (pr_status != 'merged' OR pr_status IS NULL) THEN 1 END) as prs_open,
                           SUM(lines_added) as lines_added,
                           SUM(lines_deleted) as lines_deleted
                    FROM github_events
                    WHERE repo_name = '{repo_filter}' AND LOWER(actor_login) LIKE '%{clean_login}%'
                    GROUP BY actor_login
                    LIMIT 1
                """
                rows = storage.execute_readonly_sql(fallback_sql)

            if rows:
                dev = rows[0]
                login = dev.get("actor_login", target_login)
                commits = dev.get("commits", 0)
                prs_merged = dev.get("prs_merged", 0)
                added = dev.get("lines_added", 0)
                deleted = dev.get("lines_deleted", 0)

                summary = (
                    f"Found profile @{login} in repository {repo_name}: "
                    f"Recorded {commits} commits, {prs_merged} PRs merged, "
                    f"and +{added:,} / -{deleted:,} lines of code."
                )
                return {
                    "generated_sql": sql.strip(),
                    "summary": summary,
                    "chart_type": "developer_profile",
                    "chart_data": rows,
                    "action": {
                        "type": "view_journey",
                        "login": login,
                        "label": f"Open Action Journey @{login}"
                    }
                }
            else:
                # 1. Check if this developer has events in another repository in DuckDB
                other_repo_sql = f"""
                    SELECT repo_name, COUNT(*) as cnt
                    FROM github_events
                    WHERE LOWER(actor_login) = '{clean_login}'
                    GROUP BY repo_name
                    ORDER BY cnt DESC
                    LIMIT 1
                """
                other_rows = storage.execute_readonly_sql(other_repo_sql)
                if other_rows:
                    other_repo = other_rows[0]["repo_name"]
                    summary = (
                        f"User '@{target_login}' has no recorded events in '{repo_name}', "
                        f"but was found active in repository '{other_repo}' ({other_rows[0]['cnt']} events)."
                    )
                    return {
                        "generated_sql": other_repo_sql.strip(),
                        "summary": summary,
                        "chart_type": "not_found",
                        "chart_data": [],
                        "action": {
                            "type": "switch_repo",
                            "target": other_repo,
                            "label": f"Switch to {other_repo}"
                        }
                    }

                # 2. Check if developer matches project author (e.g. NAxel-code)
                if clean_login in ["naxel-code", "naxel", "naxelcode"]:
                    target_repo_suggestion = "NAxel-code/gitpulse-analytics"
                    summary = (
                        f"User '@{target_login}' is the creator of GitPulse, "
                        f"while the repository currently analyzed above is '{repo_name}'. "
                        f"Click below to switch and analyze '{target_repo_suggestion}'."
                    )
                    return {
                        "generated_sql": sql.strip(),
                        "summary": summary,
                        "chart_type": "not_found",
                        "chart_data": [],
                        "action": {
                            "type": "switch_repo",
                            "target": target_repo_suggestion,
                            "label": f"Analyze {target_repo_suggestion}"
                        }
                    }

                # 3. Active developers recommendation for better UX
                active_devs_sql = f"""
                    SELECT DISTINCT actor_login
                    FROM github_events
                    WHERE repo_name = '{repo_filter}'
                      AND actor_login NOT LIKE '%[bot]%'
                      AND actor_login NOT LIKE 'github-actions%'
                    LIMIT 3
                """
                active_rows = storage.execute_readonly_sql(active_devs_sql)
                suggestions = [r["actor_login"] for r in active_rows if "actor_login" in r]
                suggestion_text = f" Active contributors in this repository include: {', '.join(['@' + s for s in suggestions])}." if suggestions else ""

                summary = (
                    f"User '@{target_login}' has no recorded commits or PRs in repository {repo_name} in current data.{suggestion_text}"
                )
                return {
                    "generated_sql": sql.strip(),
                    "summary": summary,
                    "chart_type": "not_found",
                    "chart_data": [],
                    "action": {
                        "type": "suggest_sync",
                        "repo": repo_name,
                        "label": f"Sync latest data for {repo_name}"
                    }
                }

        return None

    def _generate_heuristic_sql(self, query: str, repo_name: str = "vercel/next.js") -> Tuple[str, str, str]:
        """Smart fallback query generator using precise regex word boundary matching."""
        q = query.lower()
        repo_filter = repo_name.lower()

        # 1. Top Contributors (Filters out automated bots for clean signal)
        if re.search(r'\b(contributor|kontributor|siapa|top|leaderboard|paling aktif|developer)\b', q):
            sql = f"""
                SELECT actor_login, 
                       SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as total_commits,
                       COUNT(CASE WHEN event_type = 'pull_request' AND pr_status = 'merged' THEN 1 END) as prs_merged,
                       SUM(lines_added) as lines_added
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                  AND actor_login NOT LIKE '%[bot]%'
                  AND actor_login NOT LIKE 'github-actions%'
                GROUP BY actor_login
                ORDER BY total_commits DESC
                LIMIT 5
            """
            chart_type = "bar"
            summary = f"Top 5 active human contributors in repository {repo_name} (bots excluded) by commit and PR merge volume."

        # 2. Pull Request Status & Conversion
        elif re.search(r'\b(pr|prs|pull\s*request|merge|merging|rasio\s*pr|status\s*pr)\b', q):
            sql = f"""
                SELECT COALESCE(pr_status, 'in_review') as pr_status, COUNT(*) as total_count
                FROM github_events
                WHERE repo_name = '{repo_filter}' AND event_type = 'pull_request'
                GROUP BY pr_status
                ORDER BY total_count DESC
            """
            chart_type = "bar"
            summary = "Pull Request status distribution: ratio between merged, in-review, and opened PRs."

        # 3. Daily Timeline Trends
        elif re.search(r'\b(trend|tren|harian|activity|aktivitas|grafik|timeline)\b', q):
            sql = f"""
                SELECT strftime(time, '%Y-%m-%d') as date,
                       SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as commits,
                       COUNT(CASE WHEN event_type = 'pull_request' THEN 1 END) as prs
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY date
                ORDER BY date ASC
                LIMIT 14
            """
            chart_type = "line"
            summary = f"Daily commit and PR activity fluctuation trends in {repo_name} over the last 14 days."

        # 4. Code Churn & Volume (Strict word boundary: ignores 'Naxel-code')
        elif re.search(r'\b(code\s*churn|baris\s*kode|lines|loc|volume\s*kode|churn)\b', q):
            sql = f"""
                SELECT actor_login,
                       SUM(lines_added) as additions,
                       SUM(lines_deleted) as deletions
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                  AND actor_login NOT LIKE '%[bot]%'
                GROUP BY actor_login
                ORDER BY additions DESC
                LIMIT 6
            """
            chart_type = "bar"
            summary = "Code churn volume (Lines Added vs Lines Deleted) by top contributors (excluding automated bots)."

        # 5. Default General Aggregation
        else:
            sql = f"""
                SELECT event_type, COUNT(*) as event_count
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY event_type
                ORDER BY event_count DESC
            """
            chart_type = "bar"
            summary = f"Aggregate summary of all development event activities for repository {repo_name}."

        return sql.strip(), chart_type, summary

    async def query_insight(self, prompt: str, repo_name: str = "vercel/next.js") -> Dict[str, Any]:
        """Translates user natural language prompt into safe SQL query and actionable insight."""
        start_time = time.time()
        
        # Priority 1: Check special entity search (e.g. username lookup or command shortcut)
        special_result = self._detect_special_intent(prompt, repo_name)
        if special_result:
            exec_time = int((time.time() - start_time) * 1000)
            return {
                "query": prompt,
                "generated_sql": special_result["generated_sql"],
                "summary": special_result["summary"],
                "chart_type": special_result["chart_type"],
                "chart_data": special_result["chart_data"],
                "confidence": 0.98,
                "execution_time_ms": exec_time,
                "action": special_result.get("action")
            }

        generated_sql = None
        summary = None
        chart_type = "bar"
        action = None

        # Priority 2: Use LLM if configured
        if self.client:
            try:
                system_instruction = f"""
                You are an expert GitHub analytics engineer querying a DuckDB database.
                Table name is `github_events` with schema:
                time TIMESTAMP, event_id VARCHAR, repo_name VARCHAR, event_type VARCHAR (push, pull_request, issues, watch),
                actor_login VARCHAR, actor_avatar VARCHAR, commit_count INT, pr_status VARCHAR (opened, in_review, approved, merged),
                issue_status VARCHAR (opened, closed), lines_added INT, lines_deleted INT.
                
                Current repository focus is: '{repo_name}'. Exclude bots (actor_login NOT LIKE '%[bot]%') when analyzing top developers.
                Respond in valid JSON only with keys:
                "sql": string containing ONLY a single read-only SELECT statement with a LIMIT clause (max 50).
                "chart_type": "bar" | "line" | "table",
                "summary": string explaining the developer insight in Indonesian.
                """
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=f"{system_instruction}\nUser Question: {prompt}",
                )
                text = response.text.strip()
                import json
                clean_json = re.sub(r'^```json\s*|\s*```$', '', text, flags=re.MULTILINE)
                data = json.loads(clean_json)
                candidate_sql = data.get("sql", "")
                if self.validate_sql(candidate_sql):
                    generated_sql = candidate_sql
                    summary = data.get("summary", "")
                    chart_type = data.get("chart_type", "bar")
            except Exception as e:
                logger.warning(f"Gemini API inference error, falling back to heuristic engine: {e}")

        # Priority 3: Fallback heuristic engine
        if not generated_sql:
            generated_sql, chart_type, summary = self._generate_heuristic_sql(prompt, repo_name)

        if not self.validate_sql(generated_sql):
            generated_sql = f"SELECT actor_login, COUNT(*) as events FROM github_events WHERE repo_name = '{repo_name.lower()}' GROUP BY actor_login LIMIT 5"
            summary = "Query disesuaikan ke standar read-only aman."

        storage = get_storage()
        try:
            chart_data = storage.execute_readonly_sql(generated_sql)
        except Exception as e:
            logger.error(f"Error executing generated SQL: {e}")
            chart_data = []
            summary = f"Kueri dihasilkan namun gagal dieksekusi: {e}"

        exec_time = int((time.time() - start_time) * 1000)

        return {
            "query": prompt,
            "generated_sql": generated_sql,
            "summary": summary,
            "chart_type": chart_type,
            "chart_data": chart_data,
            "confidence": 0.96 if self.client else 0.92,
            "execution_time_ms": exec_time,
            "action": action
        }

ai_engine = AIEngine()
