# Gemini Canvas — Product Ad Image Generator

Aplikasi web untuk membuat visual iklan produk berbasis template, menyusun prompt dengan bantuan AI, menyimpan hasil gambar, dan mengelola riwayat serta jadwal konten.

Aplikasi utama berada di `index.html` dan ditulis menggunakan HTML, CSS, serta Vanilla JavaScript. Antarmuka dirender langsung ke elemen `#app`.

> **Catatan penting tentang AI runtime:** kode `index.html` saat ini belum memanggil Gemini Canvas Native API Runtime. Dua fitur AI masih mengirim HTTP request langsung ke Google Gemini Generative Language API. Nilai API key di kode saat ini adalah string kosong (`''`). Karena itu, README ini tidak menyatakan bahwa integrasi AI sudah berjalan tanpa API key atau sudah menggunakan native runtime.

## Prosedur Wajib Sebelum Audit `index.html`

**WAJIB:** Setiap audit, pemeriksaan, analisis, atau review terhadap `index.html` harus dimulai dengan membaca [`aturan.md`](aturan.md) secara lengkap. Setelah itu baca `README.md` untuk memahami dokumentasi proyek, lalu ambil versi terbaru `index.html` dari branch yang sedang diperiksa. Jangan memulai audit sebelum membaca kedua dokumen tersebut.

Ketentuan audit:
- Jadikan `aturan.md` sebagai aturan kerja dan batasan utama.
- Pisahkan fakta yang diverifikasi dari dugaan atau hal yang belum dapat diuji.
- Audit tidak otomatis memberi izin untuk mengubah kode.
- Jangan mengubah arsitektur runtime atau menambahkan kebutuhan Gemini API Key yang dikelola aplikasi; ikuti ketentuan runtime dalam `aturan.md`.
- Jika menemukan konflik antara kode/dokumentasi dan `aturan.md`, laporkan konflik dan minta konfirmasi sebelum perubahan arsitektural.

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

### Project

| Properti | Nilai |
| --- | --- |
| Project URL | `https://jhpbtooefyzdndstlzva.supabase.co` |
| Region | `ap-southeast-1` (Singapore) |
| Edge Functions base | `https://jhpbtooefyzdndstlzva.supabase.co/functions/v1` |

Aplikasi menggunakan dua Edge Function berikut. Dokumentasi ini disusun dengan memeriksa source code Edge Function yang aktif dan mencocokkannya dengan pemanggilan di `index.html`.

### 1. `crud-make-prompt`

**Base URL**

```text
https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-prompt
```

**Tanggung jawab**

Mengelola template/prompt produk pada tabel `public.make_prompt`, termasuk membaca daftar template, menyimpan prompt hasil AI, memperbarui status hasil generasi, dan mengunggah atau menghapus gambar.

**Database**

| Field | Keterangan |
| --- | --- |
| `id` | ID record; wajib disediakan pada operasi create |
| `product` | Nama produk |
| `headline` | Headline iklan |
| `subheadline` | Subheadline iklan |
| `feature_items` | Array tepat 3 objek; setiap objek hanya memiliki `icon` dan `title`; title maksimal 4 kata |
| `style` | Gaya desain |
| `composition` | Komposisi visual |
| `background` | Latar belakang |
| `typography` | Tipografi |
| `lighting` | Pencahayaan |
| `visual_style` | Gaya visual |
| `image_url` | URL gambar hasil upload |
| `is_ready` | Status kesiapan hasil |
| `caption` | Caption |
| `categories` | Kategori |

Hanya field yang tercantum sebagai editable oleh Edge Function yang dapat ditulis melalui endpoint ini. Field lain akan diabaikan saat pemilihan payload.

**Endpoint dan kontrak**

| Method | Path | Fungsi |
| --- | --- | --- |
| `GET` | `/` | Mengambil semua record `make_prompt`, diurutkan berdasarkan `id` ascending; respons berupa array |
| `GET` | `/?id={id}` | Mengambil satu record; respons berupa object; jika tidak ditemukan, HTTP 404 |
| `POST` | `/` | Membuat record prompt |
| `PATCH` | `/?id={id}` | Memperbarui field yang diizinkan pada record |
| `POST` | `/upload` | Upload gambar ke Supabase Storage |
| `DELETE` | `/upload?path={object_path}` | Menghapus gambar dari Storage berdasarkan object path yang valid |

Contoh create prompt:

```json
{
  "id": "unique-prompt-id",
  "product": "Apple Watch",
  "headline": "A healthier you",
  "subheadline": "A smarter way to stay active",
  "feature_items": [
    { "icon": "heart-pulse", "title": "Health insights" },
    { "icon": "activity", "title": "Fitness tracking" },
    { "icon": "battery-full", "title": "All-day battery" }
  ]
}
```

