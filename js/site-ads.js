(function () {
  "use strict";

  var PATH = window.location.pathname.toLowerCase();
  var FNAME = PATH.substring(PATH.lastIndexOf("/") + 1);

  var DENY_FILES = [
    "admin.html",
    "admin-content.html",
    "admin-seed-starter.html",
    "admin-students.html",
    "admin-login.html",
    "live-test-admin.html",
    "practice-test-admin.html",
    "tournament-admin.html",
    "tournament-draw-test.html",
    "tournament-preview-test.html",
    "test.html",
    "class-selection.html",
    "404.html",
    "coming-soon.html",
    "googlee24decdc4d4a6ce9.html"
  ];

  var PROTECTED_NO_POPUP_PAGES = [
    "student-login.html",
    "student-register.html",
    "student-forgot.html",
    "student-dashboard.html",
    "student-portal.html",
    "student-live-tests.html",
    "student-practice-tests.html",
    "student-attempt.html",
    "student-practice-attempt.html",
    "student-result.html",
    "student-practice-result.html",
    "student-my-results.html",
    "student-analytics.html",
    "student-review.html",
    "student-certificate.html",
    "student-details.html",
    "student-leaderboard.html",
    "student-practice-leaderboard.html",
    "student-profile.html",
    "live-test.html",
    "live-tests.html",
    "class11-test.html",
    "class12-test.html",
    "yoga-test.html",
    "yoga-day-quiz.html",
    "certificate.html",
    "certificate-verify.html",
    "tournament-coach.html"
  ];

  function hasProtectedAttribute() {
    if (document.documentElement.hasAttribute("data-protected-no-popup")) return true;
    return !!(document.body && document.body.hasAttribute("data-protected-no-popup"));
  }

  function isProtectedNoPopupPage() {
    if (hasProtectedAttribute()) return true;
    if (PROTECTED_NO_POPUP_PAGES.indexOf(FNAME) !== -1) return true;
    if (FNAME.indexOf("student-") === 0) return true;
    if (FNAME === "class11-test.html" || FNAME === "class12-test.html") return true;
    if (/^class(?:11|12)-ch\d+-test\.html$/.test(FNAME)) return true;
    if (FNAME === "live-test.html" || FNAME === "live-tests.html") return true;
    if (FNAME === "yoga-test.html" || FNAME === "yoga-day-quiz.html") return true;
    if (FNAME.indexOf("certificate") !== -1) return true;
    if (FNAME === "tournament-coach.html") return true;
    return false;
  }

  function isDenied() {
    if (document.documentElement.hasAttribute("data-no-ads")) return true;
    if (document.body && document.body.hasAttribute("data-no-ads")) return true;
    if (isProtectedNoPopupPage()) return false;
    for (var i = 0; i < DENY_FILES.length; i++) {
      if (FNAME === DENY_FILES[i]) return true;
    }
    if (PATH.indexOf("/config/") !== -1) return true;
    if (PATH.indexOf("/cert/") !== -1) return true;
    return false;
  }

  var DENIED = isDenied();

  var cssText = [
    ".pec-ad-slot{max-width:100%;overflow:hidden;margin:15px auto;text-align:center;clear:both;box-sizing:border-box}",
    ".pec-ad-slot iframe{display:block;max-width:100%;width:100%;border:0;margin:0 auto}",
    ".pec-ad-top{margin:10px auto}",
    ".pec-ad-middle{margin:30px auto}",
    ".pec-ad-bottom{margin:15px auto}",
    ".pec-ad-action{margin:20px auto;padding:10px 0;border-top:1px dashed rgba(255,255,255,0.12);border-bottom:1px dashed rgba(255,255,255,0.12)}",
    ".pec-ad-desktop{display:block}",
    ".pec-ad-mobile{display:none}",
    "@media(max-width:768px){",
    ".pec-ad-desktop{display:none}",
    ".pec-ad-mobile{display:block}",
    "}"
  ].join("");

  function appendStyle() {
    if (document.getElementById("pec-ad-style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "pec-ad-style";
    styleEl.textContent = cssText;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  function findHeader() {
    return document.querySelector("header, .edu-nav, .topbar, .t-top, .portal-hero, .hero") ||
      document.querySelector(".brand");
  }

  function findFooter() {
    return document.querySelector("footer, .edu-foot");
  }

  function ensureSlot(id, className) {
    var existing = document.getElementById(id);
    if (existing) return existing;
    var slot = document.createElement("div");
    slot.id = id;
    slot.className = "pec-ad-slot " + className;
    slot.setAttribute("data-pec-ad-slot", id);
    return slot;
  }

  function insertAfter(newEl, refEl) {
    if (!refEl || !refEl.parentNode) {
      insertAtBodyStart(newEl);
      return;
    }
    var next = refEl.nextSibling;
    if (next) {
      refEl.parentNode.insertBefore(newEl, next);
    } else {
      refEl.parentNode.appendChild(newEl);
    }
  }

  function insertBefore(newEl, refEl) {
    if (!refEl || !refEl.parentNode) {
      insertAtBodyEnd(newEl);
      return;
    }
    refEl.parentNode.insertBefore(newEl, refEl);
  }

  function insertAtBodyStart(el) {
    if (document.body) document.body.insertBefore(el, document.body.firstChild);
  }

  function insertAtBodyEnd(el) {
    if (document.body) document.body.appendChild(el);
  }

  function injectVisibleBannerAdsOnly() {
    if (!document.body || document.documentElement.getAttribute("data-pec-ads-initialized") === "true") return;
    document.documentElement.setAttribute("data-pec-ads-initialized", "true");
    appendStyle();

    var header = findHeader();
    var footer = findFooter();

    var topWrapper = ensureSlot("pec-ad-top", "pec-ad-top");
    var desktop728 = ensureSlot("pec-ad-728-top", "pec-ad-desktop");
    var mobile320 = ensureSlot("pec-ad-320-top", "pec-ad-mobile");
    if (!desktop728.parentNode) topWrapper.appendChild(desktop728);
    if (!mobile320.parentNode) topWrapper.appendChild(mobile320);
    if (topWrapper.parentNode !== document.body && topWrapper.parentNode !== header) {
      if (header) insertAfter(topWrapper, header);
      else insertAtBodyStart(topWrapper);
    }

    var middleWrapper = ensureSlot("pec-ad-300-middle", "pec-ad-middle");
    if (!middleWrapper.parentNode) {
      if (footer) insertBefore(middleWrapper, footer);
      else insertAtBodyEnd(middleWrapper);
    }

    var bottomWrapper = ensureSlot("pec-ad-bottom", "pec-ad-bottom");
    var bottom728 = ensureSlot("pec-ad-728-bottom", "pec-ad-desktop");
    var bottom320 = ensureSlot("pec-ad-320-bottom", "pec-ad-mobile");
    if (!bottom728.parentNode) bottomWrapper.appendChild(bottom728);
    if (!bottom320.parentNode) bottomWrapper.appendChild(bottom320);
    if (!bottomWrapper.parentNode) {
      if (footer) insertAfter(bottomWrapper, footer);
      else insertAtBodyEnd(bottomWrapper);
    }
  }

  window.PECAds = {
    initializeVisibleBannerAdsOnly: injectVisibleBannerAdsOnly,
    triggerAction: function() {}
  };

  if (!DENIED) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectVisibleBannerAdsOnly);
    } else {
      injectVisibleBannerAdsOnly();
    }
  }
})();
