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

### 5. Alur Penggunaan

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

### 6. State Management

Kelola state aplikasi secara terstruktur.

Minimal state:

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

Ketentuan:

- `selectedFile` hanya boleh `App.jsx` atau `index.html`.
- `fileContent` menyimpan isi editor saat ini.
- `originalContent` menyimpan isi terakhir yang berhasil diambil dari GitHub.
- `fileSha` menyimpan SHA versi file yang sedang digunakan.
- `hasChanges` ditentukan dari perbandingan isi editor dengan `originalContent`.

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

Jika terjadi konflik SHA (HTTP 409 atau 422), jangan menimpa perubahan terbaru secara otomatis. Tampilkan pesan bahwa file di repository telah berubah dan pengguna perlu memuat ulang versi terbaru sebelum menyimpan kembali.

Jangan menghapus perubahan lokal pengguna ketika terjadi kegagalan API.

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
14. Batasi seluruh operasi hanya untuk `App.jsx` dan `index.html`.
15. Jangan mengubah isi file sebelum pengguna melakukan tindakan edit dan Save.

### 10. Hasil Akhir

Aplikasi harus menyediakan dua fungsi utama:

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

Pastikan semua tombol dan interaksi benar-benar bekerja.

### Instruksi Final

Bangun aplikasi GitHub File Viewer & Editor di Gemini Canvas berdasarkan seluruh spesifikasi di atas.

Prioritaskan integrasi API yang benar dan kemampuan mengedit serta menyimpan file ke GitHub. Jangan mengganti integrasi dengan data simulasi.

Jika ada ketidaksesuaian antara asumsi implementasi dan kontrak Edge Function yang tersedia, ikuti kontrak Edge Function sebagai sumber kebenaran.
