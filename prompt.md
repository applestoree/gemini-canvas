# PROMPT APLIKASI GEMINI CANVAS
## GitHub Repository File Viewer & Editor

### 1. Peran AI

Bertindaklah sebagai Senior Frontend Engineer, React Developer, dan UI/UX Designer yang ahli dalam membangun aplikasi menggunakan Gemini Canvas.

Tugas utama adalah membuat aplikasi **GitHub File Viewer & Editor** yang terhubung ke repository GitHub melalui Supabase Edge Function `github-manager`.

Aplikasi harus benar-benar berfungsi untuk membaca dan mengedit file repository, bukan sekadar menampilkan simulasi atau mock data.

### 2. Konfigurasi Aplikasi

Gunakan konfigurasi berikut:

| Konfigurasi | Value |
|---|---|
| Application Name | GitHub File Editor |
| Repository Owner | `applestoree` |
| Repository Name | `gemini-canvas` |
| Repository | `applestoree/gemini-canvas` |
| Branch | `main` |
| Supabase Edge Function | `github-manager` |
| Edge Function URL | `https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/github-manager` |
| File 1 | `App.jsx` |
| File 2 | `index.html` |

Gunakan Supabase Edge Function yang sudah tersedia. Jangan membuat Edge Function baru.

### 3. Integrasi API

Seluruh komunikasi dengan GitHub wajib dilakukan melalui Supabase Edge Function `github-manager`.

Jangan menggunakan GitHub REST API langsung dari frontend.

Gunakan endpoint:

`https://jhpbtooefyzdndstlzva.supabase.co/functions/v1/github-manager`

HTTP Method: `POST`

Content-Type: `application/json`

Action yang tersedia:

| Action | Fungsi |
|---|---|
| `list_files` | Mengambil daftar file yang tersedia |
| `get_file` | Mengambil isi file |
| `get_file_info` | Mengambil informasi file termasuk SHA |
| `update_file` | Memperbarui isi file dan membuat commit |

Gunakan nama action dan parameter sesuai kontrak Edge Function yang sudah tersedia. Jangan mengarang action atau endpoint baru.

Untuk memperbarui file, gunakan SHA terbaru yang diperoleh dari GitHub. Jangan menggunakan SHA lama atau membuat SHA sendiri.

### 4. Struktur UI

Buat tampilan aplikasi modern, minimalis, profesional, dan mobile-first.

#### A. Header

Tampilkan:

- Nama aplikasi: GitHub File Editor
- Repository: `applestoree/gemini-canvas`
- Branch: `main`
- Status koneksi API
- Tombol Refresh

#### B. File Selector

Tampilkan dua file yang dapat dipilih:

**App.jsx**
- Icon file React/JavaScript.
- Nama file.
- Status loading atau loaded.
- Tombol untuk membuka file.

**index.html**
- Icon HTML.
- Nama file.
- Status loading atau loaded.
- Tombol untuk membuka file.

Ketika pengguna memilih file, aplikasi mengambil isi file terbaru dari GitHub melalui action `get_file`.

Jangan menampilkan isi file statis atau mock data.

#### C. Code Editor

Setelah file dipilih, tampilkan editor kode.

Fitur editor:

- Menampilkan seluruh isi file.
- Syntax highlighting berdasarkan ekstensi file.
- Nomor baris.
- Indentasi kode.
- Scroll horizontal dan vertikal.
- Kemampuan mengedit isi kode.
- Tombol Select All.
- Tombol Copy.
- Tombol Undo dan Redo jika didukung editor.
- Indikator perubahan yang belum disimpan.

Gunakan editor kode yang mendukung React JSX, JavaScript, dan HTML. Prioritaskan Monaco Editor jika kompatibel dengan runtime Gemini Canvas. Jika tidak kompatibel, gunakan editor alternatif yang benar-benar berfungsi.

Editor harus dapat menangani file dengan ukuran besar tanpa memotong isi kode.

#### D. Editor Toolbar

Tampilkan toolbar dengan fungsi:

1. **Refresh** — mengambil versi terbaru dari GitHub.
2. **Copy** — menyalin seluruh isi editor.
3. **Reset** — mengembalikan isi editor ke versi terakhir yang diambil dari GitHub.
4. **Save** — menyimpan perubahan ke GitHub.

