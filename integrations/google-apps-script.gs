/**
 * Penyimpanan leads ke Google Sheets (gratis, tanpa server sendiri).
 *
 * CARA PASANG
 * 1. Buat Google Sheet baru (akun milik konsultan). Beri nama, mis. "Leads Umroh".
 * 2. Menu Extensions > Apps Script. Hapus isi default, tempel seluruh file ini.
 * 3. Ganti SECRET_SHEET_NAME bila perlu, lalu Save.
 * 4. Deploy > New deployment > Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Salin URL "/exec" yang dihasilkan.
 * 5. Tempel URL tersebut ke SITE_CONFIG.leadEndpoint di assets/js/config.js.
 * 6. Uji dengan mengisi formulir di situs, lalu cek baris baru di Sheet.
 *
 * KEAMANAN & PRIVASI
 * - Sheet TIDAK perlu dibagikan publik; hanya script yang menulis ke sana.
 * - Endpoint hanya MENERIMA data (doPost), tidak pernah mengembalikan isi Sheet.
 * - Batasi akses Sheet hanya untuk konsultan / tim Ventour yang berwenang.
 * - Hapus leads lama secara berkala sesuai kebijakan privasi.
 */
var SHEET_NAME = "Leads";
var HEADERS = ["Waktu", "Nama", "WhatsApp", "Rencana", "Jumlah", "Catatan",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "Halaman", "Referrer", "Status"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    // Validasi minimal agar Sheet tidak diisi data sampah.
    if (!d.name || !/^62\d{8,13}$/.test(String(d.phone || ""))) {
      return ContentService.createTextOutput("invalid");
    }
    var sheet = getSheet_();
    var u = d.utm || {};
    sheet.appendRow([
      new Date(), clean_(d.name, 80), "'" + d.phone, clean_(d.plan, 60), clean_(d.pax, 30), clean_(d.note, 500),
      clean_(u.utm_source), clean_(u.utm_medium), clean_(u.utm_campaign), clean_(u.utm_content), clean_(u.utm_term),
      clean_(u.fbclid), clean_(u.gclid), clean_(d.page, 300), clean_(d.referrer, 300), "Baru",
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error");
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Endpoint aktif.");
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Potong panjang & cegah formula injection di Sheets (= + - @).
function clean_(v, max) {
  var s = String(v == null ? "" : v).slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
