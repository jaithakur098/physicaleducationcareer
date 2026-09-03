/**
 * /js/site-ads.js — Centralized ad integration for physicaleducationcareer.in
 *
 * This single file contains ALL site ad codes and a denylist so that
 * admin / private / auth pages can never receive ads accidentally.
 *
 * Each public HTML page includes:  <script src="/js/site-ads.js"></script>
 *
 * On denied pages automatic banner/popunder injection is suppressed, but
 * the action-trigger API (window.PECAds.triggerAction) is still available
 * so that action-based ads can fire after login, download, etc.
 *
 * RESTRICTED AREAS (Student Portal + Live/Practice Tests + Coach Portal):
 *   These areas receive ONLY visible in-page banner ads.
 *   No popunder, no smartlink, no external redirect, no new tab/window.
 *   Action triggers on these pages show a visible banner ad instead of
 *   a popunder. Students and coaches always remain on physicaleducationcareer.in.
 */
(function () {
  "use strict";

  /* ================================================================
     1. DENYLIST — admin / private / auth / operator-only / tool pages
     ================================================================ */
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
    "tournament-coach.html",
    "tournament-draw-test.html",
    "tournament-preview-test.html",
    "certificate.html",
    "student-login.html",
    "student-register.html",
    "student-forgot.html",
    "student-attempt.html",
    "student-practice-attempt.html",
    "test.html",
    "class-selection.html",
    "yoga-day-quiz.html",
    "yoga-test.html",
    "404.html",
    "coming-soon.html",
    "googlee24decdc4d4a6ce9.html"
  ];

  function isDenied() {
    if (document.documentElement.hasAttribute("data-no-ads")) return true;
    if (document.body && document.body.hasAttribute("data-no-ads")) return true;

    for (var i = 0; i < DENY_FILES.length; i++) {
      if (FNAME === DENY_FILES[i]) return true;
    }

    if (PATH.indexOf("/config/") !== -1) return true;
    if (PATH.indexOf("/cert/") !== -1) return true;

    return false;
  }

  var DENIED = isDenied();

  /* ================================================================
     AD RESTRICTION POLICY
     Student Portal + Live/Practice Tests + Coach Portal = BANNERS ONLY
     No popunder, no smartlink, no external redirect, no new tab/window.
     ================================================================ */
  function isStudentPortal() {
    return FNAME.indexOf("student-") === 0;
  }

  function isExamArea() {
    /* Live test entry page + live exam attempt pages (already denied) */
    return FNAME === "live-test.html" ||
           FNAME === "student-attempt.html" ||
           FNAME === "student-practice-attempt.html";
  }

  function isCoachPortal() {
    /* 6th Alwar Cup Coach Portal */
    return FNAME === "tournament-coach.html";
  }

  var RESTRICTED = isStudentPortal() || isExamArea() || isCoachPortal();

  /* ================================================================
     2. AD CODES — exact values from provided codes
     ================================================================ */

  /* 1) Popunder */
  var POP_SRC = "https://pl31056701.profitableratecpmnetwork.com/26a3fcbbc72ff01eb703de7c3450ed15/invoke.js";
  var POP_CONTAINER_ID = "container-26a3fcbbc72ff01eb703de7c3450ed15";

  /* 2) 728x90 Desktop Banner */
  var BANNER_728 = {
    atOptions: { key: "b2c767bd72c48c41fbcc95d2cae4601b", format: "iframe", height: 90, width: 728, params: {} },
    src: "https://www.highrevenueformat.com/b2c767bd72c48c41fbcc95d2cae4601b/invoke.js"
  };

  /* 3) 320x50 Mobile Banner */
  var BANNER_320 = {
    atOptions: { key: "476b14cb868a858f021da25d83e22fcc", format: "iframe", height: 50, width: 320, params: {} },
    src: "https://www.highrevenueformat.com/476b14cb868a858f021da25d83e22fcc/invoke.js"
  };

  /* 4) 300x250 Banner */
  var BANNER_300 = {
    atOptions: { key: "ee866c73f37e6848b60b7bf340ccc93d", format: "iframe", height: 250, width: 300, params: {} },
    src: "https://www.highrevenueformat.com/ee866c73f37e6848b60b7bf340ccc93d/invoke.js"
  };

  /* 5) Additional script */
  var EXTRA_SRC = "https://pl31056698.profitableratecpmnetwork.com/5d/84/ce/5d84cee107dda3e3ba6404b5206d452c.js";

  /* ================================================================
     3. RESPONSIVE CSS — prevent horizontal overflow
     ================================================================ */
  var cssText = [
    ".pec-ad-slot{max-width:100%;overflow:hidden;margin:15px auto;text-align:center;clear:both;box-sizing:border-box}",
    ".pec-ad-slot iframe{max-width:100%;width:100%;border:0}",
    ".pec-ad-top{margin:10px auto}",
    ".pec-ad-middle{margin:30px auto}",
    ".pec-ad-desktop{display:block}",
    ".pec-ad-mobile{display:none}",
    "@media(max-width:768px){",
    ".pec-ad-desktop{display:none}",
    ".pec-ad-mobile{display:block}",
    "}"
  ].join("");

  var styleEl = document.createElement("style");
  styleEl.textContent = cssText;
  document.head.appendChild(styleEl);

  /* ================================================================
     4. DOM HELPERS
     ================================================================ */
  function createWrapper(className) {
    var div = document.createElement("div");
    div.className = "pec-ad-slot " + className;
    return div;
  }

  function insertAfter(newEl, refEl) {
    if (!refEl) return insertAtBodyStart(newEl);
    var parent = refEl.parentNode;
    if (!parent) return insertAtBodyStart(newEl);
    var next = refEl.nextSibling;
    if (next) { parent.insertBefore(newEl, next); }
    else { parent.appendChild(newEl); }
  }

  function insertBefore(newEl, refEl) {
    if (!refEl) return insertAtBodyEnd(newEl);
    var parent = refEl.parentNode;
    if (!parent) return insertAtBodyEnd(newEl);
    parent.insertBefore(newEl, refEl);
  }

  function insertAtBodyStart(el) {
    if (document.body) { document.body.insertBefore(el, document.body.firstChild); }
  }

  function insertAtBodyEnd(el) {
    if (document.body) { document.body.appendChild(el); }
  }

  function findHeader() {
    return document.querySelector("header, .edu-nav, .topbar, .t-top, .portal-hero, .hero, .brand");
  }

  function findFooter() {
    return document.querySelector("footer, .edu-foot");
  }

  /* ================================================================
     5. ACTION-BASED POPUNDER (always available, even on denied pages)
      ================================================================ */

  /* Deduplication map — each action fires at most once per page */
  var firedActions = {};

  function firePopunder() {
    var container = document.createElement("div");
    container.id = POP_CONTAINER_ID;
    var s = document.createElement("script");
    s.src = POP_SRC;
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    container.appendChild(s);
    insertAtBodyEnd(container);
  }

  function fireBanner() {
    /* Inject a visible 300x250 banner ad in-page (for RESTRICTED pages). */
    var wrapper = createWrapper("pec-ad-action");
    wrapper.style.margin = "20px auto";
    wrapper.style.padding = "10px 0";
    wrapper.style.borderTop = "1px dashed rgba(255,255,255,0.1)";
    wrapper.style.borderBottom = "1px dashed rgba(255,255,255,0.1)";
    window.atOptions = BANNER_300.atOptions;
    var s = document.createElement("script");
    s.src = BANNER_300.src;
    s.async = false;
    wrapper.appendChild(s);
    insertAtBodyEnd(wrapper);
  }

  function triggerActionAd(actionName) {
    if (!actionName) return;
    if (firedActions[actionName]) return;
    firedActions[actionName] = true;

    if (RESTRICTED) {
      /* Student Portal / Exam / Coach Portal: show visible banner, never popunder */
      fireBanner();
    } else {
      /* Public site: fire popunder */
      firePopunder();
    }
  }

  /* ================================================================
     6. BANNER AD INJECTION (suppressed on denied pages)
      ================================================================ */
  function loadBannerAdsSequential(topDesktop, topMobile, middle) {
    /* Sequential loader for atOptions-based banners.
       Must set window.atOptions before each invoke.js loads. */
    var ads = [
      { atOptions: BANNER_300.atOptions, src: BANNER_300.src, container: middle },
      { atOptions: BANNER_728.atOptions, src: BANNER_728.src, container: topDesktop },
      { atOptions: BANNER_320.atOptions, src: BANNER_320.src, container: topMobile }
    ];

    function loadNext(idx) {
      if (idx >= ads.length) {
        /* All banners done — load the additional script
           RESTRICTED (Student Portal / Exam / Coach Portal): NOT loaded */
        if (!RESTRICTED) {
          var extra = document.createElement("script");
          extra.src = EXTRA_SRC;
          document.body.appendChild(extra);
        }
        return;
      }
      var ad = ads[idx];
      window.atOptions = ad.atOptions;
      var s = document.createElement("script");
      s.src = ad.src;
      s.async = false;
      s.onload = function () { loadNext(idx + 1); };
      s.onerror = function () { loadNext(idx + 1); };
      ad.container.appendChild(s);
    }

    loadNext(0);
  }

  function injectAds() {
    var header = findHeader();
    var footer = findFooter();

    /* Top banner container: 728x90 (desktop) + 320x50 (mobile) */
    var topWrapper = createWrapper("pec-ad-top");
    var desktop728 = createWrapper("pec-ad-desktop");
    var mobile320 = createWrapper("pec-ad-mobile");
    topWrapper.appendChild(desktop728);
    topWrapper.appendChild(mobile320);

    if (header) {
      insertAfter(topWrapper, header);
    } else {
      insertAtBodyStart(topWrapper);
    }

    /* Middle banner container: 300x250 (both desktop + mobile) */
    var middleWrapper = createWrapper("pec-ad-middle");
    if (footer) {
      insertBefore(middleWrapper, footer);
    } else {
      insertAtBodyEnd(middleWrapper);
    }

    /* Popunder: container + async script (exact attributes)
       RESTRICTED (Student Portal / Exam / Coach Portal): NEVER injected */
    if (!RESTRICTED) {
      var popWrapper = createWrapper("pec-popunder");
      var popContainer = document.createElement("div");
      popContainer.id = POP_CONTAINER_ID;
      var popScript = document.createElement("script");
      popScript.async = true;
      popScript.setAttribute("data-cfasync", "false");
      popScript.src = POP_SRC;
      popWrapper.appendChild(popContainer);
      popWrapper.appendChild(popScript);
      insertAtBodyEnd(popWrapper);
    }

    /* Banner ads (sequential due to shared atOptions global) */
    loadBannerAdsSequential(desktop728, mobile320, middleWrapper);
  }

  /* ================================================================
     7. BOOTSTRAP — expose API, then inject banners if not denied
     ================================================================ */
  window.PECAds = { triggerAction: triggerActionAd };

  if (!DENIED) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectAds);
    } else {
      injectAds();
    }
  }
})();
