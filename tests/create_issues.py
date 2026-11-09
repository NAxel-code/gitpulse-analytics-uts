import subprocess
import json

issues = [
    {
        "title": "feat: Interactive Guided Walkthrough Tour & DORA Metrics Cheatsheet Modal",
        "labels": ["enhancement", "documentation"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Pengguna yang pertama kali membuka dashboard GitPulse Analytics menghadapi kurva pembelajaran yang cukup tinggi karena banyaknya indikator teknis DORA metrics (Lead Time to Merge, Time to First Review, PR Funnel conversion stages, contributor velocity tiers). Dibutuhkan panduan interaktif langsung di antarmuka (walkthrough tour) dan modal contekan dokumentasi (cheatsheet) yang dapat diakses kapan saja.

## 🗣️ User Request
> *"apakah user memerlukan bantuan tutorial untuk mengoperasikan website ini? apabila perlu mari kita buat fiturnya"*

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Interactive Spotlight Tour (`WalkthroughTour.tsx` & `HelpTourModal.tsx`)**:
   - Dibuat sistem spotlight tur 5 tahap yang memandu pengguna mulai dari:
     - Step 1: Navigasi & Pemilihan Repositori
     - Step 2: Bento KPI Cards & Formula DORA
     - Step 3: Repository Activity Velocity (Interaksi Commit & PR)
     - Step 4: PR Lifecycle Funnel & Deteksi Bottleneck
     - Step 5: Contributor Engineering Velocity & Tanya AI (`⌘K`)
2. **Modal Panduan & Glosarium DORA (`HelpTourModal.tsx`)**:
   - Menyediakan tab *Quick Start*, *Indikator DORA*, *Pencarian AI*, dan *Daftar Shortcut Keyboard*.
   - Shortcut keyboard global `?` untuk membuka panduan kapan saja.
3. **Onboarding Banner Otomatis**:
   - Menampilkan popover ramah di pojok kanan bawah bagi pengguna baru tanpa mengganggu alur kerja.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/HelpTourModal.tsx`
- `frontend/src/components/WalkthroughTour.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/app/page.tsx`

## ✅ Verifikasi & Status
- Terverifikasi end-to-end via Playwright (`tests/test_walkthrough_flow.py`).
- Commit: `25bbff9` & `e7c8567`.
- Status: **Resolved / Completed**.
""",
        "commit": "25bbff9"
    },
    {
        "title": "feat: Arbitrary GitHub Repository Switcher & Intelligent AI Query Routing",
        "labels": ["enhancement"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Awalnya pemilihan repositori pada dashboard terbatas hanya pada 3 pill repositori hardcoded (`vercel/next.js`, `facebook/react`, `tailwindlabs/tailwindcss`). Pengguna tidak dapat menganalisis repositori kustom publik lainnya, termasuk repositori milik pengguna sendiri (`NAxel-code/gitpulse-analytics`).

## 🗣️ User Request
> *"kenapa gini"*
> *"jadi cuman bisa 3 ini aja? gabisa yang lain?"*

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Modal Pemilihan Repositori Kustom**:
   - Menambahkan tombol `+ Ganti Repo...` di navigasi utama dengan modal interaktif untuk memasukkan format `owner/repo` atau URL lengkap GitHub.
   - Validasi sintaksis nama repositori (format `owner/repo`).
2. **Dukungan Repositori Pribadi**:
   - Menambahkan preset repositori `NAxel-code/gitpulse-analytics` langsung ke bar navigasi.
3. **Intelligent Cross-Repo AI Query Routing**:
   - Memperbarui parser intent pada `AIModal.tsx` dan backend engine agar mendeteksi entitas `owner/repo` dalam prompt pengguna (misal: *"analisis repo facebook/react"* atau *"bagaimana velocity NAxel-code/gitpulse-analytics"*), secara otomatis menawarkan tombol switch repositori sekali klik.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/Header.tsx`
- `frontend/src/components/AIModal.tsx`
- `frontend/src/app/page.tsx`
- `backend/app/services/ai_service.py`

## ✅ Verifikasi & Status
- Terverifikasi via pengujian Playwright interaksi modal kustom dan query AI.
- Commit: `1fc693a` & `a2fa8b7`.
- Status: **Resolved / Completed**.
""",
        "commit": "a2fa8b7"
    },
    {
        "title": "fix: Activity Timeline Chart Renders Blank on Repository Switch",
        "labels": ["bug"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Saat repositori baru dipilih atau pada pemuatan awal tertentu, grafik *Repository Activity Velocity* (`ActivityChart.tsx`) menampilkan ruang kosong atau flatline tanpa kurva commit/PR, meskipun data di backend telah tersedia.

## 🗣️ User Request
> *"ini kenapa kosong semua? perbaiki"*

## 🔍 Akar Masalah (Root Cause)
1. Ketidaksesuaian rendering React 19 JSX fragment pada Recharts `ResponsiveContainer` saat data array kosong atau dalam transisi.
2. Normalisasi tanggal time-series yang tidak mengisi gap hari di mana tidak ada commit (menyebabkan skala axis Recharts terdistorsi).
3. Komponen belum memiliki mekanisme trigger sinkronisasi mandiri (*auto-sync zero state*).

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Restrukturisasi Komponen Recharts**:
   - Menghapus fragment JSX yang tidak didukung dan membungkus `AreaChart` serta `LineChart` dengan container absolut yang stabil.
2. **Normalisasi Time-Series DuckDB**:
   - Mengisi rentang tanggal kosong (date gap filling) dengan nilai 0 commit / 0 PR agar kurva spline tetap kontinu dan proporsional.
3. **State Kosong Interaktif (Zero-State Fallback)**:
   - Menambahkan tombol interaktif *"Sinkronisasi Live Data GitHub"* langsung di dalam card chart ketika data masih kosong, memicu fetch data riil secara instan.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/ActivityChart.tsx`
- `backend/app/services/github_service.py`
- `frontend/src/app/page.tsx`

## ✅ Verifikasi & Status
- Terverifikasi visual dengan kurva spline commits & PRs aktif (`gitpulse_chart_verified.png`).
- Commit: `541a674`.
- Status: **Resolved / Completed**.
""",
        "commit": "541a674"
    },
    {
        "title": "fix: Spotlight Walkthrough Backdrop Blur Obscures Highlighted Active Target",
        "labels": ["bug"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Pada saat panduan tur interaktif (*Walkthrough Tour*) berjalan, elemen UI yang sedang disorot (misalnya Bento KPI cards atau Header) ikut buram (*blurry*) dan tidak dapat dibaca, alih-alih tampil terang dan tajam.

## 🗣️ User Request
> *"kenapa yang disorot ikut buram? perbaiki"*

## 🔍 Akar Masalah (Root Cause)
Implementasi overlay menggunakan filter CSS `backdrop-blur-md` yang dikombinasikan dengan `mask-image: radial-gradient(...)`. Efek blur diterapkan pada level piksel layer global sebelum proses masking, sehingga piksel elemen yang berada di dalam area transisi gradien radial ikut terkena kalkulasi blur.

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Dual-Layer SVG Cutout Mask**:
   - Mengganti CSS radial-gradient dengan elemen SVG `<mask id="spotlight-mask">`.
   - Menggunakan layer dasar `<rect fill="white"/>` dan lubang pemotong `<rect fill="black" rx="16"/>` tepat pada koordinat *boundingClientRect* elemen target.
2. **Zero-Blur Viewport Cutout**:
   - Area cutout diatur 100% transparan tanpa filter blur, sementara backdrop di sekelilingnya tetap mempertahankan efek gelap dan blur (`bg-black/75 backdrop-blur-sm`).
3. **Pointer Events Handling**:
   - Menambahkan `pointer-events: none` pada area sorotan agar interaksi klik tidak terhalang.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/WalkthroughTour.tsx`

## ✅ Verifikasi & Status
- Terverifikasi visual dengan screenshot perbandingan sebelum vs sesudah (`tour_step2_verified.png`).
- Commit: `9d58db8`.
- Status: **Resolved / Completed**.
""",
        "commit": "9d58db8"
    },
    {
        "title": "fix: Enforce 100% Factual GitHub Data & Fix AI Search Bar Header Responsive Layout",
        "labels": ["bug", "enhancement"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
1. Beberapa grafik dan metrik masih menampilkan data tiruan atau artefak simulasi random (`mockDataGenerator`), bukan data fakta riil dari API GitHub.
2. Tata letak kotak input pencarian AI (*Tanya AI: Cmd+K*) pada bar navigasi Header terpotong (*clipped/overflow*) pada ukuran layar tablet dan medium desktop.

## 🗣️ User Request
> *"apakah ini data untuk grafik dan semuanya sudah benar nyata dan tidak ngasal? benerin sampe sesuai dengan data fakta. itu fitur search ai nya juga gabener layoutnya, perbaiki"*

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Purge Data Simulasi & Penegakan 100% Faktual**:
   - Menghapus seluruh helper generator acak (`mockDataGenerator`).
   - Mengintegrasikan DuckDB pipeline dan GitHub REST API v3 asli untuk mengambil statistik commit harian, pull request lifecycle, daftar kontributor asli, dan total stargazer nyata (contoh: Next.js ~143k stars, React ~230k stars).
2. **Perbaikan Layout Responsif AI Search Box**:
   - Menata ulang flexbox container Header dengan `flex-wrap` dan `w-full xl:w-auto`.
   - Menambahkan `truncate whitespace-nowrap` pada teks placeholder prompt dan memperbarui badge pintasan `⌘K` agar tidak terpotong pada viewport menengah.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/Header.tsx`
- `backend/app/services/github_service.py`
- `backend/app/routers/github.py`
- `frontend/src/lib/fallback.ts`

## ✅ Verifikasi & Status
- Terverifikasi via Playwright audit (`e2e_real_factual.png`, `vercel_real_dashboard.png`).
- Commit: `0862280`.
- Status: **Resolved / Completed**.
""",
        "commit": "0862280"
    },
    {
        "title": "feat: Sector Benchmark Leaderboard with Community Stars, Enterprise Licenses & Velocity",
        "labels": ["enhancement"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Pengguna memerlukan instrumen perbandingan komprehensif untuk mengevaluasi posisi repositori mereka terhadap repositori open-source kelas dunia di berbagai domain teknis (AI, Systems, Cloud Native, Web, Mobile).

## 🗣️ User Request
> *"apakah kita bisa menambahkan fitur untuk list leaderboard repo untuk beberapa sektor/bidang?"*
> *"yang repo leaderboard utamakan yang menarik, contoh berdasarkan community stars, license ternama, engineering velocity dan lainnya yang lebih useful"*

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Modal Benchmark Leaderboard (`RepoLeaderboardModal.tsx`)**:
   - Sistem perankingan multi-sektor: *🤖 AI & ML*, *🦀 Systems & Runtimes*, *⚙️ DevOps & Cloud*, *🌐 Web Frameworks*, dan *📱 Mobile*.
   - Filter lisensi open-source terkemuka (*MIT*, *Apache-2.0*, *BSD-3-Clause*, *GPL-2.0*).
2. **Metrik Kesehatan & Momentum Teknik**:
   - Menampilkan total GitHub Stars terverifikasi dengan format k-unit (`94.0k`, `115.3k`, dll.).
   - Indikator *Health Score* (skala 0 - 100) dan *Velocity Rating* (*Hyper Velocity*, *High Momentum*, *Steady*).
   - Tag keunggulan unik (misal: *⚡ State of the art LLM Serving*, *📦 High Performance Package Manager*).
3. **Analisis Langsung 1-Klik**:
   - Tombol *"Analisis Repo"* pada setiap baris leaderboard yang langsung memuat data repositori tersebut ke dashboard utama.

## 📁 File Terkait (Affected Files)
- `frontend/src/components/RepoLeaderboardModal.tsx`
- `backend/app/services/leaderboard_service.py`
- `backend/app/routers/github.py`
- `frontend/src/components/Header.tsx`
- `frontend/src/app/page.tsx`

## ✅ Verifikasi & Status
- Terverifikasi via pengujian filter multi-sektor dan modal switching (`leaderboard_modal_ai.png`, `leaderboard_modal_apache.png`).
- Commit: `05af35e`.
- Status: **Resolved / Completed**.
""",
        "commit": "05af35e"
    },
    {
        "title": "feat: Pure Next.js Universal Serverless Architecture & Live GitHub Search Autocomplete",
        "labels": ["enhancement"],
        "body": """## 📌 Masalah & Latar Belakang (Problem Statement)
Sebelumnya dashboard frontend bergantung pada server lokal Python FastAPI (port 8000) untuk memproses kalkulasi analitik GitHub. Hal ini menyebabkan live deployment di Vercel terbatas hanya pada beberapa repositori preset statis dan gagal memuat repositori kustom publik secara fleksibel. Selain itu, pengguna menginginkan kemampuan mencari repositori publik apa saja secara instan melalui autocomplete.

## 🗣️ User Request
> *"ini gabisa yang lain ya? saya mau ini lebih universal lagi ga cuman next.js / react / tailwind aja. coba jelasin dulu arsitekturnya apakah perlu kita implement apa ngga"*
> *"iya opsi 1 dulu"*

## 🔍 Solusi & Implementasi Teknis (Fix & Implementation)
1. **Serverless GitHub Intelligence Engine (`github-serverless.ts`)**:
   - Porting kalkulasi DORA metrics, PR funnel conversion stages, Lead Time to Merge, Time to First Review, Contributor velocity tiers, dan Anomaly Alerts ke TypeScript murni.
   - Mengonsumsi GitHub REST API v3 langsung dari serverless route handlers Next.js dengan dukungan cache fallback repositori multi-domain (*vllm*, *uv*, *linux*, *transformers*, *kubernetes*, *bun*, dll.).
2. **Universal Catch-All Route Handlers**:
   - `/api/github/[...slug]/route.ts`: Menyediakan endpoint `overview`, `timeline`, `pr-funnel`, `contributors`, `anomalies`, `executive-summary`, `sync`, dan `search`.
   - `/api/ai/[...slug]/route.ts`: Menyediakan serverless AI query resolver untuk shortcut `⌘K`.
3. **Live Search Autocomplete (`Header.tsx`)**:
   - Autocomplete pencarian repositori GitHub secara live dengan debounce 350ms, menampilkan nama repo, bahasa pemrograman, bintang, dan deskripsi singkat.
   - Tab filter sektor (*Semua*, *AI*, *Systems*, *DevOps*, *Web*) di dalam modal pemilihan repositori.
4. **Deploy ke Vercel Production**:
   - Menghubungkan client langsung ke relative path `/api` sehingga berjalan secara otonom di Vercel cloud tanpa butuh host backend terpisah.

## 📁 File Terkait (Affected Files)
- `frontend/src/lib/github-serverless.ts`
- `frontend/src/app/api/github/[...slug]/route.ts`
- `frontend/src/app/api/ai/[...slug]/route.ts`
- `frontend/src/components/Header.tsx`
- `frontend/src/lib/api.ts`

## ✅ Verifikasi & Status
- Terverifikasi via Playwright automated test (`test_universal_repo_switch.py`) dengan screenshot `universal_repo_modal.png`, `autocomplete_dropdown.png`, dan `vllm_dashboard_verified.png`.
- Produksi Vercel aktif: https://frontend-theta-beige-69.vercel.app
- Commit: `72900f6`.
- Status: **Resolved / Completed**.
""",
        "commit": "72900f6"
    }
]

created_issues = []
for idx, iss in enumerate(issues, 1):
    print(f"Creating Issue #{idx}: {iss['title']}...")
    cmd = [
        "gh", "issue", "create",
        "--title", iss["title"],
        "--body", iss["body"],
        "--label", ",".join(iss["labels"])
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        url = res.stdout.strip()
        print(f" -> Created: {url}")
        # Extract issue number from url
        issue_num = url.split("/")[-1]
        
        # Close issue as completed with reference to commit
        close_cmd = [
            "gh", "issue", "close", issue_num,
            "--comment", f"Implemented and verified in commit `{iss['commit']}`. Production ready."
        ]
        subprocess.run(close_cmd, capture_output=True, text=True)
        print(f" -> Closed Issue #{issue_num} as completed.")
        created_issues.append({"number": issue_num, "title": iss["title"], "url": url})
    else:
        print(f" -> Error creating issue: {res.stderr}")

print("\nSummary of created issues:")
for ci in created_issues:
    print(f"#{ci['number']}: {ci['title']} ({ci['url']})")
