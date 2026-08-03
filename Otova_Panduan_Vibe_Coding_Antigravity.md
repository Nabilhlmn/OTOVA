# Panduan Vibe Coding Otova — untuk Google Antigravity

Dokumen ini adalah **pelengkap** dari `Otova_Product_Brief_PRD.md`. Isinya adalah hal-hal teknis yang perlu ditentukan lebih dulu sebelum PRD dilempar ke Antigravity, supaya agent-agent yang bekerja paralel di Manager View menghasilkan kode yang konsisten.

---

## 0. Keputusan Tech Stack (Final — bukan opsi lagi)

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) — frontend & backend jadi satu app |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Autentikasi | NextAuth.js (Credentials Provider + role: user/mitra/admin) |
| Upload file | Folder `public/uploads` untuk MVP (bisa upgrade ke object storage nanti) |
| State/Data fetching | React Server Components + Server Actions (hindari state management tambahan dulu) |
| Deployment (opsional) | Vercel (khusus versi lomba/demo) |

> Kenapa satu app Next.js? Karena Antigravity menjalankan beberapa agent yang bekerja di file/folder berbeda — satu repo dengan konvensi folder yang jelas jauh lebih mudah dikoordinasikan daripada repo frontend & backend terpisah.

---

## 1. Struktur Proyek

```
otova/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (auth)/register/page.tsx
│  │  ├─ (user)/dashboard/page.tsx
│  │  ├─ (user)/cari-bantuan/page.tsx
│  │  ├─ (user)/booking-bengkel/page.tsx
│  │  ├─ (user)/booking-bengkel/[id]/page.tsx
│  │  ├─ (user)/riwayat/page.tsx
│  │  ├─ (user)/profil/page.tsx
│  │  ├─ (mitra)/dashboard/page.tsx
│  │  ├─ (mitra)/order-masuk/page.tsx
│  │  ├─ (mitra)/riwayat/page.tsx
│  │  ├─ (mitra)/profil/page.tsx
│  │  ├─ (admin)/dashboard/page.tsx
│  │  ├─ (admin)/verifikasi-mitra/page.tsx
│  │  ├─ (admin)/kelola-user/page.tsx
│  │  ├─ (admin)/kelola-mitra/page.tsx
│  │  ├─ (admin)/kelola-order/page.tsx
│  │  ├─ (admin)/kelola-booking/page.tsx
│  │  ├─ (admin)/review/page.tsx
│  │  └─ api/... (route handlers sesuai kontrak API di bagian 3)
│  ├─ components/ (komponen UI reusable: Card, Badge status, Form, dsb.)
│  ├─ lib/ (prisma client, auth config, helper jarak GPS, dsb.)
│  └─ types/
├─ public/uploads/
└─ package.json
```

---

## 2. Inventaris Layar & Komponen UI

### User
| Halaman | Elemen UI utama |
|---|---|
| Login / Register | Form email/HP + password, toggle Daftar sebagai Mitra |
| Dashboard | Nav: Home, Cari Bantuan, Booking Bengkel, Riwayat, Profil |
| Cari Bantuan | Dropdown jenis kendaraan, input merek, textarea keluhan, upload foto, tombol ambil lokasi GPS, tombol submit → list card mitra (nama, jenis, jarak, rating, tombol pilih) |
| Booking Bengkel | List card bengkel (nama, rating, jarak) → detail bengkel (foto, daftar layanan, rating) → form pilih tanggal & jam → konfirmasi |
| Riwayat | Tab: Selesai / Dibatalkan, list card order dengan status & total biaya |
| Profil | Form edit data diri, foto, tombol logout |

### Mitra
| Halaman | Elemen UI utama |
|---|---|
| Registrasi Mitra | Pilih jenis (Bengkel/Teknisi/Tambal Ban), form data, upload KTP, upload foto usaha/diri |
| Dashboard | Badge status verifikasi, toggle Online/Offline, nav: Order Masuk, Riwayat, Profil |
| Order Masuk | Card order baru + tombol Terima/Tolak; setelah diterima → tombol update status (Menuju Lokasi → Tiba → Inspeksi) |
| Form Perubahan Biaya | Input item tambahan, harga, alasan, tombol kirim pengajuan |
| Riwayat | List order selesai/dibatalkan |

