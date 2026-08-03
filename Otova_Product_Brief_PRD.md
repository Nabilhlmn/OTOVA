# OTOVA
### Platform Bantuan Kendaraan & Booking Bengkel Berbasis Web
**Product Brief & Product Requirements Document (PRD)**

Versi 1.0 | MVP untuk Kompetisi/Lomba
Disusun: 3 Agustus 2026

---

## Daftar Isi

**Bagian 1 — Product Brief**
- [1.1 Ringkasan Produk](#11-ringkasan-produk)
- [1.2 Latar Belakang & Masalah](#12-latar-belakang--masalah)
- [1.3 Solusi yang Ditawarkan](#13-solusi-yang-ditawarkan)
- [1.4 Target Pengguna](#14-target-pengguna)
- [1.5 Proposisi Nilai](#15-proposisi-nilai)
- [1.6 Model Bisnis (Usulan)](#16-model-bisnis-usulan)
- [1.7 Ruang Lingkup MVP (Versi Lomba)](#17-ruang-lingkup-mvp-versi-lomba)
- [1.8 Indikator Keberhasilan (Success Metrics)](#18-indikator-keberhasilan-success-metrics)

**Bagian 2 — Product Requirements Document (PRD)**
- [2.1 Tujuan Dokumen](#21-tujuan-dokumen)
- [2.2 Aktor Sistem](#22-aktor-sistem)
- [2.3 Flow Bisnis Utama](#23-flow-bisnis-utama)
- [2.4 Fitur User](#24-fitur-user)
- [2.5 Fitur Mitra](#25-fitur-mitra)
- [2.6 Fitur Admin](#26-fitur-admin)
- [2.7 Flow Booking Bengkel](#27-flow-booking-bengkel)
- [2.8 Status Order (Siklus Order)](#28-status-order-siklus-order)
- [2.9 Pembayaran (MVP)](#29-pembayaran-mvp)
- [2.10 Kebutuhan Non-Fungsional](#210-kebutuhan-non-fungsional)
- [2.11 Struktur Database Awal](#211-struktur-database-awal)
- [2.12 Asumsi](#212-asumsi)
- [2.13 Batasan / Out of Scope MVP](#213-batasan--out-of-scope-mvp)
- [2.14 Risiko & Mitigasi](#214-risiko--mitigasi)
- [2.15 Rekomendasi Tumpukan Teknologi (Usulan)](#215-rekomendasi-tumpukan-teknologi-usulan)
- [2.16 Roadmap Pengembangan Selanjutnya](#216-roadmap-pengembangan-selanjutnya)

---

## Bagian 1 — Product Brief

### 1.1 Ringkasan Produk

Otova adalah platform digital berbasis web yang menghubungkan pengguna kendaraan (motor dan mobil) dengan mitra penyedia jasa perbaikan dan bantuan darurat, terdiri dari bengkel, teknisi/montir freelance, dan layanan tambal ban keliling. Otova memudahkan pengguna mendapatkan bantuan kendaraan secara cepat saat darurat maupun melakukan booking servis terjadwal ke bengkel, dengan proses yang transparan mulai dari pemesanan, persetujuan biaya perbaikan, hingga pembayaran dan ulasan.

### 1.2 Latar Belakang & Masalah

- Pengguna kendaraan sering mengalami kendala teknis di jalan (mogok, ban bocor, aki lemah) namun kesulitan menemukan bantuan terdekat dan terpercaya dengan cepat.
- Proses mencari bengkel yang sesuai kebutuhan (jenis kendaraan, layanan, jam operasional) masih dilakukan secara manual dan kurang efisien.
- Minimnya transparansi biaya perbaikan menyebabkan ketidakpercayaan antara pengguna dan penyedia jasa, terutama saat ditemukan kerusakan tambahan pada saat inspeksi.
- Mitra informal seperti teknisi freelance dan tukang tambal ban keliling belum banyak terhubung dengan platform digital sehingga sulit memperluas jangkauan pelanggan.

### 1.3 Solusi yang Ditawarkan

Otova menjawab permasalahan tersebut melalui satu platform yang mempertemukan permintaan bantuan kendaraan dengan mitra terverifikasi secara real-time, dilengkapi dengan:

- Pencarian bantuan darurat berbasis lokasi (GPS).
- Sistem booking terjadwal untuk servis ke bengkel.
- Mekanisme persetujuan biaya tambahan yang transparan sebelum pekerjaan dilanjutkan.
- Proses verifikasi mitra oleh admin untuk menjaga kualitas dan keamanan layanan.

### 1.4 Target Pengguna

- **Pengguna Akhir (User)** — pemilik motor/mobil yang membutuhkan bantuan darurat atau servis terjadwal.
- **Mitra Bengkel** — usaha bengkel resmi maupun umum yang menyediakan layanan servis dan booking.
- **Mitra Teknisi/Montir Freelance** — individu yang menawarkan jasa perbaikan langsung di lokasi (on-site).
- **Mitra Tambal Ban Keliling** — penyedia jasa tambal ban yang bergerak/mobile.
- **Admin** — tim internal Otova yang mengelola verifikasi mitra dan operasional platform.

### 1.5 Proposisi Nilai

**Bagi User:**
- Bantuan kendaraan cepat berbasis lokasi terdekat.
- Transparansi biaya sebelum perbaikan dilanjutkan.
- Riwayat order dan pembayaran tercatat rapi.

**Bagi Mitra:**
- Perluasan jangkauan pelanggan tanpa perlu promosi mandiri.
- Pengelolaan order dan status kerja dalam satu dashboard.
- Reputasi terbangun melalui sistem rating dan review.

### 1.6 Model Bisnis (Usulan)

Untuk versi MVP/lomba, Otova belum menerapkan model monetisasi; fokus utama adalah validasi flow layanan. Untuk pengembangan berikutnya, model bisnis yang dapat dipertimbangkan antara lain: komisi per transaksi dari mitra, biaya keanggotaan/berlangganan untuk mitra bengkel, dan fitur promosi berbayar bagi mitra yang ingin tampil lebih menonjol.

### 1.7 Ruang Lingkup MVP (Versi Lomba)

**Termasuk dalam ruang lingkup:**
- Registrasi dan login User dan Mitra.
- Fitur Cari Bantuan dan Booking Bengkel.
- Verifikasi mitra oleh Admin.
- Flow order end-to-end hingga pembayaran manual dan review.
- Pengajuan dan persetujuan perubahan biaya.

**Tidak termasuk dalam ruang lingkup MVP:**
- Integrasi payment gateway (baru tunai & QRIS statis milik mitra).
- Live tracking lokasi mitra secara real-time di peta.
- Sistem chat langsung antara user dan mitra.
- Aplikasi mobile native (fokus awal adalah web app).

### 1.8 Indikator Keberhasilan (Success Metrics)

- Jumlah registrasi user dan mitra pada periode uji coba.
- Tingkat keberhasilan order (completion rate) dari total order masuk.
- Rata-rata waktu respons mitra terhadap order baru.
- Rating rata-rata mitra setelah beberapa transaksi.
- Tingkat retensi user (order/booking berulang).

---

## Bagian 2 — Product Requirements Document (PRD)

### 2.1 Tujuan Dokumen

Dokumen ini menjelaskan kebutuhan fungsional dan non-fungsional aplikasi Otova sebagai acuan bagi tim pengembang (developer, designer, QA) dalam membangun MVP, khususnya untuk kebutuhan pengembangan versi lomba/kompetisi.

### 2.2 Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| User | Pengguna yang membutuhkan bantuan kendaraan darurat atau ingin melakukan booking servis ke bengkel. |
| Mitra – Bengkel | Usaha bengkel yang menerima booking servis terjadwal dari user. |
| Mitra – Teknisi / Montir Freelance | Individu yang menerima order bantuan dan datang langsung ke lokasi user. |
| Mitra – Tambal Ban Keliling | Penyedia jasa tambal ban yang mendatangi lokasi user. |
| Admin | Mengelola verifikasi mitra dan seluruh aktivitas platform (user, order, booking, review). |

### 2.3 Flow Bisnis Utama

1. User membuka aplikasi.
2. Login / Register.
3. Memilih menu: Cari Bantuan atau Booking Bengkel.
4. Mengisi data kendaraan dan keluhan.
5. Sistem menampilkan daftar mitra yang sesuai.
6. User memilih mitra.
7. Order dikirim ke mitra.
8. Mitra menerima atau menolak order.
9. Jika diterima, mitra menuju lokasi (Cari Bantuan) atau menunggu user datang (Booking Bengkel).
10. Mitra melakukan pemeriksaan/inspeksi.
11. Jika ada perubahan biaya, mitra mengajukan perubahan melalui aplikasi; user menyetujui atau menolak.
12. Perbaikan dilakukan.
13. Pembayaran dilakukan, kemudian user memberikan review.

### 2.4 Fitur User

#### 2.4.1 Dashboard User

Menu utama pada dashboard user:
- Home
- Cari Bantuan
- Booking Bengkel
- Riwayat Order
- Profil

#### 2.4.2 Cari Bantuan

Data yang diisi user pada fitur Cari Bantuan:
- Jenis kendaraan (Motor / Mobil).
- Merek kendaraan.
- Keluhan.
- Upload foto kendaraan (opsional, tetapi disarankan).
- Lokasi otomatis dari GPS.

Setelah data dikirim, sistem menampilkan daftar mitra yang sesuai jenis kebutuhan dan berlokasi terdekat.

#### 2.4.3 Booking Bengkel

Pada fitur ini, user dapat:
- Melihat daftar bengkel.
- Melihat detail bengkel.
- Melihat layanan yang tersedia.
- Melihat rating bengkel.
- Melakukan booking tanggal dan jam.
- Menunggu konfirmasi dari bengkel.

#### 2.4.4 Riwayat Order

Halaman riwayat menampilkan:
- Order selesai.
- Order dibatalkan.
- Status pembayaran.

### 2.5 Fitur Mitra

#### 2.5.1 Registrasi Mitra

Saat registrasi, mitra memilih jenis mitra:
- Bengkel
- Teknisi
- Tambal Ban

Data yang diisi pada saat registrasi:
- Nama
- Nomor HP
- Email
- Alamat
- Lokasi
- Upload KTP
- Foto usaha / foto diri (menyesuaikan jenis mitra)

Status awal setelah registrasi adalah **"Menunggu Verifikasi Admin"**. Setelah disetujui, mitra dapat mengaktifkan status Online atau Offline.

#### 2.5.2 Dashboard Mitra

Menu utama pada dashboard mitra:
- Order Masuk
- Riwayat
- Profil
- Status Online / Offline

#### 2.5.3 Penanganan Order Masuk

Saat ada order baru, mitra menerima notifikasi dan memilih Terima atau Tolak. Jika order diterima, status order akan berjalan melalui tahapan berikut:

1. Menuju Lokasi
2. Tiba
3. Inspeksi

#### 2.5.4 Pengajuan Perubahan Biaya

Setelah inspeksi, jika ditemukan biaya tambahan, mitra memilih "Ajukan Perubahan Biaya" dan mengisi:
- Item tambahan
- Harga
- Alasan

User menerima notifikasi pengajuan dan memilih Setuju atau Tolak:
- Jika disetujui, total pembayaran diperbarui.
- Jika ditolak, pekerjaan tidak dilanjutkan atau mengikuti kebijakan pembatalan yang disepakati.

### 2.6 Fitur Admin

Dashboard admin menyediakan fitur:
- Verifikasi Mitra
- Kelola User
- Kelola Mitra
- Kelola Order
- Kelola Booking
- Melihat Review

### 2.7 Flow Booking Bengkel

1. User memilih bengkel.
2. Melihat detail bengkel.
3. Melakukan booking.
4. Bengkel menerima booking.
5. User datang ke bengkel.
6. Servis dilakukan.
7. Pembayaran.
8. Review.

### 2.8 Status Order (Siklus Order)

| No | Status | Keterangan |
|---|---|---|
| 1 | Menunggu Mitra | Order telah dikirim dan menunggu respons Terima/Tolak dari mitra. |
| 2 | Diterima | Mitra menerima order dan bersiap menuju lokasi atau menunggu user. |
| 3 | Menuju Lokasi | Mitra dalam perjalanan menuju lokasi user (khusus Cari Bantuan). |
| 4 | Tiba | Mitra telah tiba di lokasi atau user telah tiba di bengkel. |
| 5 | Inspeksi | Mitra melakukan pemeriksaan awal kondisi kendaraan. |
| 6 | Menunggu Persetujuan Biaya | Berlaku jika mitra mengajukan perubahan biaya dan menunggu keputusan user. |
| 7 | Sedang Dikerjakan | Proses perbaikan/servis sedang berlangsung. |
| 8 | Selesai | Pekerjaan telah selesai dikerjakan oleh mitra. |
| 9 | Dibayar | Pembayaran telah dikonfirmasi oleh kedua pihak. |
| 10 | Ditutup | Order selesai penuh, termasuk proses review dari user. |

### 2.9 Pembayaran (MVP)

Untuk versi lomba, pembayaran dibuat sederhana dengan dua pilihan metode:
- Tunai
- QRIS milik mitra (statis, bukan payment gateway terpusat)

Alur konfirmasi pembayaran:
- Mitra menekan "Pekerjaan Selesai".
- User menekan "Konfirmasi".
- User memberikan rating dan ulasan (review).

> Catatan: Integrasi payment gateway (misalnya Midtrans/Xendit) dapat menjadi pengembangan pada versi berikutnya.

### 2.10 Kebutuhan Non-Fungsional

- **Performa** — waktu respons pencarian mitra maksimal beberapa detik untuk pengalaman yang lancar, terutama pada kondisi darurat.
- **Keamanan** — data KTP dan data pribadi user/mitra disimpan dan diakses secara terbatas; kata sandi disimpan dalam bentuk terenkripsi (hash).
- **Ketersediaan** — aplikasi web dapat diakses melalui browser desktop maupun mobile (responsive design).
- **Skalabilitas** — struktur data mendukung penambahan jenis mitra atau layanan baru di kemudian hari.
- **Usability** — antarmuka sederhana dan minim langkah, sesuai untuk kondisi darurat pengguna di jalan.

### 2.11 Struktur Database Awal

Rancangan skema berikut merupakan usulan struktur awal untuk 7 tabel utama yang disebutkan pada kebutuhan aplikasi, lengkap dengan usulan kolom sebagai acuan tim pengembang.

#### 2.11.1 Tabel `users`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| full_name | VARCHAR | Nama lengkap pengguna. |
| email | VARCHAR (unique) | Alamat email untuk login. |
| phone_number | VARCHAR | Nomor HP pengguna. |
| password_hash | VARCHAR | Kata sandi terenkripsi. |
| role | ENUM (user, mitra, admin) | Menentukan hak akses pada sistem. |
| profile_photo | VARCHAR (URL) | Foto profil pengguna. |
| address | TEXT | Alamat pengguna. |
| latitude / longitude | DECIMAL | Koordinat lokasi pengguna. |
| created_at / updated_at | TIMESTAMP | Waktu pembuatan/pembaruan data. |

#### 2.11.2 Tabel `partners` (Mitra)

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| user_id | FK → users.id | Relasi ke akun dasar mitra. |
| partner_type | ENUM (bengkel, teknisi, tambal_ban) | Jenis mitra. |
| business_name | VARCHAR | Nama usaha atau nama mitra. |
| ktp_photo | VARCHAR (URL) | Foto KTP untuk verifikasi. |
| business_photo | VARCHAR (URL) | Foto usaha/diri sesuai jenis mitra. |
| address | TEXT | Alamat usaha/domisili mitra. |
| latitude / longitude | DECIMAL | Koordinat lokasi mitra. |
| verification_status | ENUM (pending, approved, rejected) | Status verifikasi oleh admin. |
| is_online | BOOLEAN | Status ketersediaan mitra. |
| rating_average | DECIMAL | Rata-rata rating mitra. |
| created_at / updated_at | TIMESTAMP | Waktu pembuatan/pembaruan data. |

#### 2.11.3 Tabel `orders`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| order_code | VARCHAR | Kode unik order. |
| user_id | FK → users.id | User pemilik order. |
| partner_id | FK → partners.id | Mitra yang menerima order. |
| order_type | ENUM (cari_bantuan, booking_bengkel) | Jenis permintaan. |
| vehicle_type | ENUM (motor, mobil) | Jenis kendaraan. |
| vehicle_brand | VARCHAR | Merek kendaraan. |
| complaint | TEXT | Keluhan yang diisi user. |
| vehicle_photo | VARCHAR (URL, nullable) | Foto kendaraan (opsional). |
| status | ENUM (10 status) | Status order berjalan, lihat bagian 2.8. |
| subtotal_cost | DECIMAL | Estimasi biaya awal. |
| additional_cost | DECIMAL (nullable) | Biaya tambahan hasil inspeksi. |
| total_cost | DECIMAL | Total biaya akhir. |
| created_at / updated_at | TIMESTAMP | Waktu pembuatan/pembaruan data. |

#### 2.11.4 Tabel `bookings`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| order_id | FK → orders.id | Relasi ke order Booking Bengkel. |
| partner_id | FK → partners.id | Bengkel tujuan booking. |
| booking_date | DATE | Tanggal booking. |
| booking_time | TIME | Jam booking. |
| service_type | VARCHAR | Jenis layanan yang dipilih. |
| status | ENUM (menunggu_konfirmasi, dikonfirmasi, ditolak, selesai) | Status booking. |
| created_at / updated_at | TIMESTAMP | Waktu pembuatan/pembaruan data. |

#### 2.11.5 Tabel `reviews`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| order_id | FK → orders.id | Order yang diulas. |
| user_id | FK → users.id | User pemberi ulasan. |
| partner_id | FK → partners.id | Mitra yang diulas. |
| rating | INT (1–5) | Nilai rating. |
| comment | TEXT (nullable) | Komentar ulasan. |
| created_at | TIMESTAMP | Waktu ulasan dibuat. |

#### 2.11.6 Tabel `payments`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| order_id | FK → orders.id | Order terkait pembayaran. |
| payment_method | ENUM (tunai, qris) | Metode pembayaran MVP. |
| amount | DECIMAL | Jumlah yang dibayarkan. |
| payment_status | ENUM (pending, paid) | Status pembayaran. |
| paid_at | TIMESTAMP (nullable) | Waktu pembayaran dikonfirmasi. |
| created_at | TIMESTAMP | Waktu data dibuat. |

#### 2.11.7 Tabel `notifications`

| Field | Tipe Data | Keterangan |
|---|---|---|
| id | INT / UUID (PK) | Primary key. |
| recipient_id | FK → users.id | Penerima notifikasi (user/mitra). |
| title | VARCHAR | Judul notifikasi. |
| message | TEXT | Isi notifikasi. |
| type | VARCHAR | Contoh: order_baru, perubahan_biaya, verifikasi_mitra. |
| is_read | BOOLEAN | Status sudah/belum dibaca. |
| created_at | TIMESTAMP | Waktu notifikasi dibuat. |

### 2.12 Asumsi

- Mitra tetap memiliki akun dasar (relasi ke tabel `users`) yang diperluas melalui tabel `partners`.
- Lokasi user dan mitra disimpan sebagai koordinat latitude/longitude untuk pencarian mitra terdekat.
- Satu order hanya memiliki satu pengajuan perubahan biaya aktif dalam satu waktu.
- QRIS yang digunakan adalah QRIS statis milik masing-masing mitra, bukan QRIS terpusat milik platform.

### 2.13 Batasan / Out of Scope MVP

- Tidak ada sistem dispatch otomatis (penugasan mitra oleh sistem); user memilih mitra secara manual dari daftar.
- Tidak ada fitur chat real-time di dalam aplikasi; komunikasi lanjutan disarankan melalui telepon.
- Tidak ada manajemen inventori/stok sparepart mitra.
- Tidak ada integrasi payment gateway pada versi MVP.

### 2.14 Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Mitra fiktif atau tidak valid mendaftar | Menurunkan kepercayaan user | Verifikasi KTP & foto usaha oleh Admin sebelum mitra dapat aktif. |
| Mitra mengajukan biaya tambahan tidak wajar | Menimbulkan komplain user | Perubahan biaya wajib disetujui user sebelum pekerjaan dilanjutkan. |
| Data lokasi GPS tidak akurat | Pencarian mitra menjadi tidak relevan | Sediakan input alamat manual sebagai pelengkap data GPS. |
| Pembayaran tunai/QRIS tidak tercatat otomatis | Rekap transaksi tidak akurat | Konfirmasi dua arah (mitra & user) sebelum status order menjadi "Dibayar". |

### 2.15 Rekomendasi Tumpukan Teknologi (Usulan)

Bagian ini bersifat usulan awal dan dapat disesuaikan dengan kebutuhan serta preferensi tim pengembang.

- **Frontend**: React.js atau Next.js dengan pendekatan desain responsive.
- **Backend**: Node.js (Express) atau Laravel.
- **Database**: PostgreSQL atau MySQL.
- **Autentikasi**: JWT-based authentication.
- **Penyimpanan file** (foto KTP, foto kendaraan, dsb.): layanan cloud storage seperti Amazon S3 atau Firebase Storage.
- **Notifikasi**: web push notification atau email.

### 2.16 Roadmap Pengembangan Selanjutnya

- Integrasi payment gateway (misalnya Midtrans atau Xendit).
- Live tracking lokasi mitra secara real-time pada peta.
- Fitur chat in-app antara user dan mitra.
- Pengembangan aplikasi mobile (Android/iOS).
- Sistem dispatch otomatis berbasis kedekatan lokasi dan rating mitra.
