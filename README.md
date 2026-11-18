# Gemini Canvas — Product Ad Image Generator

Aplikasi web untuk membuat visual iklan produk berbasis template, menyusun prompt dengan bantuan AI, menyimpan hasil gambar, dan mengelola riwayat serta jadwal konten.

Aplikasi utama berada di `index.html` dan ditulis menggunakan HTML, CSS, serta Vanilla JavaScript. Antarmuka dirender langsung ke elemen `#app`.

> **Catatan penting tentang AI runtime:** kode `index.html` saat ini belum memanggil Gemini Canvas Native API Runtime. Dua fitur AI masih mengirim HTTP request langsung ke Google Gemini Generative Language API. Nilai API key di kode saat ini adalah string kosong (`''`). Karena itu, README ini tidak menyatakan bahwa integrasi AI sudah berjalan tanpa API key atau sudah menggunakan native runtime.

## Fitur Aplikasi

### Templates
- Mengambil daftar template produk dari Supabase Edge Function.
- Memilih template untuk memulai pembuatan visual iklan.
- Membaca ulang detail template berdasarkan ID.
- Menampilkan status template dan hasil proses.

### AI Prompt Generator
- Menerima nama produk dan instruksi tambahan.
- Mengambil data referensi prompt dari backend.
- Mengirim instruksi dan referensi ke model `gemini-3-flash-preview`.
- Menampilkan prompt yang dihasilkan dan menyediakan tombol salin.

### Image Generation
- Membuat prompt visual dari variabel template.
- Menyertakan logo brand sebagai gambar referensi.
- Meminta gambar dengan model `gemini-3.1-flash-image`.
- Mengatur rasio gambar menjadi 4:5.
- Menampilkan hasil gambar dan menyediakan fitur unduh.

### Image Upload dan Penyimpanan
- Mengunggah gambar hasil generasi ke endpoint upload.
- Menerima public image URL dari backend.
- Menyimpan `image_url` dan status `is_ready` pada record template.

### History dan Content Calendar
- Melihat daftar hasil yang telah selesai.
- Melihat detail gambar dan caption yang tersedia pada record.
- Menjadwalkan post melalui backend.
- Menampilkan kalender dengan tiga slot harian: 09:00, 13:00, dan 19:00.
- Menggunakan zona waktu `Asia/Kuala_Lumpur` (MYT).

### Settings
- Mengunggah logo brand untuk sesi aplikasi.
- Mengatur nama produk dan instruksi tambahan untuk AI Prompt Generator.

**AI Caption Generator terpisah belum diimplementasikan** dalam `index.html`. Caption yang ditampilkan pada History atau Calendar berasal dari data record backend.

## Arsitektur dan Alur Kerja

```
index.html
   |
   +-- UI: HTML + Tailwind CSS + Vanilla JavaScript
   |
   +-- Google Gemini Generative Language API
   |      +-- gemini-3-flash-preview (AI Prompt Generator)
   |      +-- gemini-3.1-flash-image (Image Generation)
   |
   +-- Supabase Edge Functions
          +-- crud-make-prompt
          +-- crud-make-prompt/upload
          +-- crud-make-webhook
   |
   +-- Supabase Storage
          +-- Default brand logo
          +-- Uploaded generated images
```

## Integrasi AI Saat Ini

Saat ini `index.html` menggunakan request HTTP langsung ke endpoint Google:

| Fitur | Model | Mekanisme |
| --- | --- | --- |
| AI Prompt Generator | `gemini-3-flash-preview` | REST `generateContent` |
| Image Generation | `gemini-3.1-flash-image` | REST `generateContent` dengan output image |

Kedua request membangun URL dengan parameter `?key=` dan variabel `apiKey` yang saat ini diisi string kosong.

Konsekuensinya:
- Integrasi ini **bukan** pemanggilan Gemini Canvas Native API Runtime.
- Kode saat ini tidak menyediakan API key yang valid.
- Keberhasilan request AI tidak dapat dijamin sampai mekanisme autentikasi/API key dikonfigurasi atau integrasi diganti dengan API runtime yang benar.
- Menjalankan file di Gemini Canvas saja tidak otomatis mengubah request REST tersebut menjadi native runtime.

Jika tujuan pengembangan adalah menggunakan Gemini Canvas Native API Runtime tanpa API key yang dikelola aplikasi, implementasi pemanggilan AI di `index.html` masih perlu disesuaikan. README ini mendokumentasikan kondisi kode saat ini, bukan target integrasi yang belum diterapkan.

## Integrasi Supabase

Base URL yang ditetapkan di kode:

`https://jhpbtooefyzdndstlzva.supabase.co`

Endpoint yang digunakan:

| Kegunaan | Endpoint |
| --- | --- |
| Membaca dan memperbarui data prompt/template | `/functions/v1/crud-make-prompt` |
| Upload gambar | `/functions/v1/crud-make-prompt/upload` |
| Operasi kalender dan penjadwalan melalui webhook | `/functions/v1/crud-make-webhook` |
| Default brand logo | `/storage/v1/object/public/apple/logo.png` |

Header Supabase `apikey` dan `Authorization` hanya ditambahkan oleh helper aplikasi jika `state.anonKey` memiliki nilai. Pada kode saat ini, nilai awal `state.anonKey` adalah string kosong.

Edge Functions harus dikonfigurasi sesuai metode akses yang digunakan aplikasi, termasuk CORS, autentikasi, validasi input, dan otorisasi. Jangan menaruh Supabase service-role key atau secret server di frontend.

## Teknologi

- HTML5
- Vanilla JavaScript
- Tailwind CSS melalui CDN
- Lucide Icons
- Google Fonts — Inter
- Google Gemini Generative Language API (REST)
- Supabase Edge Functions
- Supabase Storage

## Menjalankan di Gemini Canvas

1. Buka project di Gemini Canvas.
2. Gunakan `index.html` sebagai file aplikasi.
3. Jalankan melalui preview Gemini Canvas.
4. Pastikan koneksi ke endpoint Supabase tersedia.
5. Untuk fitur AI, pastikan mekanisme autentikasi Google Gemini API telah dikonfigurasi dengan benar atau implementasi AI telah diperbarui agar menggunakan runtime yang disediakan Gemini Canvas.

## Menjalankan di Browser atau Hosting Lain

Aplikasi menggunakan HTML dan JavaScript standar, tetapi operasionalnya bergantung pada akses jaringan ke Google Gemini API dan Supabase. Jika dijalankan di browser atau hosting lain, pastikan:
- Endpoint backend mengizinkan origin aplikasi melalui CORS.
- Mekanisme autentikasi API tersedia dan aman.
- Tidak ada kredensial rahasia server yang disimpan di kode frontend.

## Repository

Source code: https://github.com/applestoree/gemini-canvas

---

**Project:** Gemini Canvas — Product Ad Image Generator  
**Main file:** `index.html`  
**AI integration in current code:** Google Gemini REST API  
**Gemini Canvas Native API Runtime:** Belum diimplementasikan pada pemanggilan AI saat ini  