### Admin
| Halaman | Elemen UI utama |
|---|---|
| Dashboard | Ringkasan angka: total user, total mitra, order aktif |
| Verifikasi Mitra | List mitra berstatus pending, detail dokumen (KTP/foto), tombol Setujui/Tolak |
| Kelola User / Mitra / Order / Booking | Tabel dengan search & filter status |
| Review | Tabel review + rating per mitra |

---

## 3. Kontrak API (REST)

```
Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

Users
GET    /api/users/me
PATCH  /api/users/me

Partners
POST   /api/partners                     # registrasi mitra
GET    /api/partners?type=&status=&near=lat,lng
GET    /api/partners/:id
PATCH  /api/partners/:id/status          # admin: approve/reject
PATCH  /api/partners/:id/online-status   # mitra: online/offline

Orders
POST   /api/orders
GET    /api/orders/:id
GET    /api/orders?user_id=&partner_id=&status=
PATCH  /api/orders/:id/status
POST   /api/orders/:id/cost-change
PATCH  /api/orders/:id/cost-change/:changeId   # approve/reject oleh user

Bookings
POST   /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id/status

Payments
POST   /api/payments
PATCH  /api/payments/:id/confirm

Reviews
POST   /api/reviews

Notifications
GET    /api/notifications
PATCH  /api/notifications/:id/read
```

---

## 4. Pembagian Fase (dipetakan ke Manager View Antigravity)

**Fase 0 — wajib berurutan, jangan diparalel dulu:**
Setup project Next.js + Tailwind + Prisma, schema database (7 tabel sesuai PRD), autentikasi dasar (login/register + role user/mitra/admin).

**Setelah Fase 0 selesai**, fase-fase berikut bisa dijalankan sebagai agent terpisah secara paralel di Manager View karena modulnya independen:

| Agent | Fase | Cakupan |
|---|---|---|
| Agent A | Fase 1 — Sisi User | Cari Bantuan, Booking Bengkel, Riwayat, Profil |
| Agent B | Fase 2 — Sisi Mitra | Registrasi mitra, Dashboard mitra, Order Masuk, Pengajuan Perubahan Biaya |
| Agent C | Fase 3 — Sisi Admin | Verifikasi Mitra, Kelola User/Mitra/Order/Booking, Review |
| Agent D | Fase 4 — Pembayaran | Flow Tunai/QRIS, konfirmasi dua arah, trigger form review |

**Fase 5 — berurutan, setelah semua modul jadi:**
Integrasi notifikasi lintas modul, testing end-to-end seluruh flow (dari Cari Bantuan/Booking sampai Ditutup), polish UI & responsive check.

---

## 5. Contoh Acceptance Criteria per Fase

**Fase 0**
- [ ] User bisa register & login dengan role user maupun mitra
- [ ] Migrasi Prisma berhasil membuat 7 tabel sesuai PRD

**Fase 1**
- [ ] Form Cari Bantuan berhasil submit dan menampilkan daftar mitra sesuai jenis kendaraan & lokasi
- [ ] Booking bengkel tersimpan dengan status awal "menunggu_konfirmasi"

**Fase 2**
- [ ] Mitra baru berstatus "pending" sampai disetujui admin, tidak bisa online sebelum disetujui
- [ ] Order bisa diterima/ditolak mitra dan status order berjalan sesuai 10 status di PRD

**Fase 3**
- [ ] Admin bisa menyetujui/menolak mitra dan status partner ter-update real-time
- [ ] Tabel kelola order bisa difilter berdasarkan status

**Fase 4**
- [ ] Order bisa ditandai "Selesai" oleh mitra dan "Dikonfirmasi" oleh user
- [ ] Setelah konfirmasi, form rating & review muncul otomatis

---

## 6. Contoh Prompt Siap Tempel

