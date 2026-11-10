(function () {
  "use strict";

  var CONSENT_KEY = "pec_cookie_consent";
  var CONSENT_VERSION = "1.0";

  function getConsent() {
    try {
      var stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  function setConsent(consent) {
    var data = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!consent.analytics,
      advertising: !!consent.advertising,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    return data;
  }

  function hasConsent(type) {
    var consent = getConsent();
    if (!consent) return false;
    if (type === "necessary") return true;
    return !!consent[type];
  }

  function loadGoogleAdSense() {
    if (window.adsbygoogle) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
    window.adsbygoogle = window.adsbygoogle || [];
  }

  function loadAnalytics() {
    if (window.gtag) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX";
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", "G-XXXXXXXXXX");
  }

  function initializeConsent() {
    var consent = getConsent();
    if (consent) {
      if (consent.analytics) loadAnalytics();
      if (consent.advertising) loadGoogleAdSense();
      if (window.PECAds && typeof window.PECAds.initializeVisibleBannerAdsOnly === "function") {
        window.PECAds.initializeVisibleBannerAdsOnly();
      }
    }
  }

  function createBanner() {
    if (document.getElementById("pec-cookie-banner")) return;
    if (getConsent()) return;

    var banner = document.createElement("div");
    banner.id = "pec-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML =
      '<div class="cookie-banner-content">' +
      '<p class="cookie-banner-text">We use cookies to improve your experience, analyze traffic, and serve personalized ads via Google AdSense. By clicking "Accept All", you consent to our use of cookies. <a href="privacy-policy.html">Privacy Policy</a></p>' +
      '<div class="cookie-banner-buttons">' +
      '<button type="button" class="cookie-btn cookie-btn-accept" data-consent="all">Accept All</button>' +
      '<button type="button" class="cookie-btn cookie-btn-customize" data-consent="customize">Customize</button>' +
      '<button type="button" class="cookie-btn cookie-btn-reject" data-consent="necessary">Reject Optional</button>' +
      '</div>' +
      '<div class="cookie-banner-customize" style="display:none;">' +
      '<label><input type="checkbox" id="cookie-analytics" checked disabled> Necessary (always active)</label>' +
      '<label><input type="checkbox" id="cookie-analytics-opt" checked> Analytics</label>' +
      '<label><input type="checkbox" id="cookie-advertising-opt" checked> Advertising (AdSense)</label>' +
      '<button type="button" class="cookie-btn cookie-btn-save" data-consent="save">Save Preferences</button>' +
      '</div>' +
      '</div>';

    var style = document.createElement("style");
    style.id = "pec-cookie-banner-style";
    style.textContent =
      "#pec-cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:10000;background:#fff;border-top:1px solid #e2e8f0;box-shadow:0 -4px 20px rgba(15,23,42,.1);padding:16px 20px;font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.5;animation:slideUp .3s ease-out}@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}.cookie-banner-content{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:12px}.cookie-banner-text{margin:0;color:#1e293b;font-size:14px}.cookie-banner-text a{color:#1d4ed8;text-decoration:underline}.cookie-banner-buttons{display:flex;gap:8px;flex-wrap:wrap}.cookie-btn{padding:10px 18px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;border:1px solid transparent;transition:.2s}.cookie-btn-accept{background:#1e3a8a;color:#fff}.cookie-btn-accept:hover{background:#1e40af}.cookie-btn-customize{background:#fff;color:#1e3a8a;border-color:#1e3a8a}.cookie-btn-customize:hover{background:#eff6ff}.cookie-btn-reject{background:#fff;color:#64748b;border-color:#cbd5e1}.cookie-btn-reject:hover{background:#f8fafc}.cookie-banner-customize{display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding-top:8px;border-top:1px solid #e2e8f0}.cookie-banner-customize label{display:flex;align-items:center;gap:8px;font-size:13px;color:#334155;cursor:pointer}.cookie-banner-customize input[type=checkbox]{width:16px;height:16px;accent-color:#1e3a8a}.cookie-btn-save{background:#1e3a8a;color:#fff;margin-left:auto}.cookie-btn-save:hover{background:#1e40af}@media (max-width:640px){.cookie-banner-buttons{flex-direction:column}.cookie-btn{width:100%}.cookie-banner-customize{flex-direction:column;align-items:flex-start}.cookie-btn-save{width:100%;margin-left:0}}";

    document.head.appendChild(style);
    document.body.appendChild(banner);

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest(".cookie-btn");
      if (!btn) return;
      var action = btn.getAttribute("data-consent");
      if (action === "all") {
        var consent = setConsent({ analytics: true, advertising: true });
        loadAnalytics();
        loadGoogleAdSense();
        if (window.PECAds && typeof window.PECAds.initializeVisibleBannerAdsOnly === "function") {
          window.PECAds.initializeVisibleBannerAdsOnly();
        }
        banner.remove();
      } else if (action === "customize") {
        banner.querySelector(".cookie-banner-buttons").style.display = "none";
        banner.querySelector(".cookie-banner-customize").style.display = "flex";
      } else if (action === "necessary") {
        setConsent({ analytics: false, advertising: false });
        banner.remove();
      } else if (action === "save") {
        var analytics = document.getElementById("cookie-analytics-opt").checked;
        var advertising = document.getElementById("cookie-advertising-opt").checked;
        var consent = setConsent({ analytics: analytics, advertising: advertising });
        if (analytics) loadAnalytics();
        if (advertising) loadGoogleAdSense();
        if (window.PECAds && typeof window.PECAds.initializeVisibleBannerAdsOnly === "function") {
          window.PECAds.initializeVisibleBannerAdsOnly();
        }
        banner.remove();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeConsent();
      createBanner();
    });
  } else {
    initializeConsent();
    createBanner();
  }

  window.PECCookieConsent = {
    getConsent: getConsent,
    setConsent: setConsent,
    hasConsent: hasConsent,
    reset: function () {
      localStorage.removeItem(CONSENT_KEY);
      location.reload();
    }
  };
})();