/* Logika halaman: WhatsApp, daftar paket, form leads, navigasi. */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var C = CFG.consultant || {};
  var DATA = window.VENTOUR_PACKAGES || { packages: [] };
  var track = window.trackEvent || function () {};
  var PAGE_SIZE = 6;
  var MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function parseISO(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(d, short) {
    var x = parseISO(d);
    return x.getDate() + " " + (short ? MONTHS_SHORT : MONTHS)[x.getMonth()] + " " + x.getFullYear();
  }
  function fmtRange(a, b) {
    if (!b) return fmtDate(a, true);
    var x = parseISO(a), y = parseISO(b);
    var left = x.getFullYear() === y.getFullYear() ? x.getDate() + " " + MONTHS_SHORT[x.getMonth()] : fmtDate(a, true);
    return left + " - " + fmtDate(b, true);
  }
  function fmtJt(n) { // 31900000 -> "31,9 jt"
    var v = n / 1e6;
    return (Math.round(v * 10) / 10).toString().replace(".", ",") + " jt";
  }
  function fmtRp(n) { return "Rp " + n.toLocaleString("id-ID"); }
  function monthKey(d) { return d.slice(0, 7); }
  function monthLabel(k) { var p = k.split("-"); return MONTHS[+p[1] - 1] + " " + p[0]; }

  // "PLATINUM 9D SV LANDING JEDDAH OUT MADINAH" -> "Platinum 9D SV Landing Jeddah Out Madinah"
  var KEEP = /^(\d+D+|\d+X|SV|WY|QR|GA|MS|EK|JT|OD|RX|EY|TK|UL|1449H|II|III)$/;
  var LOWER = { DAN: "dan" };
  function prettyName(name) {
    return name.split(/\s+/).map(function (w) {
      if (KEEP.test(w)) return w.replace(/X$/, "x");
      if (LOWER[w]) return LOWER[w];
      return w.charAt(0) + w.slice(1).toLowerCase();
    }).join(" ").replace("Fivestarlite", "Five Star Lite").replace(/^Fivestar/, "Five Star");
  }
  function titleHotel(h) {
    if (!h) return "Belum tersedia";
    return h.split(/\s+/).map(function (w) {
      return w.length <= 4 && !/^(AL|INN|DAR|EL)$/.test(w) && !/[AIUEO].*[AIUEO]/.test(w) ? w : w.charAt(0) + w.slice(1).toLowerCase();
    }).join(" ");
  }

  var waNumber = String(C.whatsapp || "").replace(/\D/g, "");
  function waLink(message) {
    var base = waNumber ? "https://wa.me/" + waNumber : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(message);
  }
  var GREETING = "Assalamu'alaikum, saya ingin konsultasi paket umroh Ventour Travel.";
  function generalMessage() {
    return GREETING + "\nMohon informasi paket yang sesuai. Terima kasih.";
  }
  function leadMessage(d) {
    var lines = [
      GREETING,
      "Nama: " + d.name,
      "Rencana keberangkatan: " + d.plan,
      "Jumlah jamaah: " + d.pax,
    ];
    if (d.note) lines.push("Catatan: " + d.note);
    lines.push("Mohon informasi paket yang sesuai. Terima kasih.");
    return lines.join("\n");
  }
  function packageMessage(p) {
    return [
      "Assalamu'alaikum, saya ingin bertanya tentang paket umroh Ventour Travel berikut:",
      "Paket: " + prettyName(p.name),
      "Keberangkatan: " + fmtDate(p.departDate),
      "Harga mulai: " + fmtRp(p.price),
      "Kode paket: " + p.id,
      "Mohon informasi ketersediaan dan detailnya. Terima kasih.",
    ].join("\n");
  }

  // Semua elemen [data-wa] menjadi tautan WhatsApp umum (kecuali tombol di form).
  function bindGeneralWa() {
    $$("[data-wa]").forEach(function (a) {
      a.href = waLink(generalMessage());
      a.target = "_blank";
      a.rel = "noopener";
      a.addEventListener("click", function () {
        track("contact_whatsapp", { location: a.getAttribute("data-wa") });
      });
    });
    if (!waNumber) {
      var b = $("#dev-banner");
      if (b) b.hidden = false;
      console.warn("[Ventour] SITE_CONFIG.consultant.whatsapp belum diatur. Tombol WhatsApp membuka pemilih kontak.");
    }
  }

  function applyConsultant() {
    $$('[data-consultant="name"]').forEach(function (el) { if (C.name) el.textContent = C.name; });
    $$('[data-consultant="role"]').forEach(function (el) {
      el.textContent = (C.role || "Konsultan Umroh Ventour Travel") + (C.area ? " · " + C.area : "");
    });
    var waDisp = $('[data-consultant="wa-display"]');
    if (waDisp && waNumber) waDisp.textContent = "WhatsApp: +" + waNumber.replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");
    if (C.email) {
      var e = $('[data-consultant="email"]');
      e.href = "mailto:" + C.email; e.textContent = C.email;
      $('[data-consultant-row="email"]').hidden = false;
    }
    if (C.instagram) {
      $('[data-consultant="instagram"]').href = C.instagram;
      $('[data-consultant-row="instagram"]').hidden = false;
    }
    if (C.photo) {
      var wrap = $("#consultant-photo");
      wrap.innerHTML = '<img src="' + esc(C.photo) + '" alt="Foto ' + esc(C.name) + '" width="560" height="700" loading="lazy">';
    }
  }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var PACKAGES = (DATA.packages || []).filter(function (p) { return parseISO(p.departDate) >= today; });
  var state = { program: "", month: "", sort: "date", shown: PAGE_SIZE };

  function filtered() {
    var list = PACKAGES.filter(function (p) {
      if (state.program === "Umroh Plus") { if (!p.plus) return false; }
      else if (state.program && p.program !== state.program) return false;
      if (state.month && monthKey(p.departDate) !== state.month) return false;
      return true;
    });
    var s = state.sort;
    list.sort(function (a, b) {
      if (s === "price-asc") return a.price - b.price;
      if (s === "price-desc") return b.price - a.price;
      return a.departDate < b.departDate ? -1 : a.departDate > b.departDate ? 1 : a.price - b.price;
    });
    return list;
  }

  function seatBadge(s) {
    if (!s) return "";
    var m = s.match(/(\d+)\s*Tersisa/i);
    if (m) {
      var n = +m[1];
      return '<span class="seat ' + (n <= 5 ? "seat--low" : "") + '">' + n + " kursi tersisa*</span>";
    }
    return '<span class="seat seat--ok">' + esc(s) + "*</span>";
  }

  function card(p) {
    var hl = (p.highlights || []).slice(0, 3).map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("");
    return (
      '<article class="pkg" data-id="' + esc(p.id) + '">' +
        '<header class="pkg-head">' +
          '<div class="pkg-tags"><span class="tag tag--program">' + esc(p.program) + "</span>" +
          (p.plus ? '<span class="tag">Plus ' + esc(p.plus) + "</span>" : "") +
          seatBadge(p.seatStatus) + "</div>" +
          "<h3>" + esc(prettyName(p.name)) + "</h3>" +
        "</header>" +
        '<dl class="pkg-meta">' +
          '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-cal"/></svg>Jadwal</dt><dd>' + esc(fmtRange(p.departDate, p.returnDate)) + "</dd></div>" +
          '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg>Durasi</dt><dd>' + (p.days ? p.days + " hari" : "Lihat detail") + "</dd></div>" +
          '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-plane"/></svg>Maskapai</dt><dd>' + esc(p.airline || "Lihat detail") + "</dd></div>" +
          '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-hotel"/></svg>Hotel Makkah</dt><dd>' + esc(titleHotel(p.hotelMakkah)) + "</dd></div>" +
          '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-hotel"/></svg>Hotel Madinah</dt><dd>' + esc(titleHotel(p.hotelMadinah)) + "</dd></div>" +
          (p.departCity ? '<div><dt><svg class="ic" aria-hidden="true"><use href="#i-pin"/></svg>Berangkat dari</dt><dd>' + esc(p.departCity) + "</dd></div>" : "") +
        "</dl>" +
        (hl ? '<ul class="pkg-hl" aria-label="Fasilitas tambahan">' + hl + "</ul>" : "") +
        '<div class="pkg-foot">' +
          '<div class="pkg-price">' +
            '<span class="price-label">Harga mulai / jamaah</span>' +
            '<span class="price-main">Rp ' + fmtJt(p.price) + "</span>" +
            (p.priceNormal ? '<s class="price-old" aria-label="Harga normal">Rp ' + fmtJt(p.priceNormal) + "</s>" : "") +
            (p.dp ? '<span class="price-dp">DP mulai ' + esc(p.dp.replace("Jt", "jt")) + "</span>" : "") +
          "</div>" +
          '<div class="pkg-actions">' +
            '<a class="btn btn-primary btn-block js-ask" target="_blank" rel="noopener" href="' + esc(waLink(packageMessage(p))) + '">' +
              '<svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg> Tanya Paket Ini</a>' +
            '<a class="text-link js-detail" target="_blank" rel="noopener" href="' + esc(p.detailUrl) + '">Detail resmi <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  // Tiga kasus kosong dibedakan: data gagal dimuat, tidak ada jadwal mendatang, atau filter terlalu sempit.
  function emptyState() {
    var msg;
    if (!window.VENTOUR_PACKAGES) {
      msg = "Data paket gagal dimuat. Lihat jadwal lengkap di ventour.co.id, atau tanyakan langsung lewat WhatsApp.";
    } else if (!PACKAGES.length) {
      msg = "Belum ada jadwal mendatang di data halaman ini. Tanyakan jadwal terbaru lewat WhatsApp.";
    } else {
      var what = state.program ? "paket " + state.program : "paket";
      var when = state.month ? " untuk " + monthLabel(state.month) : "";
      msg = "Tidak ada " + what + when + ". Pilih bulan atau program lain, atau tanyakan jadwal lain lewat WhatsApp.";
    }
    return '<div class="empty" role="status"><p>' + esc(msg) + '</p><a class="btn btn-primary" data-wa="empty-filter" href="' +
      esc(waLink(generalMessage())) + '" target="_blank" rel="noopener">Tanyakan jadwal lain</a></div>';
  }

  function renderPackages() {
    var grid = $("#package-grid");
    var list = filtered();
    var shown = list.slice(0, state.shown);
    grid.innerHTML = shown.length ? shown.map(card).join("") : emptyState();
    grid.setAttribute("aria-busy", "false");
    $("#result-count").textContent = list.length
      ? "Menampilkan " + shown.length + " dari " + list.length + " paket"
      : "";
    var more = $("#load-more");
    more.hidden = list.length <= state.shown;
    more.textContent = "Tampilkan paket lainnya (" + Math.max(0, list.length - state.shown) + ")";
  }

  function setupPackages() {
    var programs = ["Friendly", "Proven", "Premium", "Platinum", "Five Star"].filter(function (pr) {
      return PACKAGES.some(function (p) { return p.program === pr; });
    });
    if (PACKAGES.some(function (p) { return p.plus; })) programs.push("Umroh Plus");
    var chips = $("#program-chips");
    chips.innerHTML = ["Semua"].concat(programs).map(function (pr, i) {
      return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-program="' + (i === 0 ? "" : esc(pr)) + '">' + esc(pr) + "</button>";
    }).join("");
    chips.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      $$(".chip", chips).forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
      state.program = b.getAttribute("data-program");
      state.shown = PAGE_SIZE;
      renderPackages();
      track("filter_packages", { program: state.program || "semua" });
    });

    var months = [];
    PACKAGES.forEach(function (p) { var k = monthKey(p.departDate); if (months.indexOf(k) < 0) months.push(k); });
    months.sort();
    var sel = $("#filter-month");
    months.forEach(function (k) { sel.insertAdjacentHTML("beforeend", '<option value="' + k + '">' + monthLabel(k) + "</option>"); });
    sel.addEventListener("change", function () { state.month = sel.value; state.shown = PAGE_SIZE; renderPackages(); });
    $("#filter-sort").addEventListener("change", function (e) { state.sort = e.target.value; renderPackages(); });
    $("#load-more").addEventListener("click", function () { state.shown += PAGE_SIZE; renderPackages(); });

    $("#package-grid").addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a) return;
      var art = a.closest(".pkg");
      var p = art && PACKAGES.filter(function (x) { return x.id === art.getAttribute("data-id"); })[0];
      if (a.classList.contains("js-ask") && p) {
        track("select_package", { package_id: p.id, package_name: p.name, value: p.price, currency: "IDR" });
        track("contact_whatsapp", { location: "package_card", package_id: p.id });
      } else if (a.classList.contains("js-detail") && p) {
        track("view_package", { package_id: p.id, package_name: p.name, content_ids: [p.id], content_type: "product" });
      } else if (a.hasAttribute("data-wa")) {
        track("contact_whatsapp", { location: a.getAttribute("data-wa") });
      }
    });

    var upd = DATA.updatedAt ? fmtDate(DATA.updatedAt) : "tanggal tidak tersedia";
    $$("[data-updated]").forEach(function (el) { el.textContent = upd; });
    $$("[data-updated-note]").forEach(function (el) { el.textContent = "Sumber: ventour.co.id · diperbarui " + upd; });
    if (PACKAGES.length) {
      var first = PACKAGES.reduce(function (a, p) { return p.departDate < a ? p.departDate : a; }, PACKAGES[0].departDate);
      var last = PACKAGES.reduce(function (a, p) { return p.departDate > a ? p.departDate : a; }, PACKAGES[0].departDate);
      $$('[data-stat="count"]').forEach(function (el) { el.textContent = PACKAGES.length; });
      $$('[data-stat="range"]').forEach(function (el) { el.textContent = monthLabel(monthKey(first)) + " sampai " + monthLabel(monthKey(last)); });
    }

    // Kartu "Keberangkatan terdekat" di hero: tiga jadwal paling awal.
    var next = PACKAGES.slice().sort(function (a, b) { return a.departDate < b.departDate ? -1 : 1; }).slice(0, 3);
    $("#next-departures").innerHTML = next.length ? next.map(function (p) {
      return '<li><a href="' + esc(waLink(packageMessage(p))) + '" target="_blank" rel="noopener" data-id="' + esc(p.id) + '">' +
        '<span class="nd-date"><b>' + parseISO(p.departDate).getDate() + "</b>" + MONTHS_SHORT[parseISO(p.departDate).getMonth()] + "</span>" +
        '<span class="nd-body"><span class="nd-name">' + esc(prettyName(p.name)) + "</span>" +
        '<span class="nd-meta">' + (p.days ? p.days + " hari · " : "") + esc(p.airline || "") + "</span></span>" +
        '<span class="nd-price">Rp ' + fmtJt(p.price) + "</span></a></li>";
    }).join("") : '<li class="next-empty">Jadwal belum tersedia. Silakan tanyakan kepada konsultan.</li>';
    $("#next-departures").addEventListener("click", function (e) {
      var a = e.target.closest("a[data-id]");
      if (a) {
        track("select_package", { package_id: a.getAttribute("data-id"), location: "hero_next" });
        track("contact_whatsapp", { location: "hero_next" });
      }
    });

    renderPackages();
  }

  function utm() {
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    var params = new URLSearchParams(location.search);
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("vt_utm") || "{}"); } catch (e) { /* abaikan */ }
    keys.forEach(function (k) { if (params.get(k)) stored[k] = params.get(k).slice(0, 200); });
    try { sessionStorage.setItem("vt_utm", JSON.stringify(stored)); } catch (e) { /* abaikan */ }
    return stored;
  }

  function normalizePhone(v) {
    var d = String(v).replace(/[^\d+]/g, "");
    if (d.indexOf("+") === 0) d = d.slice(1);
    if (d.indexOf("0") === 0) d = "62" + d.slice(1);
    else if (d.indexOf("8") === 0) d = "62" + d;
    return /^62\d{8,13}$/.test(d) ? d : null;
  }

  function setupForm() {
    var form = $("#lead-form");
    if (!form) return;
    var utmData = utm();

    // Opsi rencana keberangkatan: 12 bulan ke depan
    var plan = $("#f-plan");
    var d = new Date(today.getFullYear(), today.getMonth(), 1);
    for (var i = 0; i < 12; i++) {
      var label = MONTHS[d.getMonth()] + " " + d.getFullYear();
      plan.insertAdjacentHTML("beforeend", "<option>" + label + "</option>");
      d.setMonth(d.getMonth() + 1);
    }
    plan.insertAdjacentHTML("beforeend", "<option>Lebih dari 12 bulan lagi</option><option>Belum menentukan waktu</option>");
    var pax = $("#f-pax");
    for (var n = 1; n <= 10; n++) pax.insertAdjacentHTML("beforeend", "<option>" + n + " orang</option>");
    pax.insertAdjacentHTML("beforeend", "<option>Lebih dari 10 orang</option>");

    var started = false;
    form.addEventListener("input", function () {
      if (!started) { started = true; track("form_start", { form: "konsultasi" }); }
    });

    function setErr(id, msg) {
      var el = $("#e-" + id);
      var input = form.elements[id];
      el.textContent = msg || "";
      if (input) {
        input.setAttribute("aria-invalid", msg ? "true" : "false");
        if (msg) input.setAttribute("aria-describedby", "e-" + id); else input.removeAttribute("aria-describedby");
      }
      return !msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.website.value) return; // bot
      var data = {
        name: form.name.value.trim().replace(/\s+/g, " "),
        phone: form.phone.value.trim(),
        plan: form.plan.value,
        pax: form.pax.value,
        note: form.note.value.trim(),
      };
      var phoneNorm = normalizePhone(data.phone);
      var ok = [
        setErr("name", data.name.length >= 2 ? "" : "Mohon isi nama Anda."),
        setErr("phone", phoneNorm ? "" : "Masukkan nomor WhatsApp yang valid, mis. 0812xxxxxxx."),
        setErr("plan", data.plan ? "" : "Pilih perkiraan waktu keberangkatan."),
        setErr("pax", data.pax ? "" : "Pilih jumlah calon jamaah."),
        setErr("consent", form.consent.checked ? "" : "Mohon centang persetujuan untuk melanjutkan."),
      ].every(Boolean);
      if (!ok) {
        var firstErr = $("[aria-invalid=true]", form) || form.consent;
        firstErr.focus();
        return;
      }

      var message = leadMessage(data);
      var link = waLink(message);
      var btn = $("#lead-submit");
      btn.disabled = true;
      btn.textContent = "Memproses…";

      var saved = Promise.resolve(false);
      if (CFG.leadEndpoint) {
        var payload = {
          name: data.name, phone: phoneNorm, plan: data.plan, pax: data.pax, note: data.note,
          page: location.href.split("?")[0], referrer: document.referrer || "", utm: utmData,
          submittedAt: new Date().toISOString(),
        };
        // text/plain menghindari preflight CORS (kompatibel dengan Google Apps Script)
        saved = fetch(CFG.leadEndpoint, {
          method: "POST", mode: "no-cors", keepalive: true,
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        }).then(function () { return true; }).catch(function () { return false; });
      }

      saved.then(function (stored) {
        track("form_submit", { form: "konsultasi", plan: data.plan, pax: data.pax });
        track("generate_lead", { form: "konsultasi", lead_stored: stored, currency: "IDR", value: 0 });
        $("#success-name").textContent = data.name.split(" ")[0];
        $("#success-text").textContent = stored
          ? "Data konsultasi Anda sudah tercatat. Tekan tombol di bawah untuk melanjutkan percakapan melalui WhatsApp."
          : "Pesan Anda sudah disiapkan. Tekan tombol di bawah untuk mengirimkannya ke konsultan melalui WhatsApp.";
        var wa = $("#success-wa");
        wa.href = link;
        wa.onclick = function () { track("contact_whatsapp", { location: "form_success" }); };
        form.hidden = true;
        var s = $("#lead-success");
        s.hidden = false;
        s.focus();
        btn.disabled = false;
        btn.textContent = "Kirim & lanjut ke WhatsApp";
      });
    });

    $("#lead-reset").addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      $("#lead-success").hidden = true;
      form.name.focus();
    });
  }

  function setupNav() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    var nav = $("#main-nav");
    var label = $(".nav-toggle-label");
    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Tutup" : "Menu";
    }
    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setOpen(false); toggle.focus(); }
    });

    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 24); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Tandai menu aktif sesuai section yang terlihat
    if ("IntersectionObserver" in window) {
      // Tombol WA melayang menutupi kolom form di HP; section form sudah punya tombol WA sendiri.
      var leadSection = document.getElementById("konsultasi");
      if (leadSection) {
        new IntersectionObserver(function (entries) {
          document.body.classList.toggle("lead-in-view", entries[0].isIntersecting);
        }).observe(leadSection);
      }
      var links = $$(".main-nav a[href^='#']");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["beranda", "paket", "mengapa-ventour", "panduan", "konsultan"].forEach(function (id) {
        var s = document.getElementById(id); if (s) io.observe(s);
      });
    }

    // Jejak FAQ yang dibuka (minat calon jamaah)
    $$(".faq details").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) track("faq_open", { question: $("summary", d).textContent.trim() });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    applyConsultant();
    bindGeneralWa();
    setupPackages();
    setupForm();
    setupNav();
  });
})();