**Prompt Fase 0 (jalankan lebih dulu, sendirian):**
```
Buat project Next.js 14 (App Router, TypeScript) bernama "otova" dengan Tailwind CSS dan Prisma + PostgreSQL.
Buat schema Prisma untuk 7 tabel: users, partners, orders, bookings, reviews, payments, notifications
sesuai field yang saya lampirkan (lihat bagian 2.11 di Otova_Product_Brief_PRD.md).
Implementasikan autentikasi dengan NextAuth (Credentials Provider), dengan 3 role: user, mitra, admin.
Setelah login, arahkan redirect sesuai role ke /dashboard masing-masing.
Verifikasi dengan menjalankan migrasi dan mencoba register + login lewat browser.
```

**Prompt Fase 1 (Agent A — Sisi User), jalankan setelah Fase 0 selesai:**
```
Lanjutkan project otova. Buat halaman-halaman untuk role "user" sesuai kontrak API dan inventaris layar berikut:
[tempel bagian 2 "User" dan bagian 3 "Orders/Bookings" dari dokumen ini]
Ikuti flow: user mengisi form Cari Bantuan atau Booking Bengkel → sistem menampilkan daftar mitra
sesuai jenis kendaraan dan jarak terdekat → user memilih mitra → order dikirim.
Verifikasi dengan membuka browser dan mencoba flow dari form sampai order tersimpan di database.
```

**Prompt Fase 2 (Agent B — Sisi Mitra):**
```
Lanjutkan project otova. Buat halaman registrasi dan dashboard mitra sesuai inventaris layar "Mitra"
dan kontrak API "Partners/Orders" pada dokumen ini. Terapkan status awal "pending" setelah registrasi,
dan flow status order: Diterima → Menuju Lokasi → Tiba → Inspeksi → (opsional) Menunggu Persetujuan
Biaya → Sedang Dikerjakan. Verifikasi lewat browser dengan mendaftarkan mitra baru dan mensimulasikan
penerimaan order.
```

**Prompt Fase 3 (Agent C — Sisi Admin):**
```
Lanjutkan project otova. Buat dashboard admin sesuai inventaris layar "Admin": Verifikasi Mitra,
Kelola User, Kelola Mitra, Kelola Order, Kelola Booking, dan Review, sesuai kontrak API pada dokumen ini.
Pastikan admin bisa menyetujui/menolak mitra pending dan perubahan statusnya langsung memengaruhi
akses mitra tersebut.
```

**Prompt Fase 4 (Agent D — Pembayaran):**
```
Lanjutkan project otova. Implementasikan flow pembayaran MVP: pilihan Tunai atau QRIS milik mitra
(gambar QRIS di-upload manual oleh mitra, bukan payment gateway). Setelah mitra menekan
"Pekerjaan Selesai" dan user menekan "Konfirmasi", tampilkan form rating & review sesuai tabel reviews.
```

**Prompt Fase 5 (integrasi akhir):**
```
Integrasikan notifikasi lintas modul (order baru, perubahan biaya, verifikasi mitra) menggunakan
tabel notifications. Lakukan uji end-to-end untuk kedua flow utama (Cari Bantuan dan Booking Bengkel)
dari awal sampai status "Ditutup", lalu rapikan tampilan agar responsive di mobile dan desktop.
```

---

## 7. Data Dummy (Seed) yang Disarankan

- 2 user, masing-masing dengan 1 motor & 1 mobil sebagai konteks keluhan
- 3 mitra bengkel (status approved), 2 teknisi freelance (1 approved, 1 pending), 1 tambal ban keliling (approved)
- 3–5 order contoh yang mencakup beberapa status berbeda (Menunggu Mitra, Sedang Dikerjakan, Ditutup) supaya semua tampilan riwayat/dashboard punya isi saat pertama kali dibuka

---

### Catatan
Jalankan Fase 0 lebih dulu sampai acceptance criteria-nya terpenuhi sebelum membuka beberapa agent paralel — kalau fondasi (schema + auth) belum stabil, kerja paralel di fase berikutnya berisiko saling bentrok.
