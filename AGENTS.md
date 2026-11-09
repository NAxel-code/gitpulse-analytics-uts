# AGENTS.md — GitPulse Analytics

> Single Source of Truth untuk AI Coding Agents saat mengimplementasikan fitur, bugfix, dan refactor pada GitPulse Analytics (GitHub Developer & Repository Intelligence Platform).

## Project Vision & Architecture
GitPulse Analytics adalah dashboard analitik developer, repository health, dan DORA metrics performa tinggi.
- Frontend: Next.js 15+ (App Router), React 19, Tailwind CSS v4 / modern utility, shadcn/ui, Magic UI (Number Ticker, Border Beam, Bento Grid), Lucide Icons, Recharts.
- Backend: Python FastAPI (asynchronous), Pydantic v2, DuckDB (columnar time-series embedded storage) / TimescaleDB (production container), Redis Stream.
- Ingestion: Real-time GitHub Webhooks (`/api/v1/github/webhook`) + GitHub API Syncer (`/api/v1/github/sync`).
- AI: Google GenAI SDK (Gemini API) untuk Text-to-Insight sandboxed SQL query & DORA Anomaly Detection.

## Critical Non-Negotiables & Gotchas
1. **React 19 & Client Components:**
   - Komponen chart interaktif (Recharts) dan animasi Magic UI WAJIB menyertakan directive `"use client";` di baris pertama.
2. **FastAPI & Async DuckDB:**
   - Koneksi DuckDB harus dikelola dengan aman dan non-blocking terhadap async loop FastAPI.
3. **Read-Only AI SQL AST Sandbox:**
   - Query SQL yang dihasilkan oleh LLM WAJIB divalidasi oleh AST parser (`sqlglot`). Hanya perbolehkan `SELECT` statement. Tolak keras `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, atau multi-statement.
4. **Data Isolation & Normalization:**
   - Kolom `repo_name` selalu disimpan dalam huruf kecil (lowercase) untuk konsistensi kueri multi-repo (`owner/repo`).

## Commands
- Frontend Dev: `npm run dev` (Port 3000)
- Backend Dev: `python -m uvicorn app.main:app --reload --port 8000`
- Run Backend Tests: `pytest -v`
