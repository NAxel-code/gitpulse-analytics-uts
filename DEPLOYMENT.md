# GitPulse Analytics — $0/Month & Production Deployment Architecture

> **Filosofi Inti:** *Zero-Bloat, Zero-Waste, Zero AI-Slop.*  
> *"Most founders overbuild on day one. They set up infrastructure for 10 million users when they have 10. You need a real product online, people using it, and a bill that stays at $0 until you have revenue."*

---

## 1. Arsitektur Infrastruktur $0/Bulan vs Tradisional

| Layer | Solusi Tradisional (Over-engineered) | Solusi GitPulse (Zero-Cost & Lean) | Penghematan Biaya |
| :--- | :--- | :--- | :--- |
| **Frontend** | AWS Amplify / ECS Fargate ($20+/bln) | **Cloudflare Pages / Vercel Hobby** (Unlimited bandwidth, automated CI/CD) | **$0/bln** |
| **Backend API** | AWS ECS / EKS Cluster ($70+/bln) | **Fly.io / Render / Hetzner VPS / Docker Single-Node** | **$0/bln** |
| **Database** | Managed RDS Postgres + TimescaleDB ($30 - $65/bln) | **Embedded Columnar DuckDB** (Single-file time-series di storage lokal / persistent volume) | **$0/bln** (Hemat ~$50/bln) |
| **Cache & Queue** | Managed ElastiCache Redis ($25/bln) | **In-Memory Buffer Ring & Fast DuckDB Ingestion** | **$0/bln** (Hemat $25/bln) |
| **Auth & Rate Limit** | SaaS Auth0 / Clerk ($25+/bln setelah batas gratis) | **Client-side GitHub PAT Persistence + Better-Auth/OAuth** | **$0/bln** |
| **Total Estimasi** | **~$170 - $250 / bulan** | **$0 / bulan** | **100% Bebas Biaya** |

---

## 2. Docker Progression Levels (Multi-Stage Containerization)

Mengikuti standar modern kontainerisasi, GitPulse menyediakan setup Docker yang efisien:

### A. Level 3 Multi-Stage Frontend (`frontend/Dockerfile`)
Menggunakan fitur `output: 'standalone'` Next.js 15 dengan pemisahan 3 tahap build:
1. `deps`: Mengisolasi cache `package-lock.json` dan dependency `npm ci`.
2. `builder`: Mengkompilasi JSX/TypeScript dan memangkas dependency yang tidak digunakan.
3. `runner`: Menggunakan image minimal `node:20-alpine` non-root user.
- **Hasil:** Ukuran image terpangkas dari **~1.2 GB** menjadi hanya **~95 MB**.

### B. Lightweight Backend Container (`backend/Dockerfile`)
- Base image: `python:3.12-slim`
- Persistensi data: Mount direktori `./backend/data` ke `/app/data` agar database time-series DuckDB tetap awet saat container di-restart.

### C. Satu Perintah Deployment Lokal / VPS (`docker-compose.yml`)
Tanpa perlu menginstal Node.js atau Python secara manual di server target:

```bash
docker compose up -d
```
- Frontend aktif di `http://localhost:3000`
- Backend API aktif di `http://localhost:8000`
- Volume database tersimpan aman di `./backend/data/omnipulse.duckdb`

---

## 3. Opsi Deployment Cloud $0/Bulan (Step-by-Step)

### Opsi A: Split Cloud (Frontend di Cloudflare + Backend di Render/Fly)
1. **Frontend (Cloudflare Pages):**
   - Hubungkan repositori GitHub ke Cloudflare Pages.
   - Build command: `cd frontend && npm install && npm run build`
   - Output directory: `frontend/.next`
   - Environment variable: `NEXT_PUBLIC_API_URL=https://api.domain-anda.com/api/v1/github`
2. **Backend (Fly.io / Render Web Service):**
   - Deploy direktori `backend/` menggunakan `backend/Dockerfile`.
   - Pasang persistent volume mount sebesar 1 GB untuk `/app/data`.

### Opsi B: Single-Node VPS ($0 - $4/Bulan)
Jika memiliki server mini VPS (Hetzner, Oracle Cloud Always Free, DigitalOcean):
```bash
git clone https://github.com/NAxel-code/gitpulse-analytics.git
cd gitpulse-analytics
docker compose up -d --build
```
Selesai! Kedua service langsung terorkestrasi dengan healthcheck otomatis.
