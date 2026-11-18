# Gemini Canvas — Product Ad Image Generator

Aplikasi web untuk membuat visual iklan produk, menghasilkan prompt dan caption dengan AI, mengelola hasil gambar, serta mengatur kalender konten.

Aplikasi menggunakan **Gemini Canvas Native API Runtime** untuk fitur AI. Karena dijalankan di dalam Gemini Canvas, aplikasi tidak meminta pengguna memasukkan atau menyimpan Gemini API key.

## Cara Kerja

### AI — Gemini Canvas Native API Runtime

- Fitur AI dijalankan melalui native API runtime yang disediakan oleh Gemini Canvas.
- Tidak memerlukan Gemini API key dari pengguna.
- Tidak perlu menambahkan atau menyimpan API key Gemini di `index.html`.
- Aplikasi harus dijalankan di lingkungan Gemini Canvas yang menyediakan native runtime tersebut.
- Jika dijalankan di browser biasa atau hosting di luar Gemini Canvas, fitur yang bergantung pada native runtime tidak otomatis tersedia.

> **Penting:** Tidak menggunakan Gemini API key bukan berarti aplikasi tidak menggunakan layanan backend. Koneksi ke Supabase tetap digunakan untuk operasi data dan file.

### Backend — Supabase

Aplikasi terhubung ke Supabase Edge Functions untuk mengambil dan memperbarui data aplikasi.

Endpoint yang digunakan:

| Fungsi | Endpoint |
| --- | --- |
| Prompt data | `/functions/v1/crud-make-prompt` |
| Calendar webhook | `/functions/v1/crud-make-webhook` |
| Upload gambar | `/functions/v1/crud-make-prompt/upload` |

Base URL yang dikonfigurasi saat ini:

`https://jhpbtooefyzdndstlzva.supabase.co`

Aplikasi juga menggunakan logo publik dari Supabase Storage.

## Fitur

- **Template** — melihat dan memilih data prompt/template produk.
- **AI Prompt Generator** — membuat prompt berdasarkan produk dan data referensi yang tersedia.
- **Image Generation** — menghasilkan visual iklan produk melalui AI runtime.
- **AI Caption** — membuat caption berdasarkan konten/gambar yang dihasilkan.
- **Image Preview** — melihat hasil gambar dalam rasio 4:5 dan tampilan penuh.
- **Download Image** — mengunduh hasil gambar.
- **Logo Upload** — memilih logo untuk digunakan pada proses pembuatan visual.
- **Image Upload** — mengunggah hasil gambar dan memperoleh public URL.
- **Save Image URL** — menyimpan URL gambar ke data prompt.
- **History / Schedule** — melihat hasil yang siap dijadwalkan.
- **Content Calendar** — melihat data jadwal konten.
- **Schedule Post** — menjadwalkan konten pada slot waktu yang tersedia.

Slot jadwal yang digunakan:

- 09:00
- 13:00
- 19:00

Zona waktu kalender: **Asia/Kuala_Lumpur (MYT)**.

## Teknologi

- HTML
- JavaScript
- Tailwind CSS
- Lucide Icons
- Gemini Canvas Native API Runtime
- Supabase Edge Functions
- Supabase Storage

## Menjalankan Aplikasi

1. Buka Gemini Canvas.
2. Buka atau buat aplikasi di lingkungan Gemini Canvas.
3. Gunakan `index.html` sebagai dokumen aplikasi.
4. Jalankan aplikasi melalui preview/runtime Gemini Canvas.
5. Pastikan Gemini Canvas menyediakan akses ke native API runtime.
6. Pastikan endpoint Supabase yang digunakan aplikasi aktif dan dapat diakses.

Tidak diperlukan konfigurasi Gemini API key di dalam `index.html`.

## Konfigurasi Backend

Endpoint Supabase saat ini ditetapkan di kode aplikasi. Jika project atau endpoint backend berubah, sesuaikan URL Edge Function dan URL Storage yang digunakan.

Pastikan Edge Functions memiliki konfigurasi CORS yang mengizinkan origin/runtime aplikasi dan menerapkan validasi serta otorisasi sesuai kebutuhan.

Jangan menaruh Supabase service-role key, secret key, atau kredensial server di kode frontend. Jika backend memerlukan autentikasi, gunakan mekanisme autentikasi yang aman dan sesuai dengan konfigurasi Edge Functions.

## Menjalankan di Luar Gemini Canvas

Aplikasi ini ditujukan untuk berjalan di Gemini Canvas. Runtime AI native yang tersedia di Gemini Canvas tidak boleh diasumsikan tersedia pada browser biasa, GitHub Pages, atau hosting statis.

Jika ingin menjalankan aplikasi di luar Gemini Canvas, integrasi AI perlu disesuaikan dengan runtime/provider yang tersedia di lingkungan tujuan. Perubahan tersebut berada di luar konfigurasi tanpa API key untuk Gemini Canvas.

## Repository

Source code: https://github.com/applestoree/gemini-canvas

---

**Project:** Gemini Canvas — Product Ad Image Generator  
**Runtime AI:** Gemini Canvas Native API Runtime  
**Gemini API Key:** Tidak diperlukan saat berjalan di Gemini Canvas  