Tombol Save hanya aktif jika terdapat perubahan pada editor.

#### E. Commit Dialog

Ketika pengguna menekan Save, tampilkan dialog konfirmasi.

Isi dialog:

- Nama file yang akan diperbarui.
- Repository.
- Branch.
- Ringkasan perubahan.
- Input Commit Message.
- Tombol Cancel.
- Tombol Confirm & Save.

Commit message default:

`Update App.jsx`

atau

`Update index.html`

Sesuaikan berdasarkan file yang sedang diedit.

Setelah pengguna mengonfirmasi:

1. Ambil SHA terbaru menggunakan `get_file_info`.
2. Kirim isi editor terbaru dan SHA tersebut melalui `update_file`.
3. Gunakan commit message dari pengguna.
4. Tunggu respons API.
5. Jika berhasil, tampilkan notifikasi berhasil.
6. Perbarui data SHA dan versi file.
7. Tandai editor sebagai tidak memiliki perubahan yang belum disimpan.

Jangan menampilkan status berhasil sebelum API mengonfirmasi keberhasilan.

#### F. Live Preview untuk index.html

Tambahkan fitur Live Preview khusus ketika pengguna memilih file `index.html`.

**Tujuan**

Memungkinkan pengguna melihat hasil render HTML secara langsung ketika kode sedang diedit, tanpa harus menyimpan perubahan ke GitHub terlebih dahulu.

**UI Preview**

Sediakan tab atau panel kerja:

- **Code** — menampilkan editor kode HTML.
- **Preview** — menampilkan hasil render halaman HTML.
- **AI Chat** — menampilkan percakapan untuk meminta perubahan kode HTML.

Pengguna dapat berpindah antar-tab tanpa kehilangan perubahan lokal yang belum disimpan.

**Perilaku Live Preview**

1. Preview menggunakan isi `index.html` terkini dari editor lokal, bukan mengambil ulang file dari GitHub setiap kali preview diperbarui.
2. Perbarui tampilan preview secara otomatis setelah isi editor berubah.
3. Sediakan tombol Refresh Preview untuk memperbarui render secara manual.
4. Gunakan iframe dengan `srcDoc` untuk merender dokumen HTML lokal.
5. Isolasi preview menggunakan atribut sandbox pada iframe. Berikan hanya izin yang benar-benar diperlukan untuk menampilkan preview; jangan memberikan akses yang tidak diperlukan.
6. Perubahan kode yang belum disimpan ke GitHub tetap dapat dilihat di Preview.
7. Preview tidak boleh otomatis menyimpan atau mengirim perubahan ke GitHub.
8. Setelah perubahan berhasil disimpan, Preview tetap menampilkan konten terbaru.
9. Resource eksternal hanya dapat dimuat sesuai kemampuan browser dan pembatasan sandbox.
10. Jika preview gagal ditampilkan, tampilkan pesan error yang informatif tanpa menghapus kode editor.

**Batasan**

- Live Preview hanya berlaku untuk `index.html`.
- Jangan menjalankan atau merender `App.jsx` sebagai bagian dari fitur ini.
- Jangan membuat file preview baru di repository.
- Preview merupakan tampilan lokal di aplikasi dan bukan deployment atau hosting website.

#### G. AI Chat untuk Mengedit index.html