Create memerlukan `id`, `product`, `headline`, `subheadline`, dan `feature_items` yang valid. Field lain bersifat opsional sesuai daftar editable.

Contoh update prompt:

```http
PATCH /functions/v1/crud-make-prompt?id={id}
Content-Type: application/json
```

```json
{
  "image_url": "https://example.com/generated-image.png",
  "caption": "Caption post",
  "is_ready": true
}
```

Upload gambar menggunakan `multipart/form-data` dengan field file bernama `file`. Format yang diterima: JPEG, PNG, WEBP; ukuran maksimum 10 MB. File disimpan ke bucket `images` dengan object path `uploads/{uuid}.{jpg|png|webp}`. Respons sukses HTTP 201 berisi `bucket`, `path`, dan `image_url` (public URL).

Delete upload menggunakan query parameter `path` dengan object path `uploads/...` yang dikembalikan oleh endpoint upload. Endpoint menolak path yang tidak sesuai pola tersebut.

**Alur integrasi di `index.html`**

1. Saat aplikasi dibuka, `loadRecords()` memanggil `GET /`; UI Template hanya menampilkan record dengan `is_ready === false`.
2. `loadHistory()` juga memanggil `GET /`; UI History menampilkan record dengan `is_ready === true`.
3. AI Prompt Generator membaca daftar record melalui `GET /`, membuat ID yang belum digunakan, lalu menyimpan hasil JSON dengan `POST /`.
4. Setelah image generation, `uploadGeneratedImageToEdge()` mengirim file melalui `POST /upload`.
5. Setelah upload berhasil, `saveImageUrlToPromptRecord()` menjalankan `PATCH /?id={id}` untuk menyimpan `image_url`, `caption`, dan `is_ready: true`.
6. Setelah jadwal berhasil dibuat, aplikasi menjalankan `PATCH /?id={id}` untuk mengosongkan `image_url` dan `caption` pada record prompt.

### 2. `crud-make-webhook`

**Base URL**

```text
https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/crud-make-webhook
```

**Tanggung jawab**

Mengelola record jadwal konten pada tabel `public.make_webhook`, termasuk membaca jadwal, membuat jadwal, memperbarui jadwal, menghapus jadwal, dan mengelola file gambar terkait.

**Database**

| Field | Keterangan |
| --- | --- |
| `id` | UUID yang dibuat database; primary key |
| `image_url` | URL publik gambar atau URL gambar yang sudah tersedia |
| `caption` | Caption post |
| `date` | Tanggal publikasi, format `YYYY-MM-DD` |
| `time` | Waktu publikasi, format `HH:mm` atau `HH:mm:ss` |

**Endpoint dan kontrak**

| Method | Path | Fungsi |
| --- | --- | --- |
| `GET` | `/docs` | Mengembalikan dokumentasi API dalam JSON |
| `GET` | `/get` | Mengambil semua jadwal; opsional `?id={uuid}` untuk satu record |
| `POST` | `/post` | Membuat jadwal; `date` dan `time` wajib |
| `PATCH` | `/patch` | Memperbarui record berdasarkan field `id` pada body |
| `DELETE` | `/deleted` | Menghapus record berdasarkan field `id` pada body |

GET mengembalikan bentuk `{ "success": true, "data": ... }`. Data list diurutkan berdasarkan `date` lalu `time` secara ascending. Jika `id` diminta tetapi tidak ditemukan, respons HTTP 404.

Contoh create jadwal (format yang digunakan aplikasi):

```http
POST /functions/v1/crud-make-webhook/post
Content-Type: application/json
```

```json
{
  "image_url": "https://example.com/generated-image.png",
  "caption": "Instagram caption",
  "date": "2026-11-20",
  "time": "09:00"
}
```

Untuk `POST`, `date` dan `time` wajib. `image_url` dan `caption` boleh berupa string atau null. Field yang tidak dikenal ditolak.

PATCH menggunakan body yang memuat `id` dan minimal satu field yang akan diubah:

```json
{
  "id": "existing-record-uuid",
  "caption": "Updated caption",
  "time": "13:00"
}
```

DELETE menggunakan body JSON:

```json
{
  "id": "existing-record-uuid"
}
```

**Upload gambar melalui webhook**

Endpoint `POST /post` dan `PATCH /patch` juga menerima `multipart/form-data`. File dapat dikirim pada field `image_url` atau `image`; field lain seperti `caption`, `date`, `time`, dan untuk PATCH `id` dikirim sebagai string. Tipe file yang diterima: JPEG, PNG, WEBP, GIF, AVIF; ukuran maksimum 10 MB. File disimpan ke bucket `calendar` pada path `make_webhook/{uuid}.{extension}`. Endpoint menghasilkan public URL dan mengisi `image_url`. Saat gambar diganti atau record dihapus, function mencoba menghapus file lama dari bucket.

