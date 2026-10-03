# Dokumentasi Arsitektur Sistem TajweeDo

Dokumen ini menguraikan arsitektur tingkat tinggi untuk sistem pembelajaran TajweeDo, memisahkan *Client Layer*, *Logic Layer*, dan *Data Layer*.

## 1. Tech Stack Utama

*   **Web Frontend:** Vite (React/Vue/Svelte)
*   **Mobile App:** Flutter
*   **Backend API & File Server:** Go (Gin / Fiber)
*   **Database:** Neon (Serverless PostgreSQL)
*   **Authentication:** Clerk

---

## 2. Diagram Arsitektur (High-Level)

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer
        W[Web App<br>Vite]
        M[Mobile App<br>Flutter]
    end

    %% Third-Party Services (Auth)
    C[Clerk Auth<br>Identity Provider]

    %% Logic Layer & Local Storage
    subgraph Logic & File Layer
        B[Backend API<br>Golang]
        FS[Local File System<br>Assets & Uploads]
    end

    %% Data Layer
    subgraph Data Layer
        DB[(Database<br>Neon Postgres)]
    end

    %% Connections
    W -- "1. Login / Get JWT" --> C
    M -- "1. Login / Get JWT" --> C
    
    W -- "2. REST API + Bearer JWT" --> B
    M -- "2. REST API + Bearer JWT" --> B
    
    B -- "3. Verify JWKS" --> C
    B -- "4. Read/Write Data" --> DB
    
    W -- "5. Fetch Media (HTTP GET)" --> B
    M -- "5. Fetch Media (HTTP GET)" --> B
    B --- FS

    Berikut adalah versi final dari dokumen arsitektur.md yang telah disempurnakan. Dokumen ini sekarang sepenuhnya mencerminkan arsitektur 100% Serverless & Stateless dengan manajemen aset berbasis identitas (string identifier).

Markdown
# Dokumen Arsitektur & Brief Sistem: TajweeDo

TajweeDo adalah platform pembelajaran mengaji interaktif (*gamified*) berbasis Web dan Mobile. Arsitektur ini dirancang untuk mencapai performa *zero-latency perception*, biaya infrastruktur minimal (*serverless*), dan pemeliharaan yang terpusat.

---

## 1. Tech Stack Utama

*   **Web Client:** Vite (React/Vue/Svelte)
*   **Mobile Client:** Flutter
*   **Backend API:** Go (Gin / Fiber) — *Serverless Deployment (Vercel)*
*   **Database:** Neon (Serverless PostgreSQL)
*   **Authentication:** Clerk
*   **Asset Management:** Bundled Client Assets (Nol beban server/storage)

---

## 2. Diagram Arsitektur (High-Level)

```mermaid
graph TD
    %% Client Layer & Assets
    subgraph Client Layer
        W[Web App<br>Vite]
        M[Mobile App<br>Flutter]
        
        WA[(Bundled Assets<br>/public/avatars/)]
        MA[(Bundled Assets<br>assets/avatars/)]
        
        W -. "Render Local Image" .- WA
        M -. "Render Local Image" .- MA
    end

    %% Auth Service
    C[Clerk Auth<br>Identity Provider]

    %% Logic Layer
    subgraph Logic Layer
        B[Backend API<br>Go - Serverless]
    end

    %% Data Layer
    subgraph Data Layer
        DB[(Database<br>Neon Postgres)]
    end

    %% --- Alur Pre-Warming (Anti Cold Start) ---
    W -. "0. Splash/Mount: GET /api/health" .-> B
    M -. "0. Splash/Mount: GET /api/health" .-> B
    B -. "SELECT 1" .-> DB

    %% --- Alur Utama ---
    W -- "1. Login (OAuth/Email)" --> C
    M -- "1. Login (OAuth/Email)" --> C
    
    W -- "2. Request Data (Bearer JWT)" --> B
    M -- "2. Request Data (Bearer JWT)" --> B
    
    B -- "3. Verify JWKS" --> C
    B -- "4. Validasi & Transaksi" --> DB
    
    %% --- Alur Aset (Avatar/Shop) ---
    DB -- "5. Return identifier: 'santa'" --> B
    B -- "6. Kirim JSON: {avatar: 'santa'}" --> W
    B -- "6. Kirim JSON: {avatar: 'santa'}" --> M
3. Strategi Optimasi Performa (Anti Cold-Start)
Karena backend Go dan database Neon menggunakan infrastruktur Serverless yang melakukan scale-to-zero saat tidak ada trafik, sistem menerapkan teknik Optimistic Pre-warming:

Trigger di Frontend: Saat web Vite dimuat (di root component) atau layar Splash Screen Flutter muncul, aplikasi menjalankan HTTP GET ke /api/health secara background tanpa memblokir UI.

Trigger di Backend: Endpoint /api/health di Go merespons request tersebut sekaligus mengeksekusi kueri teringan (SELECT 1) ke database Neon.

Zero-Latency Perception: Selama 2-3 detik pengguna melihat splash screen atau mengisi form login, mesin Vercel (Go) dan Neon (Postgres) dipaksa bangun dari status "tidur". Saat tombol utama ditekan, respons API sudah berada dalam hitungan milidetik.

4. Manajemen Aset & Gamifikasi (100% Stateless)
Untuk menghindari penggunaan Object Storage eksternal dan keterbatasan ephemeral storage pada Vercel, seluruh aset visual (avatar, lencana, item shop) dikelola murni di sisi klien.

Penyimpanan Database: Tabel users hanya menyimpan string identifier dari item yang sedang dipakai (contoh: equipped_avatar: "santa" atau equipped_avatar: "ninja"). Tabel user_inventory mencatat string apa saja yang sudah dibeli pengguna.

Pemrosesan Backend: Go sama sekali tidak menangani file blob atau multipart-form. Backend hanya memvalidasi apakah pengguna memiliki cukup koin untuk membeli ID item tertentu, lalu menyimpan string tersebut.

Rendering Frontend (Vite & Flutter):
Klien menerima JSON berisi identifier, lalu memanggil gambar yang sudah tertanam di dalam aplikasi:

Vite: <img src="/avatars/santa.png" />

Flutter: Image.asset('assets/avatars/santa.png')

Keuntungan Pendekatan Ini:

Bebas masalah hilang file di lingkungan Vercel.

Nol biaya cloud storage dan egress bandwidth.

Aset termuat secara instan (offline-ready) karena berada di memori lokal perangkat.

5. Alur Data Bisnis (Contoh: Beli Avatar)
Flutter mengirim POST /api/shop/buy dengan payload {"item_id": "santa"} beserta token JWT.

Go memvalidasi JWT ke Clerk.

Go mengecek saldo koin pengguna di Neon.

Jika cukup, Go melakukan transaksi database (ACID):

Mengurangi koin di tabel users.

Menambah record "santa" di tabel user_inventory.

Mencatat log di tabel transactions.

Go mengembalikan status sukses. Frontend meng-update UI dan memutar suara kemenangan.