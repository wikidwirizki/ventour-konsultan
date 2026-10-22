# Konsultan Umroh Ventour Travel: Landing Page

Halaman konsultasi pribadi untuk konsultan Ventour Travel. Ini **bukan** pengganti situs resmi ventour.co.id.
Situs ini statis (HTML/CSS/JS murni), tanpa proses build, dan bisa dihosting di mana saja.

## Struktur

```
index.html                 Halaman utama (semua section)
kebijakan-privasi.html     Kebijakan privasi
404.html                   Halaman tidak ditemukan
robots.txt, sitemap.xml, site.webmanifest
assets/css/style.css       Desain (token warna brand di :root)
assets/js/config.js        ⚙️  KONFIGURASI: nama, WA, foto, GA4, Pixel, endpoint leads
assets/js/packages.js      Data paket (dihasilkan otomatis, jangan diedit manual)
assets/js/analytics.js     Persetujuan cookie + GA4/Meta Pixel + trackEvent()
assets/js/main.js          Render paket, filter, link WhatsApp, form leads, navigasi
assets/img/                Gambar yang sudah dioptimasi (WebP)
tools/update_packages.py   Sinkronisasi data paket dari situs resmi
integrations/google-apps-script.gs   Penyimpanan leads ke Google Sheets (opsional)
```

## antislop (filter anti AI-slop)

