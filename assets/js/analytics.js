/*
 * Analytics + persetujuan cookie.
 * - GA4 dan Meta Pixel HANYA dimuat bila ID dikonfigurasi DAN pengunjung menyetujui.
 * - Event dikirim lewat window.trackEvent(nama, parameter). Bila tracker belum aktif,
 *   event tetap dicatat ke window.dataLayer (aman, tanpa pihak ketiga).
 */
(function () {
  var cfg = (window.SITE_CONFIG && window.SITE_CONFIG.analytics) || {};
  var CONSENT_KEY = "vt_consent";
  var hasTrackers = Boolean(cfg.ga4Id || cfg.metaPixelId);
  var loaded = false;

  window.dataLayer = window.dataLayer || [];

  // Pemetaan event internal -> event standar Meta.
  var META_STANDARD = { generate_lead: "Lead", contact_whatsapp: "Contact", view_package: "ViewContent" };

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* mode privat */ }
  }

  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadTrackers() {
    if (loaded) return;
    loaded = true;
    if (cfg.ga4Id) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.ga4Id); // mengirim page_view otomatis
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id));
    }
    if (cfg.metaPixelId) {
      /* Meta Pixel base code (resmi), dibungkus agar hanya jalan setelah persetujuan */
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", cfg.metaPixelId);
      window.fbq("track", "PageView");
    }
  }

  window.trackEvent = function (name, params) {
    params = params || {};
    window.dataLayer.push({ event: name, params: params });
    if (!loaded) return;
    if (window.gtag) window.gtag("event", name, params);
    if (window.fbq) {
      var std = META_STANDARD[name];
      if (std) window.fbq("track", std, params);
      else window.fbq("trackCustom", name, params);
    }
  };

  function showBanner() {
    var el = document.getElementById("cookie-notice");
    if (!el) return;
    el.hidden = false;
    el.querySelector("[data-consent=accept]").addEventListener("click", function () {
      setConsent("granted"); el.hidden = true; loadTrackers();
    });
    el.querySelector("[data-consent=reject]").addEventListener("click", function () {
      setConsent("denied"); el.hidden = true;
    });
  }

  // Tombol "Pengaturan cookie" di footer membuka ulang pilihan.
  window.openCookieSettings = function () {
    if (!hasTrackers) return alert("Situs ini belum menggunakan cookie analitik/iklan.");
    setConsent("");
    showBanner();
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!hasTrackers) return; // tidak ada tracker -> tidak perlu banner
    var c = getConsent();
    if (c === "granted") loadTrackers();
    else if (c !== "denied") showBanner();
  });
})();
