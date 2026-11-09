# ⚡ GitPulse Analytics

<p align="center">
  <b>🌐 <a href="README.md">English</a> | <a href="README.id.md">Bahasa Indonesia</a></b>
</p>

> **Platform Intelijen Developer & Analisis Repositori GitHub Berperforma Tinggi**  
> Menganalisis metrik DORA, kecepatan rekayasa perangkat lunak, dan linimasa kontributor secara universal untuk repositori publik GitHub apa pun di dunia.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-black?style=for-the-badge&logo=vercel)](https://frontend-theta-beige-69.vercel.app)
[![Design](https://img.shields.io/badge/Design-Awwwards%20SOTD%20Monochrome-black?style=for-the-badge)](DESIGN.md)
[![Next.js 15](https://img.shields.io/badge/Next.js%2015-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![DuckDB](https://img.shields.io/badge/DuckDB-Columnar%20Engine-FFF000?style=for-the-badge&logo=duckdb&logoColor=black)](https://duckdb.org)
[![GitHub Issues](https://img.shields.io/badge/GitHub%20Issues-8%20Resolved-success?style=for-the-badge&logo=github)](https://github.com/NAxel-code/gitpulse-analytics/issues?q=is%3Aissue+is%3Aclosed)

---

## 📸 Antarmuka Dashboard Produksi (Live Preview)

![GitPulse Analytics Live Production Dashboard](docs/images/dashboard-preview.png)
*Tampilan dashboard analitik live dengan estetika arsitektural monokrom Swiss Awwwards SOTD, identitas geometris telemetri minimalis, koreografi Framer Motion, dan indikator engineering DORA real-time.*

---

## 🌐 Arsitektur Universal & Fitur Utama

GitPulse Analytics dirancang dengan arsitektur **Universal Serverless + Hybrid Columnar Engine**, memungkinkan analisis repositori publik GitHub apa pun secara instan lintas berbagai sektor (AI/ML, Systems, DevOps, Web, Mobile) tanpa perlu konfigurasi database manual yang kompleks.

### 1. 🔍 Live GitHub Search Autocomplete & Universal Switcher
Pengguna dapat mencari dan menganalisis repositori open-source apa pun di dunia hanya dengan mengetik nama atau organisasi GitHub.
* **Debounced Live Autocomplete:** Rekomendasi repositori instan lengkap dengan jumlah bintang (*stars*), bahasa utama, dan deskripsi proyek.
* **Kategori Multi-Sektor:** Tab filter cepat untuk repositori unggulan lintas domain (*🤖 AI*, *🦀 Systems*, *⚙️ DevOps*, *🌐 Web*, *📱 Mobile*).

<p align="center">
  <img src="docs/images/universal-switcher.png" width="48%" alt="Universal Repository Switcher Modal" />
  <img src="docs/images/live-autocomplete.png" width="48%" alt="Live GitHub Autocomplete Search" />
</p>

### 2. 🏆 Live GitHub Trending & Global Benchmark Leaderboard
Instrumen komparasi teknik strategis untuk mengevaluasi velocity proyek dan momentum komunitas terhadap repositori open-source kelas dunia, didukung oleh web scraping langsung dari `github.com/trending` dan kueri dinamis GitHub Search API.
* **🔥 GitHub Trending Real-Time:** Integrasi langsung dari `https://github.com/trending` menyajikan *Trending Harian* (dengan indikator angka riil `+X stars today`) dan *Trending Mingguan*.
* **⚡ Pencarian Universal Semua Repositori GitHub:** Pencarian debounced live langsung ke GitHub Search API, mencari dan merangking repositori publik apa pun di dunia tanpa latensi.
* **Kategori Multi-Sektor & Lisensi:** Filter komparasi berdasarkan domain (*🤖 AI & ML*, *⚡ Web*, *⚙️ Cloud & DevOps*, *🦀 Systems*, *📱 Mobile*) dan lisensi standar industri (*MIT*, *Apache-2.0*, *BSD-3*, *GPL*).
* **Indikator Momentum & Kesehatan:** Mengukur *Community Stars*, *Health Score* (0–100), dan *Velocity Rating* (*Hyper Velocity*, *High Momentum*, *Steady*).
* **Analisis 1-Klik:** Muat langsung repositori pilihan dari leaderboard ke dashboard analitik utama.

<p align="center">
  <img src="docs/images/benchmark-leaderboard.png" width="75%" alt="Modal Live GitHub Trending & Benchmark Leaderboard" />
</p>

### 3. ⏱️ Metrik DORA & Kecepatan Rekayasa (Engineering Velocity)
* **Lead Time to Merge & Time to First Review (TTFR):** Memantau durasi sejak commit pertama hingga merge, serta respon awal reviewer.
* **PR Size Hygiene:** Menganalisis distribusi ukuran PR (Small <200 LoC, Medium, Large) untuk mencegah bottleneck code review.
* **DORA Anomaly Watcher:** Mendeteksi anomali pipeline (*stale PRs*, lonjakan issue, penurunan ritme deploy) menggunakan kalkulasi deviasi *Z-score*.

### 4. 📉 Corong Siklus PR (PR Lifecycle Funnel) & Deteksi Bottleneck
Corong konversi analitik 4 tahap (*PRs Created* $\rightarrow$ *Code Review Active* $\rightarrow$ *Changes Approved* $\rightarrow$ *Merged to Main*) yang secara proaktif menandai tahap drop-off kritis (>25%) beserta rekomendasi perbaikan workflow.

### 5. 🧭 Tur Interaktif (Spotlight Guided Tour) & Cheatsheet DORA
* **Zero-Blur SVG Cutout Mask:** Panduan visual interaktif 5 tahap yang menyorot komponen utama secara tajam dan jernih tanpa mengaburkan elemen target.
* **Pusat Dokumentasi Cepat (`?`):** Tekan tombol keyboard `?` kapan saja untuk membuka glosarium DORA, panduan kueri AI, dan daftar tombol pintas.

<p align="center">
  <img src="docs/images/spotlight-tour.png" width="75%" alt="Interactive Guided Tour with SVG Cutout" />
</p>

### 6. 💬 Natural Language Code Analytics (`⌘K` / `Ctrl+K`)
Kueri analitik dalam bahasa alami (misal: *"Top human contributors"* atau *"Distribusi status PR"*) yang dilindungi oleh validasi AST SQL (*sqlglot*) dan sistem intent detection otomatis.

<p align="center">
  <img src="docs/images/vllm-analysis.png" width="75%" alt="Live Repository Analysis" />
</p>

### 7. 🔌 Server Model Context Protocol (MCP)
Integrasi native dengan Claude Desktop, Cursor, dan AI coding assistant lainnya melalui protokol MCP untuk membaca metrik DORA, linimasa developer, dan bottleneck PR langsung via LLM tool calling.

---

## 📋 Catatan Masalah & Perbaikan (GitHub Issues Traceability)

Semua perbaikan dan peningkatan fitur terdokumentasi secara transparan pada issue tracker repositori:

| Issue | Kategori | Judul Masalah & Solusi | Commit | Status |
| :---: | :---: | :--- | :---: | :---: |
| [#1](https://github.com/NAxel-code/gitpulse-analytics/issues/1) | `feat` | **Interactive Guided Walkthrough Tour & DORA Cheatsheet:** Panduan onboarding 5 langkah dengan shortcut `?` dan popover pengenalan. | [`25bbff9`](https://github.com/NAxel-code/gitpulse-analytics/commit/25bbff9) | `CLOSED` |
| [#2](https://github.com/NAxel-code/gitpulse-analytics/issues/2) | `feat` | **Arbitrary Repository Switcher & AI Routing:** Menghilangkan batasan preset dan mendukung repositori publik apa saja di dunia. | [`a2fa8b7`](https://github.com/NAxel-code/gitpulse-analytics/commit/a2fa8b7) | `CLOSED` |
| [#3](https://github.com/NAxel-code/gitpulse-analytics/issues/3) | `fix` | **Activity Timeline Blank Chart Fix:** Mengatasi bug JSX fragment Recharts dan distorsi axis melalui gap filling time-series. | [`541a674`](https://github.com/NAxel-code/gitpulse-analytics/commit/541a674) | `CLOSED` |
| [#4](https://github.com/NAxel-code/gitpulse-analytics/issues/4) | `fix` | **Spotlight Backdrop Blur Cutout:** Mengganti CSS radial blur dengan dual-layer SVG cutout mask agar elemen yang disorot tetap tajam. | [`9d58db8`](https://github.com/NAxel-code/gitpulse-analytics/commit/9d58db8) | `CLOSED` |
| [#5](https://github.com/NAxel-code/gitpulse-analytics/issues/5) | `fix` | **100% Factual GitHub Data & Responsive Search Layout:** Menghapus data simulasi tiruan dan memperbaiki overflow kotak pencarian AI di viewport medium. | [`0862280`](https://github.com/NAxel-code/gitpulse-analytics/commit/0862280) | `CLOSED` |
| [#6](https://github.com/NAxel-code/gitpulse-analytics/issues/6) | `feat` | **Sector Benchmark Leaderboard:** Modal komparasi lintas sektor (AI, Systems, Cloud, Web, Mobile) dengan indikator stars, lisensi, dan velocity. | [`05af35e`](https://github.com/NAxel-code/gitpulse-analytics/commit/05af35e) | `CLOSED` |
| [#7](https://github.com/NAxel-code/gitpulse-analytics/issues/7) | `feat` | **Pure Next.js Universal Serverless Architecture & Live Autocomplete:** Migrasi engine DORA ke serverless route handlers Next.js dan live search. | [`72900f6`](https://github.com/NAxel-code/gitpulse-analytics/commit/72900f6) | `CLOSED` |
| [#8](https://github.com/NAxel-code/gitpulse-analytics/issues/8) | `feat` | **Awwwards SOTD Monochrome Redesign & Live Benchmark:** Rombak desain arsitektural Swiss monokrom, identitas logo geometris, koreografi Framer Motion, dan perbaikan live data parsing GitHub trending. | [`487e4de`](https://github.com/NAxel-code/gitpulse-analytics/commit/487e4de) | `CLOSED` |

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router, Serverless Edge Handlers), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Magic UI.
* **Serverless Intelligence Engine:** Native TypeScript GitHub Ingestor & DORA Calculator (`frontend/src/lib/github-serverless.ts`).
* **Backend Alternatif (Lokal/Self-Hosted):** FastAPI, Python 3.12, DuckDB Columnar OLAP, Pydantic, sqlglot AST Parser.
* **Integrasi AI:** Model Context Protocol (MCP) Server (`backend/app/mcp/server.py`).
* **Infrastruktur & Deployment:** Vercel Production Serverless ([Live URL](https://frontend-theta-beige-69.vercel.app)), Docker Multi-stage Builds (~95 MB).

---

## 🚀 Panduan Menjalankan

### Opsi 1: Menjalankan Frontend Serverless (Paling Ringkas)
Tidak memerlukan Python atau server database terpisah. Cukup Node.js 20+:

```bash
cd frontend
npm install
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### Opsi 2: Menjalankan Fullstack Lokal (Next.js + FastAPI + DuckDB)
```powershell
# Jalankan script otomasi PowerShell:
.\start_dev.ps1
```
* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Opsi 3: Menggunakan Docker Compose
```bash
docker compose up -d --build
```

---

## 🧪 Pengujian & Verifikasi Kualitas

Proyek ini dilengkapi test suite terotomasi dari unit level hingga Browser E2E:

```bash
# 1. Jalankan automated E2E browser tests (Playwright):
python tests/test_universal_repo_switch.py
python tests/test_leaderboard_flow.py

# 2. Jalankan test suite backend (pytest):
pytest -v backend/tests

# 3. Jalankan test suite frontend:
cd frontend && npm test
```

---

## 📄 Lisensi & Kontribusi

Proyek ini dilisensikan di bawah lisensi **MIT**. Kontribusi, pelaporan isu, dan saran perbaikan fitur sangat disambut melalui [GitHub Issues](https://github.com/NAxel-code/gitpulse-analytics/issues).
