# DESIGN.md: Konsultan Umroh Ventour Travel

Arah desain halaman ini. Isinya disalin dari brief pemilik proyek (bagian "Brand identity", "Visual direction",
dan "Design quality"), lalu dilengkapi alasan satu baris untuk setiap keputusan besar sesuai antislop R-31.
Ubah file ini kalau arah brand berubah; antislop memakai file ini sebagai acuan, bukan sebaliknya.

## Identitas (dari brief)

- Halaman konsultasi pribadi seorang konsultan Ventour Travel, bukan situs resmi korporat.
- Rasa yang dituju: modern, premium, hangat, elegan, Islami, dan terpercaya.
- Hindari: tampilan template travel generik, desain terlalu ramai, ornamen berlebihan, gradient berlebihan.
- Prioritas: kepercayaan, kejelasan informasi paket, CTA WhatsApp yang menonjol, pengalaman mobile, warna Ventour yang konsisten, pengelolaan leads.

## Palet (dari brief)

| Peran | Warna | Alasan |
|---|---|---|
| Aksen utama | `#F9D423` kuning Ventour | Warna brand resmi; dipakai untuk CTA utama, motif garis, dan penanda kecil |
| Latar | `#FFFFFF` putih | Diminta brief: bersih dan nyaman dibaca |
| Teks & latar gelap | `#3F3F3F` / `#262626` | Abu gelap brand; `#262626` dipakai untuk kontras judul dan panel gelap |
| Fungsional | `#15803D` hijau WhatsApp | Pengenal tombol WhatsApp; versi lebih gelap dari hijau default agar teks putih lolos 4.5:1 |
| Status | `#B42318` merah | Hanya untuk error form dan kursi tersisa sedikit |

Netral pendukung: `#666666` (teks sekunder, 5.74:1), `#8C8880` (batas kontrol, 3.53:1), `#FAF9F6` (latar section selang-seling).

## Dial

Reading this as: landing page konsultasi umroh untuk calon jamaah dari iklan Facebook/Instagram, dengan bahasa visual bersih dan hangat ala brand Ventour, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

- ENERGY 2: hero foto Ka'bah penuh dan blok kuning di form memberi sapaan yang jelas, sisanya tenang.
- RHYTHM 2: komposisi section berbeda-beda (panel + daftar, grid kartu, gambar sticky + daftar, galeri editorial, FAQ dua kolom), dengan pola dasar yang konsisten.
- MOTION 1: hanya hover dan transisi menu. Tidak ada animasi scroll atau loop; audiens termasuk orang tua.

## Keputusan dan alasannya (R-31)

- Tipografi Plus Jakarta Sans: typeface buatan Indonesia (identitas kota Jakarta), terbaca baik di layar kecil dan terasa lokal bagi audiens.
- Hero tanpa ornamen tambahan: foto Masjidil Haram sudah membawa nuansa Islami, headline langsung jadi titik fokus.
- Hook harga di hero (permintaan pemilik untuk awareness): harga paket terendah dari data resmi, kuning besar sebagai satu-satunya angka di layar pertama, dan tombol WA yang menyebut harga itu. Tanpa kata "termurah", tanpa hitung mundur atau urgensi buatan; semua angka dihitung ulang dari data setiap minggu.
- Tombol WA melayang disembunyikan selama tombol WA hero terlihat, supaya tidak ada dua tombol WA bertumpuk di layar pertama HP.
- Foto konsultan sebatas dada, ukuran kecil (maks. 320px): cukup untuk mengenali wajah tanpa mendominasi section.
- Motif identitas: garis kuning pendek di depan label section, diulang di setiap section.
- Pola bintang delapan di section form: geometri Islami sebagai satu-satunya tekstur halaman, memberi penanda kuat di titik konversi.
- Foto: dokumentasi resmi Ventour (rombongan jamaah dan Masjidil Haram), karena bukti nyata lebih kuat daripada ilustrasi.
- Kartu paket: dipakai karena setiap paket memang punya data sejenis yang perlu dibandingkan (jadwal, hotel, harga).
- Panel legalitas gelap: satu titik fokus di section kepercayaan, karena izin resmi adalah pertanyaan pertama calon jamaah.
- Ikon: hanya di tempat yang membantu memindai (meta paket, poin "Mengapa Ventour" yang diminta brief, tombol WhatsApp). Setiap ikon mewakili isi barisnya.
- Radius: 6px untuk tag, 10px untuk tombol/input/chip, 16px untuk kartu dan foto. Hanya tombol WhatsApp melayang yang bulat penuh.
- Shadow: hanya untuk elemen yang benar-benar berada di atas lapisan lain (kartu di atas foto hero, form di atas latar kuning, menu mobile, tombol melayang, hover kartu).
- Mode gelap: tidak dibuat, karena brief meminta latar putih sebagai identitas utama.
- Panah ↗: hanya pada tautan yang membuka situs lain di tab baru.