JSON request juga dapat mengirim `image_url` sebagai URL yang sudah tersedia, sehingga upload file tidak wajib.

**Alur integrasi di `index.html`**

1. `loadCalendar()` memanggil `GET /get` untuk menampilkan data kalender.
2. `loadScheduleAvailability(date)` memanggil `GET /get`, lalu memeriksa pasangan tanggal dan waktu yang sudah terpakai.
3. `handleScheduleRecord(record)` memeriksa ulang jadwal melalui `GET /get` sebelum menyimpan, untuk mengurangi risiko dua post memakai slot yang sama.
4. Jika slot masih tersedia, aplikasi mengirim `POST /post` dengan `image_url`, `caption`, `date`, dan `time`.
5. Jika pembuatan jadwal berhasil, aplikasi mengosongkan `image_url` dan `caption` pada record prompt melalui `crud-make-prompt`, lalu memuat ulang Calendar, Templates, dan History.

Slot waktu yang ditampilkan UI adalah `09:00`, `13:00`, dan `19:00` dengan zona waktu aplikasi `Asia/Kuala_Lumpur`. Validasi konflik slot dilakukan oleh frontend melalui pembacaan jadwal; source Edge Function tidak menunjukkan constraint database unik untuk kombinasi tanggal dan waktu. Untuk konsistensi saat ada request bersamaan, pertimbangkan validasi/constraint atomik di backend sebagai pekerjaan terpisah.

### Header, CORS, dan autentikasi

Kedua function menangani request preflight `OPTIONS` dan mengizinkan origin CORS `*`. Header yang diizinkan meliputi `authorization`, `x-client-info`, `apikey`, dan `content-type`.

Frontend menggunakan helper `getEdgeHeaders()`:
- `Content-Type: application/json` ditambahkan untuk request JSON.
- Header `apikey` dan `Authorization: Bearer ...` hanya dikirim jika `state.anonKey` berisi nilai.
- Upload multipart tidak menetapkan `Content-Type` secara manual agar browser membuat boundary.

Konfigurasi function yang dibaca:
- `crud-make-prompt`: `verify_jwt = false`; function membuat Supabase client menggunakan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`, serta meneruskan header Authorization jika ada. Akses tabel mengikuti privilege/RLS database.
- `crud-make-webhook`: `verify_jwt = false`; function menggunakan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di sisi server untuk mengakses tabel dan Storage.

**Peringatan keamanan penting:** kedua endpoint dapat dipanggil tanpa verifikasi JWT pada gateway. Khusus `crud-make-webhook`, source menggunakan service-role key di backend dan tidak menunjukkan pemeriksaan API key, signature, atau identitas pengguna pada handler. Dengan CORS `*`, endpoint ini secara efektif merupakan API publik untuk membaca, membuat, mengubah, dan menghapus data `make_webhook` serta mengelola file pada bucket `calendar`. Jangan menganggap CORS sebagai mekanisme autentikasi. Batasi akses dengan autentikasi/otorisasi server-side atau mekanisme signature/API key sebelum menggunakannya untuk data produksi yang tidak boleh diakses publik. Jangan pernah menaruh service-role key di frontend.

Untuk `crud-make-prompt`, `verify_jwt = false` juga berarti gateway tidak mewajibkan JWT. Jangan menganggap header `apikey` opsional yang disusun frontend sebagai kontrol akses yang cukup. Pastikan RLS dan grants pada `public.make_prompt` serta bucket `images` sesuai kebijakan akses yang diinginkan.

### Error handling

- `crud-make-prompt` mengembalikan object JSON dengan properti `error` saat gagal; status umum mencakup 400 (validasi/database), 404 (record tidak ditemukan), 405 (method tidak didukung), 413 (file terlalu besar), dan 500 (konfigurasi/server).
- `crud-make-webhook` umumnya mengembalikan `{ success: false, error: ... }`; status umum mencakup 400 (validasi/body), 404 (route/record tidak ditemukan), 405 (method tidak didukung), dan 500 (database/konfigurasi/server).
- Frontend harus memeriksa `response.ok` dan, untuk webhook, juga `payload.success === false`.

### Supabase Storage

| Kegunaan | Bucket / Path |
| --- | --- |
| Gambar yang diunggah melalui `crud-make-prompt` | Bucket `images`, path `uploads/{uuid}.{extension}` |
| Gambar yang diunggah melalui `crud-make-webhook` | Bucket `calendar`, path `make_webhook/{uuid}.{extension}` |
| Default brand logo | Bucket `apple`, object `logo.png` (public URL) |

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
