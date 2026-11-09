# ⚡ GitPulse Analytics — Cloud Native Multi-Tier Telemetry Platform

> **Ujian Tengah Semester (UTS) — COMP6991031 Cloud Services**  
> **Program Studi:** Computer Science / Teknik Informatika — BINUS University  
> **Kategori Projek:** Web Application (Cloud, DevOps & Engineering Intelligence)  
> **Repository GitHub:** [https://github.com/NAxel-code/gitpulse-analytics-uts](https://github.com/NAxel-code/gitpulse-analytics-uts)  
> **Artikel Publik:** *[Tautan Artikel Dev.to / Medium / Hashnode]*  
> **Video Demo YouTube:** *[Tautan Video Demo YouTube (3–5 Menit)]*

---

## 📌 1. Profil & Alasan Pemilihan Projek

### a. Deskripsi Projek & Masalah yang Diselesaikan
Dalam rekayasa perangkat lunak modern dan praktik Cloud/DevOps, visibilitas terhadap kecepatan pengiriman kode (*software delivery velocity*), stabilitas rilis, dan kesehatan repositori sering kali terfragmentasi. Tim rekayasa kesulitan memantau metrik standar industri seperti **DORA Metrics** (*Lead Time for Changes*, *Deployment Frequency*, *Time to First Review*, *PR Cycle Hygiene*) secara real-time dan terpusat.

**GitPulse Analytics** menyelesaikan masalah tersebut dengan menyediakan platform intelijen dan telemetri repositori GitHub universal. Platform ini mengumpulkan aktivitas commit, pull request, dan issue secara otomatis, menyajikan visualisasi analitik interaktif, serta menyimpan riwayat repositori yang dipantau ke dalam basis data persisten.

### b. Target Pengguna
1. **Software Engineering Leads & Tech Managers:** Memantau ritme kerja tim, mendeteksi hambatan (*bottleneck*) dalam proses code review, dan memastikan efisiensi delivery pipeline.
2. **Cloud/DevOps Engineers:** Mengukur stabilitas deployment, lead time integrasi, dan pola rilis.
3. **Open-Source Contributors & Maintainers:** Membandingkan momentum repositori dan mengidentifikasi anomali kontribusi.

### c. Fitur Inti (Minimum Viable Product / MVP)
1. **Interactive DORA Telemetry & Activity Dashboard:** Visualisasi real-time metrik DORA (Lead Time to Merge, PR Lifecycle Funnel, Time to First Review).
2. **Universal Repository Switcher & Autocomplete:** Pencarian dan inspeksi repositori publik GitHub secara langsung dengan debounced search.
3. **Persistent Bookmark & Watchlist Management:** Endpoint REST API untuk menyimpan (*write*) dan mengambil (*read*) riwayat repositori favorit ke database PostgreSQL.
4. **Health Check & Service Telemetry:** Endpoint pemantauan status kesehatan service aplikasi dan koneksi basis data.

### d. Motivasi Pribadi & Peran Karier
Projek ini dibangun atas ketertarikan mendalam pada jalur karier **Cloud/DevOps Engineer** dan **Backend/Platform Engineer**. Memahami bagaimana merancang aplikasi multi-tier yang terisolasi dalam container, mengelola *shared responsibility model* pada cloud, serta mengonfigurasi otomatisasi healthcheck dan persistensi volume merupakan fondasi esensial dalam orkestrasi infrastruktur skala besar (Kubernetes/Cloud Native).

### e. Kebutuhan Biaya, Kepatuhan (UU PDP No. 27/2022), & Karakteristik NIST
* **Biaya (Target Rp0 / Free Tier):** Seluruh stack dirancang agar dapat berjalan pada free-tier cloud modern (mis. Docker container di VM gratis, Vercel Serverless, atau Neon/Supabase Free Tier) tanpa biaya awal.
* **Kepatuhan Data Pribadi (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi):** GitPulse hanya mengakses data publik dari GitHub API (nama repositori publik, ringkasan commit publik, dan statistik agregat). Sistem menerapkan prinsip *Data Minimization* dan *Privacy by Design* tanpa menyimpan data pribadi sensitif (seperti NIK, kata sandi, alamat, atau nomor telepon pribadi). Token API disimpan menggunakan environment variable yang terisolasi dan di-ignore dari riwayat Git.
* **Karakteristik Esensial Cloud NIST:** Karakteristik yang paling diandalkan projek ini adalah **Rapid Elasticity** dan **Resource Pooling**, di mana beban pemrosesan telemetri dan query database dapat diskalakan secara elastis mengikuti volume aktivitas kontribusi repositori.

---

## 🏛️ 2. Desain Arsitektur Multi-Tier & Alur Request

Aplikasi mengadopsi arsitektur **3-Tier Cloud Native** yang seluruhnya terisolasi dalam jaringan virtual Docker:

```
[ Web Browser Client ]
          │  HTTP / HTTPS (Port 3000)
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Frontend Container (Next.js 15 App Router)         │
│  - Port Host: 3000                                          │
│  - Docker Service: frontend                                 │
│  - UI: Tailwind CSS, Recharts, Framer Motion                │
└─────────────────────────────────────────────────────────────┘
          │  Internal REST API Request (Port 8000)
          │  Network: gitpulse-network (Service Name: backend)
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Tier 2: Backend REST API Container (FastAPI + Python 3.12)  │
│  - Port Host: 8000                                          │
│  - Docker Service: backend                                  │
│  - Logic: Endpoints, Healthchecks, DORA Calculations        │
└─────────────────────────────────────────────────────────────┘
          │  TCP / SQL Connection (Port 5432)
          │  Network: gitpulse-network (Service Name: postgres)
          ▼
┌─────────────────────────────────────────────────────────────┐
│  Tier 3: Database Container (PostgreSQL 16 Alpine)          │
│  - Port Host: 5432                                          │
│  - Docker Service: postgres                                 │
│  - Persistent Storage: Named Volume (gitpulse_postgres_data)│
└─────────────────────────────────────────────────────────────┘
          ▲
          │  Admin Connection (Port 8080 - Profile: tools)
┌─────────────────────────────────────────────────────────────┐
│  Auxiliary: Adminer Web Database Client                     │
│  - Port Host: 8080                                          │
│  - Docker Service: adminer (Profile: tools)                 │
└─────────────────────────────────────────────────────────────┘
```

### Mengapa Container Lebih Tepat Dibandingkan Virtual Machine (VM)?
1. **Namespaces & Cgroups:** Container memanfaatkan kernel namespaces (isolasi proses, jaringan, mount point) dan cgroups (pembatasan alokasi CPU dan memori) milik host OS, sehingga tidak memerlukan guest OS duplikat seperti pada VM.
2. **Ukuran Image Sangat Ramping:** VM membutuhkan puluhan Gigabyte karena memuat seluruh image sistem operasi. Sebaliknya, image container GitPulse (Next.js standalone & Python slim) hanya berukuran puluhan hingga ratusan Megabyte.
3. **Waktu Startup Instan:** Container dapat menyala dalam hitungan milidetik hingga detik (sub-second) karena proses langsung dieksekusi di host kernel, sedangkan VM membutuhkan proses booting virtual BIOS dan operating system selama hitungan menit.

---

## 🐳 3. Spesifikasi Dockerfile (Multi-Stage Build)

Kedua komponen utama (Frontend dan Backend) menggunakan arsitektur **Multi-Stage Build**:

### a. Backend Dockerfile (`backend/Dockerfile`)
* **Stage 1 (`builder`):** Menggunakan base image `python:3.12-slim`. Menginstall dependensi kompilasi dan mengisolasi library Python ke dalam virtual environment `/opt/venv`.
* **Stage 2 (`runner`):** Menggunakan base image `python:3.12-slim` yang bersih. Hanya menyalin direktori `/opt/venv` dari stage builder, mengabaikan perkakas build berukuran besar, sehingga memangkas ukuran image secara drastis.
* **Layer Caching:** File `requirements.txt` disalin dan di-install **sebelum** menyalin keseluruhan source code aplikasi (`COPY . .`). Dengan cara ini, layer dependensi akan di-*cache* oleh Docker dan tidak perlu di-download ulang saat ada perubahan logika kode.
* **Best Practices:** Menggunakan `WORKDIR /app`, `ENV` terstruktur, `EXPOSE 8000`, serta `CMD` dalam *exec form* (`["uvicorn", "app.main:app", ...]`).
* **COPY vs ADD:** Seluruh perintah menggunakan `COPY`. `COPY` dipilih karena hanya menyalin berkas lokal ke dalam container secara eksplisit dan aman. `ADD` dihindari karena memiliki efek samping otomatis mengekstrak berkas arsip (tar/zip) dan dapat mengunduh berkas dari remote URL yang berpotensi menimbulkan celah keamanan.

### b. Frontend Dockerfile (`frontend/Dockerfile`)
* Menggunakan **3-stage build** berbasis `node:20-alpine`:
  1. `deps`: Menginstall dependensi via `npm ci` berdasarkan `package.json` dan `package-lock.json`.
  2. `builder`: Melakukan kompilasi Next.js (`npm run build`) dengan mode `output: 'standalone'`.
  3. `runner`: Mengambil output standalone bundle (~90MB), membuat user non-root `nextjs:nodejs`, dan menjalankan server via exec form `CMD ["node", "server.js"]`.

---

## 📦 4. Spesifikasi Docker Compose (`docker-compose.yml`)

1. **Multi-Service:** Terdiri dari 3 service aktif (`frontend`, `backend`, `postgres`) dan 1 service auxiliary (`adminer`).
2. **User-Defined Network (`gitpulse-network`):** Seluruh service saling berkomunikasi menggunakan DNS internal Docker melalui nama service (misal backend terhubung ke database via `host: postgres`, bukan IP statis atau `localhost`).
3. **Named Volume (`gitpulse_postgres_data`):** Data PostgreSQL disimpan pada named volume Docker, menjamin data tidak hilang saat container dimatikan (`docker compose down`).
4. **Healthcheck & Dependency Order:**
   * Container `postgres` memiliki healthcheck berbasis `pg_isready`.
   * Container `backend` menunggu hingga postgres siap melalui `depends_on: postgres: condition: service_healthy`.
   * Container `frontend` menunggu hingga backend siap melalui `depends_on: backend: condition: service_healthy`.
5. **Secret Hygiene:** Menggunakan file `.env` yang diabaikan oleh Git, dan menyediakan `.env.example` sebagai referensi.
6. **Profile Tools:** Service `adminer` dikonfigurasi dengan `profiles: ["tools"]`, sehingga tidak memberatkan sistem kecuali dipanggil secara eksplisit.

---

## 🚀 5. Cara Menjalankan di Localhost

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/NAxel-code/gitpulse-analytics-uts.git
cd gitpulse-analytics-uts
```

### Langkah 2: Siapkan File Environment
```bash
# Salin konfigurasi contoh ke .env
cp .env.example .env
```

### Langkah 3: Jalankan Stack Aplikasi
Cukup jalankan satu perintah berikut:
```bash
docker compose up -d --build
```

Setelah selesai, buka di browser:
* **Frontend Web Application:** [http://localhost:3000](http://localhost:3000)
* **Backend OpenAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### Langkah Opsional: Menjalankan Database Web Admin (Adminer)
Untuk membuka GUI manajemen database PostgreSQL:
```bash
docker compose --profile tools up -d
```
Buka di browser: [http://localhost:8080](http://localhost:8080)
* **System:** PostgreSQL
* **Server:** `postgres`
* **Username:** `gitpulse_user`
* **Password:** `gitpulse_secret_pass`
* **Database:** `gitpulse`

---

## 🧪 6. Uji Coba Endpoint & Bukti Persistensi Data

### a. Uji Healthcheck (`GET /health`)
```bash
curl -i http://localhost:8000/health
```
**Ekspektasi Output:** Status HTTP `200 OK` dengan status `healthy` dan database terhubung.

### b. Uji Endpoint Tulis Database (`POST /api/v1/bookmarks`)
Menyimpan repository ke daftar pantau database PostgreSQL:
```bash
curl -i -X POST http://localhost:8000/api/v1/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "repo_name": "facebook/react",
    "category": "Frontend",
    "description": "The library for web and native user interfaces",
    "stars": 225000
  }'
