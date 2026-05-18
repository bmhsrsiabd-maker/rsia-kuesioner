# 🏥 RSIA Bunda Denpasar – Kuesioner Menu Makanan

Aplikasi form kuesioner penilaian menu makanan pasien RSIA Bunda Denpasar, dibangun dengan:
- **Next.js 15** (App Router)
- **PostgreSQL** + **Prisma ORM**
- **Tailwind CSS**
- Deploy ke **Vercel**

---

## 📁 Struktur Halaman

| URL | Keterangan |
|-----|-----------|
| `/survey` | Form kuesioner (3 langkah) |
| `/survey/terima-kasih` | Halaman konfirmasi setelah submit |
| `/admin` | Dashboard rekap data (password protected) |

---

## 🚀 Setup & Deploy ke Vercel

### 1. Siapkan Database PostgreSQL

Gunakan salah satu provider gratis:
- **[Neon](https://neon.tech)** ← Rekomendasi (gratis, serverless)
- **[Supabase](https://supabase.com)** 
- **Vercel Postgres** (dari Vercel dashboard)

Salin **Connection String** yang sudah tersedia (format: `postgresql://...`)

---

### 2. Clone & Install

```bash
git clone <repo-url>
cd rsia-kuesioner
npm install
```

---

### 3. Konfigurasi Environment

Buat file `.env` dari template:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
ADMIN_PASSWORD="password-rahasia-anda"
```

---

### 4. Inisialisasi Database

```bash
# Push schema ke database
npx prisma db push

# (Opsional) Lihat data via GUI
npx prisma studio
```

---

### 5. Test Lokal

```bash
npm run dev
```

Buka: http://localhost:3000/survey

---

### 6. Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Atau via GitHub:**
1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import Project
3. Tambahkan Environment Variables:
   - `DATABASE_URL` = connection string database
   - `ADMIN_PASSWORD` = password admin dashboard

---

## 🔐 Akses Admin

Buka `/admin` di browser, masukkan password yang telah dikonfigurasi di `ADMIN_PASSWORD`.

**Fitur Admin:**
- Filter per bulan
- Rata-rata nilai per aspek
- Cari nama pasien / nomor ruang
- Tabel lengkap semua respons

---

## 📊 Struktur Data

| Field | Tipe | Keterangan |
|-------|------|-----------|
| `bulanPenilaian` | String | Bulan survei |
| `usiaJenisPasien` | String | Bayi/Anak/Dewasa/Lansia/Pendamping |
| `namaPasien` | String | Nama pasien atau wali |
| `tanggalPenilaian` | DateTime | Tanggal penilaian |
| `ruangRawat` | String | Nomor kamar rawat |
| `nilaiTampilan` | Int (1-5) | Penilaian tampilan makanan |
| `nilaiKebersihan` | Int (1-5) | Penilaian kebersihan penyajian |
| `nilaiRasa` | Int (1-5) | Penilaian rasa makanan |
| `nilaiWaktu` | Int (1-5) | Penilaian waktu penyajian |
| `nilaiVariasi` | Int (1-5) | Penilaian variasi menu |
| `keluhanDi` | String? | Waktu makan yang dikeluhkan |
| `kritikSaran` | String? | Teks kritik dan saran |

---

## 🛠️ Commands

```bash
npm run dev          # Jalankan development server
npm run build        # Build production
npx prisma db push   # Sync schema ke database
npx prisma studio    # GUI database
```

---

Dibevelop untuk RSIA Bunda Denpasar · Instalasi Gizi · 2026
