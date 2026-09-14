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

## 4. Versi database PHP/MySQL

GitHub Pages hanya menjalankan file statis dan tidak dapat menjalankan PHP. Versi database baru memakai PHP + MySQL, sehingga dijalankan melalui XAMPP atau hosting PHP.

1. Jalankan Apache dan MySQL di XAMPP.
2. Salin folder ini ke `C:\xampp\htdocs\provider-samarinda`.
3. Buka phpMyAdmin di `http://localhost/phpmyadmin`.
4. Import file `database.sql`.
5. Pastikan `config.php` memakai user/password MySQL milikmu.
6. Buka `http://localhost/provider-samarinda/`.

Untuk mengisi database dengan data yang sudah ada: di Google Sheet pilih **File → Download → Comma-separated values (.csv)**, lalu buka `http://localhost/provider-samarinda/import.php` dan upload file CSV tersebut. Setelah import berhasil, refresh dashboard.

`api.php` membaca statistik dari tabel `survey_responses` setiap kali dashboard meminta data. `sync.php` menerima data JSON dari Google Apps Script dan melakukan upsert, sehingga data tidak dobel.

## 5. Hubungkan Google Form ke database PHP

Google Form tetap menyimpan respons ke Google Sheets. Untuk mengirim salinan respons ke MySQL, isi URL hosting PHP dan secret pada Apps Script, lalu buat trigger `From spreadsheet` → `On form submit` yang memanggil fungsi sinkronisasi. Jangan gunakan password database di Apps Script; hanya gunakan secret sinkronisasi.

Versi Apps Script yang sekarang tetap dapat membaca statistik dari Sheet. Untuk versi PHP, endpoint sinkronisasi harus diarahkan ke URL publik `sync.php` setelah hosting PHP tersedia.

## 6. Publikasi

GitHub Pages tidak cocok untuk versi PHP. Upload seluruh folder ke hosting yang mendukung PHP 8+, MySQL/MariaDB, HTTPS, dan cron/trigger jika dibutuhkan. Setelah mendapat domain, ubah `STATS_API_URL` di `config.js` menjadi URL `api.php` di hosting tersebut.

## 7. Hubungkan statistik Google Apps Script (versi lama)
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

## 8. Publikasikan versi statis lama
1. Buat repository baru di GitHub, misalnya `provider-samarinda`.
2. Upload semua file website.
3. Repository → Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder `/root`.
6. Save.
7. GitHub akan memberikan URL publik.

## 9. Fitur website
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