```
**Ekspektasi Output:** Status HTTP `201 Created` dengan payload data tersimpan.

### c. Uji Endpoint Baca Database (`GET /api/v1/bookmarks`)
Mengambil seluruh daftar pantau dari database PostgreSQL:
```bash
curl -i http://localhost:8000/api/v1/bookmarks
```
**Ekspektasi Output:** Status HTTP `200 OK` dengan array JSON berisi data repository yang baru ditambahkan.

### d. Uji Persistensi Data (Named Volume Verification)
1. Simpan satu data baru via `POST /api/v1/bookmarks`.
2. Matikan seluruh container:
   ```bash
   docker compose down
   ```
3. Nyalakan kembali container:
   ```bash
   docker compose up -d
   ```
4. Panggil kembali `GET /api/v1/bookmarks`. **Hasil:** Data tetap tersimpan utuh karena data disimpan di named volume `gitpulse_postgres_data`.
5. **Perbedaan dengan `docker compose down -v`:**
   Perintah `docker compose down` hanya menghapus container dan network virtual tanpa menyentuh data volume. Sedangkan `docker compose down -v` (*volume flag*) akan secara paksa menghapus seluruh named volume fisik di host, sehingga data database akan terhapus bersih.

---

## 🤖 7. AI Usage Declaration (Partial AI - Max 50%)

Sesuai instruksi ujian (Petunjuk No. 5), penggunaan AI pada projek ini dideklarasikan sebagai berikut:

* **Tipe Penggunaan AI:** **Partial** (digunakan $\le$ 50% dari keseluruhan proses pengerjaan).
* **Alat AI yang Digunakan:** Google Gemini, Antigravity AI Assistant.
* **Tahapan yang Dibantu AI:**
  1. Brainstorming ide struktur multi-stage Dockerfile untuk runtime Python dan Node.js.
  2. Pembuatan skema tabel PostgreSQL dan boilerplate router endpoint FastAPI.
  3. Pembuatan kerangka penulisan laporan teknis analisis cloud model.
* **Contoh Prompt Utama:**
  > *"Bagaimana merancang Dockerfile multi-stage build untuk backend FastAPI Python 3.12 dengan virtualenv agar ukuran image seminimal mungkin dan cache dependency optimal?"*
  > *"Buat tabel perbandingan shared responsibility model untuk IaaS, PaaS, SaaS, BaaS, dan FaaS sesuai standar kurikulum cloud computing."*
* **Pernyataan Orisinalitas:**
  Seluruh arsitektur container, konfigurasi jaringan docker-compose, integrasi database PostgreSQL, pengujian fungsionalitas, serta demonstrasi video dan penulisan artikel dipahami, divalidasi, dan dioperasikan secara mandiri oleh mahasiswa yang bersangkutan.

---

## 📄 8. Lisensi

Projek ini didistribusikan di bawah lisensi **MIT License**.
