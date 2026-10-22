#!/usr/bin/env python3
"""
Perbarui data paket umroh dari sumber resmi Ventour Travel.

Sumber:
  - Daftar paket : https://ventour.co.id/  (tabel "Pilihan Paket Umroh Terbaik")
  - Detail paket : https://venom.ventour.co.id/jamaah/detail_paket?id=<ID>

Hasil:
  - assets/js/packages.js  data bawaan yang ikut ter-deploy (window.VENTOUR_PACKAGES)
  - data/packages.json     data yang dibaca halaman langsung dari GitHub, diperbarui
                           otomatis oleh .github/workflows/update-packages.yml

Pemakaian (hanya butuh Python 3 standar, tanpa dependensi):
  python3 tools/update_packages.py

Catatan:
  - Script hanya MENYALIN data yang tampil di situs resmi. Jangan menambah
    atau mengubah harga/jadwal/hotel secara manual tanpa sumber resmi.
  - Jika struktur HTML situs resmi berubah, parser bisa gagal. Dalam kasus
    itu, file packages.js lama TIDAK ditimpa.
  - Program non-umroh reguler (Haji, Badal, Vcation/Halal Tour, tabungan
    "Rencana Menuju Baitullah") dilewati karena di luar fokus halaman ini.
"""
import html
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

HOME_URL = "https://ventour.co.id/"
DETAIL_URL = "https://venom.ventour.co.id/jamaah/detail_paket?id={}"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "js" / "packages.js"
OUT_JSON = ROOT / "data" / "packages.json"
WIB = ZoneInfo("Asia/Jakarta")
UA = "Mozilla/5.0 (compatible; VentourKonsultanBot/1.0; +data-sync)"

MONTHS_ID = {"januari": 1, "februari": 2, "maret": 3, "april": 4, "mei": 5, "juni": 6, "juli": 7,
             "agustus": 8, "september": 9, "oktober": 10, "november": 11, "desember": 12}

# Kode maskapai IATA -> nama. Dipakai dari nomor penerbangan / kode di nama paket.
AIRLINES = {"SV": "Saudia", "WY": "Oman Air", "QR": "Qatar Airways", "GA": "Garuda Indonesia",
            "MS": "EgyptAir", "EK": "Emirates", "JT": "Lion Air", "OD": "Batik Air",
            "RX": "Riyadh Air", "EY": "Etihad Airways", "TK": "Turkish Airlines", "UL": "SriLankan Airlines",
            "QG": "Citilink", "6E": "IndiGo", "ID": "Batik Air", "MH": "Malaysia Airlines", "HY": "Uzbekistan Airways",
            "BI": "Royal Brunei", "AK": "AirAsia", "ET": "Ethiopian Airlines"}
ICON_AIRLINES = {"saudia": "Saudia", "oman": "Oman Air", "qatar": "Qatar Airways", "garuda-indonesia": "Garuda Indonesia",
                 "egypt-air": "EgyptAir", "emirates": "Emirates", "lion-air": "Lion Air", "batik": "Batik Air"}

SKIP = re.compile(r"\b(HAJI|BADAL|VCATION|RENCANA MENUJU)\b", re.I)
PROGRAMS = [("FIVESTAR", "Five Star"), ("PLATINUM", "Platinum"), ("PREMIUM", "Premium"),
            ("PROVEN", "Proven"), ("FRIENDLY", "Friendly")]
PLUS_DEST = [("TURKI", "Turki"), ("MESIR", "Mesir"), ("DUBAI", "Dubai"), ("AL ULA", "Al Ula"), ("MUSCAT", "Muscat")]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "ignore")