Tambahkan fitur AI Chat khusus untuk membantu pengguna mengubah kode `index.html melalui instruksi bahasa natural.

**Tujuan**

Pengguna dapat meminta AI menganalisis, memperbaiki, menambahkan, atau mengubah kode HTML tanpa harus mengedit seluruh kode secara manual.

**Konteks AI**

1. AI Chat menggunakan isi aktual `index.html` yang sedang terbuka di editor sebagai konteks.
2. AI harus mempertimbangkan perubahan lokal yang belum disimpan, bukan hanya versi terakhir di GitHub.
3. AI hanya boleh membantu mengedit `index.html`.
4. AI tidak boleh mengubah `App.jsx` melalui fitur ini.
5. AI tidak boleh mengirim commit atau menyimpan perubahan langsung ke GitHub.

**Contoh instruksi pengguna**

- "Ubah warna background menjadi hitam."
- "Tambahkan tombol navigasi."
- "Perbaiki tampilan mobile."
- "Perbaiki error JavaScript."
- "Buat tampilan lebih modern."
- "Jelaskan bagian kode ini."
- "Tambahkan section baru di bawah hero."

**Alur AI Chat**

1. Pengguna membuka file `index.html`.
2. Pengguna membuka tab AI Chat.
3. Pengguna mengirim instruksi.
4. AI menganalisis instruksi dengan konteks isi editor terkini.
5. AI menghasilkan usulan perubahan kode.
6. Tampilkan hasil perubahan sebelum menerapkannya.
7. Pengguna dapat menerima atau menolak usulan.
8. Jika diterima, terapkan hasil ke editor lokal.
9. Perbarui Live Preview berdasarkan kode yang sudah diterapkan.
10. Perubahan tetap berstatus lokal sampai pengguna melakukan Save melalui alur commit yang sudah tersedia.

**Kontrol hasil AI**

Sediakan tindakan:

- **Apply Changes** — menerapkan hasil AI ke editor lokal.
- **Reject** — menolak hasil AI tanpa mengubah kode editor.
- **Undo** — membatalkan penerapan perubahan AI jika editor mendukungnya.

Sebelum Apply Changes, jangan mengganti isi editor. Tampilkan usulan perubahan terlebih dahulu agar pengguna dapat memeriksanya.

Jika memungkinkan, tampilkan ringkasan perubahan atau perbandingan kode sebelum dan sesudah (diff). Jangan mengklaim perubahan berhasil diterapkan sebelum pengguna memilih Apply Changes.

**Integrasi AI**

- Gunakan kemampuan AI yang memang tersedia di runtime Gemini Canvas.
- Jangan mengarang nama SDK, API, endpoint, model, atau konfigurasi provider yang belum tersedia.
- Jangan meminta API key baru atau menampilkan secret.
- Jika runtime Gemini Canvas tidak menyediakan kemampuan AI yang dapat dipanggil dari aplikasi, tampilkan status bahwa fitur AI belum tersedia dan jangan menggantinya dengan respons simulasi.
- Kegagalan AI tidak boleh menghapus atau mengubah isi editor.

**Batasan AI Chat**

- Fitur AI Chat hanya mengubah draft lokal `index.html`.
- AI Chat tidak memiliki fungsi commit langsung.
- AI Chat tidak boleh memanggil action GitHub selain melalui alur penyimpanan yang sudah ditentukan aplikasi.
- Pengguna tetap memegang kendali untuk menerapkan perubahan dan menyimpan ke GitHub.

### 5. Alur Penggunaan

#### A. Alur umum File Viewer & Editor

```text
OPEN APPLICATION
       |
       v
CONNECT TO EDGE FUNCTION
       |
       v
LOAD FILE LIST
       |
       v
+-------------------------+
| Select File             |
|                         |
| 1. App.jsx              |
| 2. index.html           |
+-------------------------+
       |
       v
GET FILE CONTENT
       |
       v
DISPLAY CODE EDITOR
       |
       v
USER EDITS CODE
       |
       v
SAVE
       |
       v
GET LATEST FILE SHA
       |
       v
UPDATE FILE
       |
       v
GITHUB COMMIT
       |
       v
SHOW SUCCESS / ERROR
```

#### B. Alur Live Preview

```text
SELECT index.html
       |
       v
LOAD HTML FROM GITHUB
       |
       v
DISPLAY CODE EDITOR
       |
       v
USER EDITS HTML
       |
       v
UPDATE LOCAL PREVIEW
       |
       v
RENDER HTML IN SANDBOXED IFRAME
       |
       v
USER REVIEWS RESULT
       |
       v
OPTIONAL: SAVE TO GITHUB
```

#### C. Alur AI Chat

```text
OPEN index.html
       |
       v
OPEN AI CHAT
       |
       v
USER SENDS INSTRUCTION
       |
       v
AI ANALYZES CURRENT EDITOR CONTENT
       |
       v
