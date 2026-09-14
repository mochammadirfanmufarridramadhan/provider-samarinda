# WEBSITE SURVEY PROVIDER SAMARINDA

## 1. Jalankan di VS Code
Ekstrak ZIP ini lalu buka foldernya di VS Code.

Untuk preview lokal, instal extension **Live Server** lalu klik kanan `index.html` → **Open with Live Server**.

## 2. Link Google Form
Sudah dipasang:
https://forms.gle/r3HF7A4okbH2rdPX6

## 3. Google Sheet
Spreadsheet ID sudah dipasang di `apps-script.gs`:
1DEBtfIV1bapk4Mark2OQrQOapjLMUboMCfh5qmPWifg

## 4. Hubungkan statistik dan sinkronisasi
1. Buka Google Sheet respons.
2. Extensions → Apps Script.
3. Tempel isi `apps-script.gs`.
4. Pastikan nama sheet respons = `Form Responses 1`.
5. Deploy → New deployment.
6. Type = Web app.
7. Execute as = Me.
8. Who has access = Anyone.
9. Deploy.
10. Salin URL yang berakhir `/exec`.
11. Buka `config.js`.
12. Isi `STATS_API_URL` di `config.js` dengan URL `/exec`.

Google Sheets menjadi database utama. Alurnya adalah Google Form → Google Sheets → Apps Script → dashboard. Dashboard meminta statistik terbaru setiap 30 detik dan hanya menerima data agregat, bukan jawaban mentah.

Setiap kali kode `apps-script.gs` berubah, tempel perubahan tersebut ke Apps Script lalu buat deployment versi baru. Jika URL deployment tetap sama, dashboard akan langsung memakai kode terbaru setelah deployment selesai.

## 5. Publikasikan agar bisa diakses semua orang
1. Buat repository baru di GitHub, misalnya `provider-samarinda`.
2. Upload semua file website.
3. Repository → Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder `/root`.
6. Save.
7. GitHub akan memberikan URL publik.

## 6. Fitur website
- desain biru-putih modern
- tema Samarinda tanpa gambar eksternal
- animasi scroll reveal
- animasi elemen hero
- dark mode
- progress bar saat scroll
- grafik provider
- grafik kepuasan
- grafik aspek penilaian
- grafik distribusi provider
- statistik otomatis
- tombol refresh
- update otomatis setiap 30 detik

## Catatan
Website publik hanya menerima statistik agregat dari Apps Script. Jangan menampilkan nama, email, nomor HP, atau jawaban mentah responden.