Skill [anti-slop](https://github.com/miqdadbadjuber/anti-slop) v3.2.21 (lisensi MIT) terpasang di `.claude/skills/`
dan didaftarkan di `CLAUDE.md`, jadi Claude Code otomatis memakainya saat mengerjakan proyek ini.
Arah desain yang dipakai sebagai acuan ada di `DESIGN.md`. Hasil audit dan perbaikannya ada di
`anti-slop/audit-001-2026-10-20.md`.

Folder `.claude` tersembunyi di Finder. Tekan **Cmd + Shift + .** untuk menampilkannya.

Cek kontras warna baru dengan:

```bash
python3 .claude/skills/antislop-human/contrast-check.py "#FFFFFF" "#15803D"
```

## Pratinjau lokal

```bash
cd ventour-konsultan
python3 -m http.server 8000
# buka http://localhost:8000
```

## Wajib diisi sebelum live (`assets/js/config.js`)

| Kunci | Keterangan |
|---|---|
| `consultant.name` | Nama konsultan (saat ini: Rizki Sabarkhah) |
| `consultant.whatsapp` | Nomor WA yang **sudah disetujui**, format `628xxxxxxxxxx` |
| `consultant.photo` | Path foto, mis. `assets/img/konsultan.webp` (4:5, ±800×1000) |
| `consultant.email`, `instagram`, `area` | Opsional |
| `leadEndpoint` | URL Apps Script `/exec` (lihat di bawah). Kosong berarti leads tidak disimpan |
| `analytics.ga4Id` / `metaPixelId` | Isi hanya dengan ID asli. Kosong berarti tracker tidak dimuat |

Selama nomor WA kosong, muncul banner "Mode pratinjau" dan tombol WA membuka pemilih kontak WhatsApp.
Tidak ada nomor yang ditebak.

Lengkapi juga placeholder di `kebijakan-privasi.html` (periode retensi data).

## Data paket otomatis

Data paket diperbarui sendiri, tanpa deploy ulang:

1. **GitHub Actions** (`.github/workflows/update-packages.yml`) menjalankan `tools/update_packages.py`
   sekali sehari pukul 12:00 WIB. Script mengambil tabel paket dari https://ventour.co.id/ dan detail
   tiap paket dari `venom.ventour.co.id/jamaah/detail_paket?id=...`.
2. Kalau ada perubahan, workflow meng-commit `data/packages.json` dan `assets/js/packages.js` dengan pesan
   `[skip netlify]`, lalu membersihkan cache jsDelivr. Commit ini tidak memicu deploy Netlify, jadi tidak
   memakan kuota deploy paket Free.
3. Halaman menampilkan data bawaan (`assets/js/packages.js`) lebih dulu, lalu mengambil
   `data/packages.json` dari CDN jsDelivr (`packagesDataUrl` di `config.js`). Kalau data CDN lebih baru,
   daftar paket diganti tanpa reload. Kalau CDN gagal, data bawaan tetap tampil.

Jalankan manual kapan saja: tab **Actions → Perbarui data paket → Run workflow** di GitHub, atau di komputer:

```bash
python3 tools/update_packages.py
```

Pengaman: kalau situs resmi gagal diakses, strukturnya berubah, atau jumlah paket anjlok lebih dari separuh,
file lama **tidak** ditimpa dan workflow tercatat gagal (GitHub mengirim email). Paket yang tanggalnya sudah lewat
otomatis disembunyikan. Program Haji, Badal, Vcation/Halal Tour, dan tabungan dilewati.

Repo ini harus tetap **publik** agar jsDelivr bisa membaca `data/packages.json`. GitHub bisa menonaktifkan jadwal
workflow di repo publik setelah 60 hari tanpa aktivitas; kalau itu terjadi, aktifkan lagi lewat tab **Actions**.

## Penyimpanan leads

* **Tanpa backend (default):** form memvalidasi data, menyusun pesan WhatsApp otomatis, dan menampilkan
  tombol "Lanjutkan di WhatsApp". Data **tidak disimpan di mana pun**, jadi lead baru tercatat kalau
  calon jamaah benar-benar mengirim pesan WA.
* **Dengan Google Sheets:** ikuti petunjuk di `integrations/google-apps-script.gs`, lalu isi `leadEndpoint`.
  Data (nama, WA, rencana, jumlah, catatan, UTM/fbclid) masuk ke Sheet privat milik konsultan.
  Endpoint hanya menerima data dan tidak pernah menampilkannya.
  Request dikirim dengan `no-cors`, jadi browser tidak bisa memastikan penyimpanan berhasil. Cek Sheet secara berkala.
* Form tidak meminta data sensitif (paspor/NIK). Ada honeypot anti-spam dan checkbox persetujuan.

## Tracking (GA4 / Meta)

Tracker hanya dimuat jika ID diisi **dan** pengunjung menekan "Setuju" pada banner cookie.
Semua event juga dicatat ke `window.dataLayer`, jadi bisa dipakai dengan GTM.

| Event internal | GA4 | Meta |
|---|---|---|
| page view | `page_view` (otomatis) | `PageView` |
| klik WhatsApp (header, hero, floating, footer, FAQ, dll.) | `contact_whatsapp` + `location` | `Contact` |
| klik "Tanya Paket Ini" | `select_package` + `contact_whatsapp` | custom + `Contact` |
| klik "Detail resmi" | `view_package` | `ViewContent` |
| mulai isi form | `form_start` | custom |
| kirim form | `form_submit` + `generate_lead` | custom + `Lead` |
| filter / buka FAQ | `filter_packages`, `faq_open` | custom |

Untuk iklan Meta, jadikan `Lead` (form) dan `Contact` (klik WA) sebagai konversi.
Parameter UTM disimpan per sesi dan ikut terkirim bersama data lead.

## Deploy

Situs tayang di Netlify (deploy otomatis dari branch `main`) dengan domain utama **https://sabarkhah.my.id/**.
* `404.html` dipakai Netlify otomatis sebagai halaman 404.
* Kalau domain berganti, ubah URL di `index.html` (canonical, og:url, og:image),
  `kebijakan-privasi.html`, `robots.txt`, `sitemap.xml`, dan `config.js`.
* Aktifkan HTTPS dan cache panjang untuk `assets/img/*`.

## Kepatuhan & hal yang perlu dikonfirmasi ke Ventour

1. **Subdomain `konsultan.ventour.co.id`** dikelola Ventour. Penggunaannya butuh persetujuan dan pengaturan DNS dari tim Ventour.
   Jika belum ada izin, pakai domain pribadi yang tidak menyesatkan.
2. **Logo & foto** diambil dari aset publik situs resmi Ventour (logo, foto rombongan jamaah 1441 sampai 1448 H, Ka'bah malam hari,
   city tour Thaif/Al Ula). Pastikan ada izin tertulis untuk penggunaan oleh konsultan, termasuk foto jamaah yang wajahnya terlihat.
   Logo tidak diubah.
3. **Data legalitas** yang ditampilkan: Izin Umrah No. 180/2021, berdiri 2017, akreditasi "Baik" (2023), alamat kantor pusat Depok,
   dan cabang. Semua bersumber dari halaman About & Cabang di ventour.co.id (dicek 20 Okt 2026).
   Nomor Izin Haji **sengaja tidak ditampilkan** karena situs resmi menulisnya dengan dua versi berbeda
   (`02110009216870002` vs `021100092168700002`). Konfirmasi dulu jika ingin ditambahkan.
4. **Testimoni** dikutip dari situs resmi (atribusi "Jamaah Kloter …"). Tidak ada rating, statistik jumlah jamaah,
   atau penghargaan yang dikarang. Situs resmi menampilkan penghitung jamaah, tetapi angkanya tidak terbaca.
5. Harga ditampilkan sebagai "harga mulai / jamaah" sesuai situs resmi. Tipe kamar dan rincian termasuk/tidak termasuk
   diarahkan untuk dikonfirmasi ke konsultan.

## Checklist sebelum go-live

- [ ] Nama, foto, dan nomor WA konsultan diisi di `config.js`
- [ ] Izin penggunaan logo/foto/subdomain dari Ventour
- [ ] `python3 tools/update_packages.py` dijalankan di hari publikasi
- [ ] (Opsional) Apps Script dipasang dan `leadEndpoint` diuji
- [ ] (Opsional) ID GA4/Pixel diisi, lalu uji dengan GA4 DebugView / Meta Events Manager "Test events"
- [ ] Placeholder kebijakan privasi dilengkapi
- [ ] Uji klik semua tombol WA di HP
