# Aturan Proyek Gemini Canvas

Dokumen ini adalah sumber aturan wajib untuk setiap pekerjaan pada repository `applestoree/gemini-canvas`.

## 1. Gemini Canvas Runtime

- `index.html` dijalankan di dalam Gemini Canvas.
- Proses AI generation harus menggunakan API/runtime yang disediakan oleh Gemini Canvas.
- Aplikasi tidak membutuhkan Gemini API Key yang dimasukkan, disimpan, atau dikelola sendiri oleh pengguna.
- Jangan menambahkan konfigurasi, input, placeholder, atau kewajiban Gemini API Key untuk menjalankan AI generation di Gemini Canvas.
- Jangan menganggap API Key kosong sebagai penyebab kegagalan sebelum memeriksa cara kerja runtime Gemini Canvas.
- Jangan mengganti atau mengubah arsitektur pemanggilan AI tanpa instruksi dan persetujuan pengguna.
- Jangan menyimpulkan bahwa API runtime tidak tersedia hanya dari pemeriksaan kode statis. Bedakan antara integrasi yang terlihat di source code dan kemampuan runtime saat aplikasi dijalankan di Gemini Canvas.

## 2. Prosedur Wajib Audit `index.html`

Setiap kali diminta mengaudit, memeriksa, menganalisis, atau meninjau `index.html`, AI agent/developer WAJIB:

1. Membaca seluruh dokumen `aturan.md) terlebih dahulu.
2. Membaca `README.md` untuk memahami dokumentasi, fitur, dan arsitektur proyek.
3. Mengambil versi terbaru `index.html` dari branch yang sedang diaudit.
4. Melakukan audit dengan menjadikan aturan dalam dokumen ini sebagai batasan dan sumber acuan.
5. Memisahkan temuan yang terbukti dari dugaan atau hal yang belum dapat diverifikasi.
6. Tidak mengubah kode saat audit kecuali pengguna secara eksplisit meminta perbaikan atau implementasi.
7. Jika dokumentasi atau kode bertentangan dengan aturan ini, laporkan konflik tersebut. Jangan diam-diam mengubah arsitektur; minta konfirmasi pengguna sebelum perubahan yang berdampak pada arsitektur.

Audit tidak boleh dimulai sebelum langkah 1 dan 2 selesai.

## 3. Batasan Perubahan

- Jangan memperluas scope pekerjaan tanpa persetujuan.
- Pertahankan nama file, fungsi, variabel, endpoint, tabel, dan struktur yang sudah ada kecuali pengguna meminta perubahan.
- Jangan membuat data dummy atau melakukan operasi tulis ke database untuk sekadar pengujian tanpa persetujuan.
- Laporkan file yang diperiksa, temuan, perubahan (jika diminta), dan hasil verifikasi secara jelas.

## 4. Prioritas Aturan

Untuk keputusan dan audit proyek, ikuti urutan berikut:

1. Instruksi terbaru pengguna.
2. Aturan dalam `aturan.md`.
3. Requirement yang telah dikonfirmasi pengguna.
4. Dokumentasi `README.md`.
5. Asumsi atau preferensi teknis agent.

Jika terdapat konflik, jangan membuat asumsi. Laporkan dan minta konfirmasi pengguna.
