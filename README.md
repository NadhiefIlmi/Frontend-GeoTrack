# GeoTrack Frontend — Geospatial Entity Management System UI

GeoTrack Frontend adalah antarmuka web modern berbasis **TanStack Start (React 19, SSR, Vite)** yang dirancang untuk memvisualisasikan dan mengelola aset fisik berbasis lokasi geografis (*Vehicles, IoT Devices, Facilities, Infrastructure*) secara interaktif.

---

## 🌟 Fitur Utama

- **Interactive Dashboard:** Menampilkan ringkasan statistik total aset, status operasional (*Active, Inactive, Maintenance*), komposisi jenis aset, peta sebaran, dan linimasa aktivitas terbaru.
- **Entity Management (CRUD):**
  - Pembuatan dan pengeditan entitas dengan validasi input formulir menggunakan Zod.
  - Pencarian teks bebas (*fuzzy search*) berdasarkan nama atau kode aset.
  - Filter multi-kriteria berbasis jenis (*Vehicle, IoT Device, Facility, Infrastructure*) dan status.
  - Visualisasi koordinat geografis (*Latitude/Longitude*) pada peta interaktif.
- **Activity Logs & Audit Trail:** Pemantauan linimasa perubahan status dan mutasi entitas secara kronologis.
- **Multi-Language Support:** Pilihan bahasa dinamis antara **Bahasa Indonesia (ID)** dan **English (EN)**.
- **Standardized Tooling:** 100% menggunakan open-source vanilla Vite + TanStack Start dengan manajer paket `pnpm`.

---

## 🛠️ Frontend Tech Stack

| Kategori | Teknologi | Keterangan |
|---|---|---|
| **Runtime & Core** | React 19 + TypeScript 5.8 | Modern React dengan pengetikan tipe ketat |
| **Framework / Meta-framework** | TanStack Start (`@tanstack/react-start`) | Full-stack React framework dengan file-based routing & SSR |
| **Routing** | TanStack Router (`@tanstack/react-router`) | 100% type-safe routing dengan query parameter state |
| **Server Engine** | Vinxi & Nitro | High-performance full-stack web application bundler |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React | Utility-first CSS modern dan set ikon vektor modular |
| **State & API Client** | TanStack Query + Axios | Asynchronous server state caching, retry, & HTTP requests |
| **Validasi Formulir** | Zod + React Hook Form | Skema validasi deklaratif dengan pesan error ramah pengguna |
| **Notifikasi** | Sonner | Toast notification modern dan elegan |
| **Package Manager** | `pnpm` (v10+) | Cepat, efisien disk, dan terstandarisasi |
| **Testing** | Vitest + Testing Library | Unit & integration component testing |

---

## 📁 Struktur Direktori

```text
Frontend-Geotrack/
├── src/
│   ├── assets/              # Asset statis (logo, gambar)
│   ├── components/          # Komponen UI modular
│   │   ├── dashboard/       # Komponen visualisasi dashboard
│   │   ├── entities/        # Tabel, modal form, dan kartu entitas
│   │   ├── layout/          # Sidebar, Navbar, dan AppShell
│   │   └── ui/              # Komponen atomik (button, dialog, input, sonner)
│   ├── data/                # Mock data & generator waktu untuk fallback
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # Kamus bahasa & context provider
│   ├── lib/                 # Utilitas format tanggal, kalkulasi spasial, styling
│   ├── routes/              # File-based routing TanStack Start
│   │   ├── __root.tsx       # Root layout & provider wrapper
│   │   ├── index.tsx        # Halaman Dashboard
│   │   ├── entities.tsx     # Halaman Manajemen Entitas
│   │   └── activity.tsx     # Halaman Riwayat Aktivitas
│   ├── schemas/             # Skema validasi formulir Zod
│   ├── services/            # Axios API client & data services
│   │   ├── api.ts           # Konfigurasi instance Axios
│   │   └── entityService.ts # Service data entitas
│   ├── state/               # State provider (EntityStore)
│   └── test/                # Unit test suite Vitest
├── public/                  # Static assets publik
├── .env.example             # Template konfigurasi environment
├── vite.config.ts           # Konfigurasi Vite & TanStack Start
├── package.json             # Manifest dependensi & scripts
└── tsconfig.json            # Konfigurasi TypeScript compiler
```

---

## ⚙️ Persyaratan Sistem

- **Node.js:** Versi 20.x atau 22.x LTS
- **Package Manager:** `pnpm` (v9 atau v10)

---

## 🚀 Panduan Menjalankan

### 1. Masuk ke Direktori Frontend
```bash
cd "Frontend-Geotrack"
```

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Buat file `.env` untuk menghubungkan frontend ke backend Golang:
```bash
cp .env.example .env
```
Isi konfigurasi standar:
```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 4. Menjalankan Server Pengembangan
Jalankan dev server pada port `8081` (port standar yang diizinkan oleh CORS backend Golang):
```bash
pnpm dev --port 8081
```

Buka peramban di: **`http://localhost:8081`**

---

## 🧪 Pengujian & Linting

```bash
# Menjalankan unit tests dengan Vitest
pnpm test

# Menjalankan linter ESLint
pnpm lint

# Membangun bundle produksi
pnpm build
```