def text_lines(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->", "", s, flags=re.S)
    s = html.unescape(re.sub(r"<[^>]+>", "\n", s))
    return [l.strip() for l in s.split("\n") if l.strip()]


def first(pattern, s):
    m = re.search(pattern, s, re.S)
    return m.group(1).strip() if m else None


def rupiah(text):
    """'IDR 39.900.000,-' -> 39900000"""
    if not text or "IDR" not in text:
        return None
    digits = re.sub(r"[^\d]", "", text.split(",")[0])
    return int(digits) if digits else None


def parse_en_date(s):
    try:
        return datetime.strptime(s.strip(), "%A, %d %B %Y").date().isoformat()
    except (ValueError, AttributeError):
        return None


def parse_id_date(s):
    m = re.match(r"(\d{1,2}) (\w+) (\d{2})$", (s or "").strip())
    if not m or m.group(2).lower() not in MONTHS_ID:
        return None
    return date(2000 + int(m.group(3)), MONTHS_ID[m.group(2).lower()], int(m.group(1))).isoformat()


def parse_home(s):
    rows = []
    for b in s.split('<div class="container-utama konten"')[1:]:
        b = re.sub(r"<!--.*?-->", "", b, flags=re.S)
        url = first(r'class="container-detail" href="([^"]+)"', b)
        if not url:
            continue
        rows.append({
            "id": url.split("id=")[-1],
            "name": html.unescape(first(r'nama-isi"[^>]*>(.*?)</div>', b) or "").strip(),
            "dateText": first(r'tanggal-isi">\s*([^<]+?)\s*<', b),
            "seat": first(r'seat-isi"[^>]*>\s*([^<]*?)\s*<', b) or "",
            "airIcon": first(r"pesawat-isi\">\s*<img[^>]*src='([^']+)'", b) or "",
            "hotelMakkah": html.unescape(first(r'mk-isi">.*?>\s*([^<]+?)\s*</a>', b) or ""),
            "hotelMadinah": html.unescape(first(r'md-isi">.*?>\s*([^<]+?)\s*</a>', b) or ""),
        })
    return rows


def parse_detail(pid):
    try:
        L = text_lines(fetch(DETAIL_URL.format(pid)))
    except Exception as e:  # noqa: BLE001
        print(f"  ! gagal ambil detail {pid}: {e}", file=sys.stderr)
        return {}

    def after(key, n=1):
        try:
            i = L.index(key)
            return L[i + 1:i + 1 + n]
        except ValueError:
            return []

    out = {}
    prices = after("Harga mulai :", 2)
    if prices:
        out["priceNormal"] = rupiah(prices[0])
        out["price"] = rupiah(prices[-1])
    trip = after("Trip Schedule", 2)
    if len(trip) == 2:
        out["departDate"], out["returnDate"] = parse_en_date(trip[0]), parse_en_date(trip[1])
    try:
        a = L.index("Detail Promo")
        b = L.index("Maskapai", a)
        out["highlights"] = [x.title() for x in L[a + 1:b] if x and x != "-->"]
    except ValueError:
        out["highlights"] = []
    dp = after("DP mulai dari")
    out["dp"] = dp[0] if dp else None
    flights = [l for l in L if re.match(r"^[A-Z0-9]{2}\d{2,4} \d{2}[A-Z]{3}", l)]
    out["flightCode"] = flights[0][:2] if flights else None
    return out


def airline_for(row, det):
    code = det.get("flightCode")
    if code in AIRLINES:
        return AIRLINES[code]
    icon = row["airIcon"].rsplit("/", 1)[-1].rsplit(".", 1)[0]
    if icon in ICON_AIRLINES:
        return ICON_AIRLINES[icon]
    m = re.search(r"\b\d+D{1,2} ([A-Z0-9]{2})\b", row["name"])
    return AIRLINES.get(m.group(1)) if m else None


def build():
    home = fetch(HOME_URL)
    rows = [r for r in parse_home(home) if not SKIP.search(r["name"])]
    print(f"{len(rows)} paket umroh ditemukan, mengambil detail...")
    with ThreadPoolExecutor(max_workers=8) as ex:
        details = list(ex.map(lambda r: parse_detail(r["id"]), rows))

    today = date.today().isoformat()
    pkgs = []
    for r, d in zip(rows, details):
        depart = d.get("departDate") or parse_id_date(r["dateText"])
        if not d.get("price") or not depart or depart < today:
            continue
        name = re.sub(r"\s+", " ", r["name"])
        upper = name.upper().replace("FIVESTARLITE", "FIVESTAR LITE").replace("PROVENPLUS", "PROVEN PLUS")
        program = next((label for key, label in PROGRAMS if key in upper), "Lainnya")
        plus = next((label for key, label in PLUS_DEST if key in upper), None)
        days = None
        if d.get("returnDate"):
            days = (date.fromisoformat(d["returnDate"]) - date.fromisoformat(depart)).days + 1
        city = first(r"START (\w+)", upper)
        seat = r["seat"].strip()
        pkgs.append({
            "id": r["id"],
            "name": name,
            "program": program,
            "plus": plus,
            "departDate": depart,
            "returnDate": d.get("returnDate"),
            "days": days,
            "departCity": city.title() if city else None,
            "airline": airline_for(r, d),
            "hotelMakkah": r["hotelMakkah"] or None,
            "hotelMadinah": r["hotelMadinah"] or None,
            "price": d.get("price"),
            "priceNormal": d.get("priceNormal") if d.get("priceNormal") != d.get("price") else None,
            "dp": d.get("dp"),
            "highlights": d.get("highlights", []),
            "seatStatus": seat or None,
            "detailUrl": DETAIL_URL.format(r["id"]),
        })
    pkgs.sort(key=lambda p: (p["departDate"], p["price"]))
    return pkgs


def main():
    try:
        pkgs = build()
    except Exception as e:  # noqa: BLE001
        sys.exit(f"Gagal memperbarui data: {e}. File lama tidak diubah.")
    if not pkgs:
        sys.exit("Tidak ada paket terbaca (struktur situs mungkin berubah). File lama tidak diubah.")

    old = []
    if OUT_JSON.exists():
        old = json.loads(OUT_JSON.read_text(encoding="utf-8")).get("packages", [])
    # Hasil yang anjlok drastis lebih mungkin gangguan situs/parser daripada paket yang benar-benar hilang.
    if old and len(pkgs) < len(old) * 0.5:
        sys.exit(f"Hanya {len(pkgs)} paket terbaca (sebelumnya {len(old)}). File lama tidak diubah.")
    if pkgs == old:
        print(f"Tidak ada perubahan ({len(pkgs)} paket).")
        return

    now = datetime.now(timezone.utc)
    payload = {
        "updatedAt": now.astimezone(WIB).date().isoformat(),
        "generatedAt": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source": HOME_URL,
        "packages": pkgs,
    }
    text = json.dumps(payload, ensure_ascii=False, indent=1)
    OUT_JSON.parent.mkdir(exist_ok=True)
    OUT_JSON.write_text(text + "\n", encoding="utf-8")
    OUT.write_text(
        "/* File ini DIHASILKAN OTOMATIS oleh tools/update_packages.py dari situs resmi Ventour.\n"
        "   Jangan mengubah harga/jadwal secara manual tanpa sumber resmi. */\n"
        "window.VENTOUR_PACKAGES = " + text + ";\n",
        encoding="utf-8",
    )
    print(f"OK: {len(pkgs)} paket ditulis ke {OUT_JSON} dan {OUT}")


if __name__ == "__main__":
    main()
