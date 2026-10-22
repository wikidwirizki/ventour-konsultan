/*
 * Konfigurasi situs: satu-satunya file yang perlu diubah admin/konsultan.
 * Semua nilai kosong ("") berarti fitur tersebut BELUM dikonfigurasi dan
 * tidak akan aktif. Jangan isi dengan ID/nomor contoh atau tebakan.
 */
window.SITE_CONFIG = {
  // URL publik halaman ini (dipakai untuk canonical/OG di JS bila perlu).
  siteUrl: "https://sabarkhah.my.id/",

  consultant: {
    // Nama konsultan yang tampil di halaman. Ganti placeholder ini.
    name: "Rizki Sabarkhah",
    // Gunakan sebutan peran yang disetujui Ventour.
    role: "Konsultan Umroh Ventour Travel",
    // Kota/area layanan (opsional), mis. "Depok & Jabodetabek".
    area: "",
    // Path foto konsultan (rasio 4:5 disarankan, mis. 800x1000 WebP).
    // Kosongkan untuk menampilkan placeholder.
    photo: "assets/img/konsultan-rizki.webp",
    // Nomor WhatsApp konsultan dalam format internasional TANPA "+" atau spasi,
    // mis. "6281234567890". WAJIB nomor yang sudah disetujui konsultan/Ventour.
    whatsapp: "6285172132108",
    // Email konsultan (opsional).
    email: "",
    // Profil Instagram konsultan (opsional, URL lengkap).
    instagram: "",
  },

  // Endpoint penyimpanan leads (opsional). Lihat integrations/google-apps-script.gs.
  // Contoh: "https://script.google.com/macros/s/XXXX/exec". Kosong = leads TIDAK disimpan
  // di server; calon jamaah langsung diarahkan ke WhatsApp.
  leadEndpoint: "",

  // Data paket terbaru yang diperbarui GitHub Actions setiap Senin pukul 12:00 WIB (lewat CDN jsDelivr).
  // Kosong = hanya memakai data bawaan assets/js/packages.js.
  packagesDataUrl: "https://cdn.jsdelivr.net/gh/wikidwirizki/ventour-konsultan@main/data/packages.json",

  analytics: {
    // Google Analytics 4 Measurement ID, mis. "G-XXXXXXX". Kosong = GA4 tidak dimuat.
    ga4Id: "",
    // Meta Pixel / Dataset ID. Kosong = Pixel tidak dimuat.
    metaPixelId: "",
  },
};