GENERATE PROPOSED CODE CHANGES
       |
       v
SHOW PROPOSED CHANGES
       |
       v
USER CHOOSES APPLY OR REJECT
       |
       v
APPLY: UPDATE LOCAL EDITOR
       |
       v
UPDATE LIVE PREVIEW
       |
       v
USER MAY SAVE THROUGH COMMIT FLOW
```

### 6. State Management

Kelola state aplikasi secara terstruktur.

Minimal state umum:

- `files`
- `selectedFile`
- `fileContent`
- `originalContent`
- `fileSha`
- `commitMessage`
- `isLoading`
- `isSaving`
- `hasChanges`
- `connectionStatus`
- `errorMessage`
- `successMessage`

State tambahan untuk Live Preview:

- `previewContent` — konten HTML lokal yang akan dirender.
- `isPreviewRefreshing` — status pembaruan preview.
- `previewError` — pesan error preview.
- `activeIndexHtmlTab` — tab kerja yang sedang aktif, yaitu Code, Preview, atau AI Chat.

State tambahan untuk AI Chat:

- `chatMessages` — daftar pesan percakapan.
- `chatInput` — teks instruksi pengguna.
- `isAiGenerating` — status proses AI.
- `proposedHtml` — usulan kode HTML dari AI yang belum diterapkan.
- `proposedChangesSummary` — ringkasan perubahan yang diusulkan.
- `hasPendingAiProposal` — penanda bahwa ada usulan perubahan yang menunggu keputusan pengguna.

Ketentuan state:

- `selectedFile` hanya boleh `App.jsx` atau `index.html`.
- `fileContent` menyimpan isi editor saat ini.
- `originalContent` menyimpan isi terakhir yang berhasil diambil dari GitHub atau berhasil disimpan.
- `fileSha` menyimpan SHA versi file yang sedang digunakan.
- `hasChanges` ditentukan dari perbandingan isi editor dengan `originalContent`.
- `previewContent` harus mengikuti isi lokal `index.html` di editor.
- Usulan AI tidak boleh mengubah `fileContent` sebelum pengguna menekan Apply Changes.
- Setelah Apply Changes, hitung ulang `hasChanges` dan perbarui preview.
- Ketika berpindah file, jangan sampai state chat atau usulan AI mengubah file lain.
- Jangan menghilangkan perubahan lokal yang belum disimpan ketika pengguna berpindah tab Code, Preview, dan AI Chat.

### 7. Error Handling

Tangani kondisi berikut:

| Kondisi | Respons UI |
|---|---|
| API tidak dapat diakses | Tampilkan koneksi gagal |
| File tidak ditemukan | Tampilkan File Not Found |
| Gagal membaca file | Tampilkan pesan error |
| Gagal menyimpan | Tampilkan pesan error |
| SHA tidak cocok | Minta pengguna memuat ulang file |
| Tidak ada perubahan | Nonaktifkan Save |
| Sedang menyimpan | Tampilkan loading |
| Commit berhasil | Tampilkan notifikasi sukses |
| Preview gagal dirender | Tampilkan pesan error preview, pertahankan kode editor |
| AI runtime tidak tersedia | Tampilkan fitur AI tidak tersedia, jangan gunakan simulasi |
| AI gagal menghasilkan perubahan | Tampilkan pesan error, pertahankan kode editor |
| Usulan AI ditolak | Jangan mengubah kode editor |
| Apply Changes berhasil | Perbarui editor lokal dan Live Preview |

Jika terjadi konflik SHA (HTTP 409 atau 422), jangan menimpa perubahan terbaru secara otomatis. Tampilkan pesan bahwa file di repository telah berubah dan pengguna perlu memuat ulang versi terbaru sebelum menyimpan kembali.

Jangan menghapus perubahan lokal pengguna ketika terjadi kegagalan API, preview, atau AI.

### 8. Desain UI/UX

Gunakan prinsip desain:

- Modern.
- Minimalis.
- Profesional.
- Clean interface.
- Dark code editor.
- Tampilan nyaman untuk membaca kode.
- Navigasi sederhana.
- Tombol dengan label yang jelas.
- Loading indicator.
- Toast notification.
- Confirmation dialog.

Prioritaskan tampilan mobile dengan penggunaan ruang layar yang efisien. Editor kode harus tetap dapat digunakan melalui layar sentuh dan mendukung scroll horizontal.

Untuk `index.html`, tab Code, Preview, dan AI Chat harus mudah diakses. Pastikan area editor, preview, dan percakapan dapat digunakan pada layar mobile tanpa membuat navigasi utama menjadi terlalu padat.

### 9. Ketentuan Teknis

1. Gunakan React dan JavaScript/JSX sesuai dukungan Gemini Canvas.
2. Buat aplikasi yang benar-benar berfungsi.
3. Jangan menggunakan mock data.
4. Jangan membuat repository baru.
5. Jangan membuat branch baru.
6. Jangan membuat file baru.
7. Jangan mengubah nama file.
8. Jangan menggunakan GitHub API langsung dari browser.
9. Jangan menampilkan atau meminta GitHub Personal Access Token.
10. Jangan membuat Supabase Edge Function baru.
11. Jangan menambahkan tabel database.
12. Jangan menambahkan mekanisme keamanan baru.
13. Gunakan Edge Function `github-manager` yang sudah tersedia.
14. Batasi seluruh operasi GitHub hanya untuk `App.jsx` dan `index.html`.
15. Jangan mengubah isi file sebelum pengguna melakukan tindakan edit dan Save.
16. Live Preview harus menggunakan HTML lokal dari editor dan tidak membutuhkan commit GitHub.
17. Gunakan iframe sandbox untuk Live Preview dan jangan memberikan izin yang tidak diperlukan.
18. AI Chat hanya untuk menghasilkan usulan perubahan `index.html`.
19. Terapkan perubahan AI ke editor hanya setelah pengguna memilih Apply Changes.
20. AI Chat tidak boleh melakukan commit otomatis.
21. Gunakan kemampuan AI yang tersedia di Gemini Canvas; jangan mengarang API atau provider.
22. Jangan mengganti fitur yang tidak tersedia dengan mock atau simulasi.
23. Pertahankan seluruh perubahan lokal pengguna ketika terjadi error.

### 10. Hasil Akhir

Aplikasi harus menyediakan fungsi berikut:

**File Viewer**
- Menampilkan isi aktual `App.jsx`.
- Menampilkan isi aktual `index.html`.
- Mengambil data langsung dari repository melalui Edge Function.

**File Editor**
- Mengedit isi kedua file.
- Melihat perubahan sebelum menyimpan.
- Memasukkan commit message.
- Menyimpan perubahan langsung ke repository GitHub.
- Menampilkan status hasil commit.

**Live Preview**
- Menampilkan hasil render `index.html`.
- Memperbarui preview secara otomatis ketika kode lokal berubah.
- Mendukung refresh preview manual.
- Tidak memerlukan penyimpanan ke GitHub untuk melihat hasil.
- Menggunakan iframe sandbox.

**AI Chat Editor**
- Menerima instruksi bahasa natural untuk mengedit `index.html`.
- Menggunakan isi editor terkini sebagai konteks.
- Menghasilkan usulan kode dan ringkasan perubahan.
- Menampilkan usulan sebelum diterapkan.
- Menyediakan Apply Changes, Reject, dan Undo.
- Memperbarui editor dan Live Preview setelah perubahan diterapkan.
- Tidak melakukan commit otomatis.

Pastikan semua tombol dan interaksi benar-benar bekerja.

### Instruksi Final

Bangun aplikasi GitHub File Viewer & Editor di Gemini Canvas berdasarkan seluruh spesifikasi di atas.

Prioritaskan integrasi API yang benar, kemampuan mengedit serta menyimpan file ke GitHub, Live Preview untuk `index.html`, dan AI Chat untuk membantu mengedit `index.html`.

Jangan mengganti integrasi dengan data simulasi.

Jika ada ketidaksesuaian antara asumsi implementasi dan kontrak Edge Function yang tersedia, ikuti kontrak Edge Function sebagai sumber kebenaran.

Jangan membuat atau mengubah file repository selain `App.jsx` dan `index.html` melalui aplikasi yang dibangun.
