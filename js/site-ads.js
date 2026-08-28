/* Site ad injector — contains the exact publisher ad codes supplied by the site owner.
   Loaded only on NON-admin pages. Admin pages never include this file.

   SAFETY MODEL (must never blank/break the page):
   - Every ad is rendered inside its OWN sandboxed <iframe> (srcdoc). Ad-network
     scripts that call document.write() can therefore only touch the throwaway
     iframe, never the parent document.
   - All injection is wrapped in try/catch and is additive (inserts ad nodes only).
   - Runs after the DOM is available; fails silently if a network/script fails.
   - No parent-level document.write / document.open / body replacement.

   PLACEMENT (granular, content-aware):
   - Public content pages: top 728x90, mid native, bottom 320x50, sidebar 300x250,
     plus an in-content 300x250 (or native) after ~every 6 meaningful blocks,
     skipping headings/buttons/forms/tables/nav/code/question text/notices.
   - Govt Job detail pages: same, plus an ad before the final Apply/Notification/
     Result section (buttons stay visible & clickable).
   - Test / Live-test pages: 300x250 between each question (siblings only; question
     text/options/timer/answers/scoring/navigation untouched) + banner above/below.
*/
(function () {
  'use strict';
  if (window.__siteAdsLoaded) return;          // avoid re-init / duplicate ads
  window.__siteAdsLoaded = true;

  /* Admin pages must stay 100% ad-free. */
  function isAdminPage() {
    try {
      var f = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      return /(^|[-_])admin/.test(f) ||
        f === 'certificate-verify.html' ||
        f === 'student-review.html' ||
        f === 'live-test-admin.html' ||
        f === 'practice-test-admin.html' ||
        f === 'tournament-admin.html' ||
        f === 'admin-login.html' ||
        f === 'admin-students.html' ||
        f === 'admin.html';
    } catch (e) { return false; }
  }

  /* Render an ad inside an isolated, sandboxed iframe so it can NEVER touch or
     blank the parent document. */
  function isolatedAd(adHtml, height) {
    var frame = document.createElement('iframe');
    frame.setAttribute('title', 'Advertisement');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('loading', 'lazy');
    frame.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
    frame.style.cssText = 'border:0;width:100%;max-width:100%;display:block;overflow:hidden;';
    frame.style.height = (height || 0) + 'px';
    var doc = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<style>html,body{margin:0;padding:0;background:transparent;}' +
      'a,img,iframe{max-width:100%;}</style></head><body>' +
      adHtml + '</body></html>';
    frame.srcdoc = doc;
    return frame;
  }

  function mount(host, adHtml, height) {
    if (!host) return;
    try {
      host.innerHTML = '';
      host.appendChild(isolatedAd(adHtml, height));
    } catch (e) { /* ad failure must never break the page */ }
  }

  function makeBox(cls, css) {
    var d = document.createElement('div');
    d.className = 'site-ad ' + cls;
    d.style.cssText = (css || 'text-align:center;margin:16px 0;max-width:100%;overflow:hidden;');
    return d;
  }

  // The first <section> that is NOT inside <header> — i.e. real page content.
  function firstContentSection() {
    var secs = document.querySelectorAll('section');
    for (var i = 0; i < secs.length; i++) {
      if (!secs[i].closest || !secs[i].closest('header')) return secs[i];
    }
    return null;
  }
  // Main readable container for in-content ads. Never the header/nav.
  function pickContainer() {
    var el = document.querySelector('main, #main, article, .content, .edu-wrap, .gov-detail, .article, .post, .detail, .block');
    if (el && !(el.closest && el.closest('header, nav'))) return el;
    var sec = firstContentSection();
    if (sec) return sec.querySelector('.container') || sec;
    return document.body;
  }

  /* ---------- Exact ad codes (verbatim, supplied by owner) ---------- */
  var AD1 = '<script src="https://pl31056699.profitableratecpmnetwork.com/69/5a/da/695ada49c89d1a0d8bf1fe58021024f7.js"><\/script>';

  var AD2 = '<script async="async" data-cfasync="false" src="https://pl31056701.profitableratecpmnetwork.com/26a3fcbbc72ff01eb703de7c3450ed15/invoke.js"><\/script>' +
    '<div id="container-26a3fcbbc72ff01eb703de7c3450ed15"><\/div>';

  var AD3 = '<script type="text/javascript">' +
    "atOptions = {'key' : 'b2c767bd72c48c41fbcc95d2cae4601b','format' : 'iframe','height' : 90,'width' : 728,'params' : {}};" +
    "document.write('<scr' + 'ipt type=\"text/javascript\" src=\"https://www.highrevenueformat.com/b2c767bd72c48c41fbcc95d2cae4601b/invoke.js\"></scr' + 'ipt>');" +
    '<\/script>';

  var AD4 = '<script type="text/javascript">' +
    "atOptions = {'key' : '476b14cb868a858f021da25d83e22fcc','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};" +
    "document.write('<scr' + 'ipt type=\"text/javascript\" src=\"https://www.highrevenueformat.com/476b14cb868a858f021da25d83e22fcc/invoke.js\"></scr' + 'ipt>');" +
    '<\/script>';

  var AD5 = '<script type="text/javascript">' +
    "atOptions = {'key' : 'ee866c73f37e6848b60b7bf340ccc93d','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};" +
    "document.write('<scr' + 'ipt type=\"text/javascript\" src=\"https://www.highrevenueformat.com/ee866c73f37e6848b60b7bf340ccc93d/invoke.js\"></scr' + 'ipt>');" +
    '<\/script>';

  /* ---------- helpers for safe in-content placement ---------- */
  var UNSAFE = 'H1,H2,H3,H4,H5,H6,BUTTON,FORM,NAV,TABLE,PRE,CODE,SCRIPT,STYLE,.notice,.alert,.test-selector,.q,.question,.navbar,.menu,.site-header,.site-footer';
  function isUnsafe(el) {
    if (!el) return true;
    if (el.closest && el.closest(UNSAFE)) return true;
    if (el.matches && el.matches(UNSAFE)) return true;
    return false;
  }
  function isMeaningful(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest && el.closest('#testSelector')) return false; // hidden overlay
    if (el.closest && el.closest('.site-header,header,nav')) return false;
    var t = el.tagName;
    if (/^(P|DIV|SECTION|ARTICLE|UL|OL|FIGURE|LI|BLOCKQUOTE)$/.test(t)) {
      var txt = (el.textContent || '').trim();
      return txt.length > 30 || el.querySelector('img,figure') !== null;
    }
    return false;
  }

  function insertContentAds(main, isDetail) {
    if (!main) return;
    var blocks = [].slice.call(main.children).filter(isMeaningful);
    var step = 6, placed = 0, max = 10;
    for (var i = step - 1; i < blocks.length && placed < max; i += step) {
      var anchor = blocks[i];
      if (!anchor || isUnsafe(anchor) || anchor.getAttribute('data-ad-after')) continue;
      anchor.setAttribute('data-ad-after', '1');
      var ad = makeBox('site-ad-incontent', 'text-align:center;margin:16px auto;max-width:100%;overflow:hidden;min-height:' + (placed % 2 === 0 ? 280 : 250) + 'px;');
      if (anchor.nextSibling) main.insertBefore(ad, anchor.nextSibling); else main.appendChild(ad);
      mount(ad, (placed % 2 === 0) ? AD2 : AD5, (placed % 2 === 0) ? 280 : 250);
      placed++;
    }
    // Govt Job detail: ad right before the final Apply/Notification/Result CTA.
    if (isDetail) {
      var ctaEls = [].slice.call(main.querySelectorAll('a,button')).filter(function (a) {
        return /apply|notification|admit|result|registration|eligibility/i.test((a.textContent || '').toLowerCase());
      });
      if (ctaEls.length) {
        var target = ctaEls[ctaEls.length - 1];
        if (target.getAttribute('data-ad-before')) return;
        target.setAttribute('data-ad-before', '1');
        var cad = makeBox('site-ad-cta', 'text-align:center;margin:16px auto;max-width:100%;overflow:hidden;min-height:250px;');
        if (target.parentNode) target.parentNode.insertBefore(cad, target);
        mount(cad, AD5, 250);
      }
    }
  }

  /* ---------- test / live-test pages: between-question ads ----------
     Two layouts exist:
       multi  : several question blocks in the DOM at once (#qwrap>.q, .question)
       single : one question rendered at a time (#qWrap with #qText/#qOptions)
     In BOTH cases ads are inserted as siblings only — never inside the
     question text / options / timer / nav containers. */
  function detectTestContainer() {
    var qs = document.querySelectorAll('#qwrap .q, .qwrap .q, .question, [data-question]');
    if (qs.length >= 2) {
      var f = qs[0];
      var c = f.closest ? f.closest('#qwrap, .qwrap') : null;
      return { el: c || f.parentNode, mode: 'multi' };
    }
    var q = document.getElementById('qText') || document.getElementById('qOptions') ||
      document.querySelector('#qWrap, .q-wrap');
    if (q) {
      var panel = (q.id === 'qText' || q.id === 'qOptions')
        ? (q.closest ? q.closest('#qWrap, .q-wrap') : null) || q.parentElement
        : q;
      return { el: panel, mode: 'single' };
    }
    return null;
  }

  function seedQuestions(qc) {
    var qs = qc.querySelectorAll('.q, .question, [data-question]');
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i];
      if (q.getAttribute('data-ad-done')) continue;
      q.setAttribute('data-ad-done', '1');
      var ad = makeBox('site-ad-between', 'text-align:center;margin:14px 0;max-width:100%;overflow:hidden;min-height:250px;');
      if (q.nextSibling) q.parentNode.insertBefore(ad, q.nextSibling); else q.parentNode.appendChild(ad);
      mount(ad, AD5, 250); // 300x250 between questions
    }
  }

  function handleTestPage(qc, mode) {
    if (mode === 'multi') {
      seedQuestions(qc);
      if (window.MutationObserver) {
        var obs = new MutationObserver(function () { setTimeout(function () { seedQuestions(qc); }, 0); });
        obs.observe(qc, { childList: true, subtree: true });
      }
    } else {
      // single-question: one persistent 300x250 placed AFTER the question panel
      // (a sibling, never inside question text / options / timer / nav).
      if (!qc.getAttribute('data-ad-qwrap-done')) {
        qc.setAttribute('data-ad-qwrap-done', '1');
        var ad = makeBox('site-ad-between', 'text-align:center;margin:12px auto;max-width:100%;overflow:hidden;min-height:250px;');
        if (qc.parentNode) qc.parentNode.insertBefore(ad, qc.nextSibling); else qc.appendChild(ad);
        mount(ad, AD5, 250);
      }
    }
  }

  /* ---------- main entry ---------- */
  function run() {
    if (isAdminPage()) return;

    /* AD1 — global native/popunder. One off-screen, sandboxed iframe per page
       (no aggressive repeated popups). */
    try {
      var ad1host = document.createElement('div');
      ad1host.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
      (document.body || document.documentElement).appendChild(ad1host);
      mount(ad1host, AD1, 1);
    } catch (e) {}

    var tc = detectTestContainer();
    var isTest = !!(tc && tc.el);

    var main = pickContainer();

    var isDetail = /govt-job-detail/i.test(location.pathname + location.search) ||
      !!(main && main.querySelector && main.querySelector('.govt-detail'));

    /* Fixed, always-visible banner placements. Anchored to <header>/<footer>
       (and the first content section) so they can never end up hidden inside the
       nav. Every ad is still an isolated, sandboxed <iframe>. */
    var header = document.querySelector('header');
    var footer = document.querySelector('footer, .site-footer, #footer');
    var firstSec = firstContentSection();

    try {
      var topBox = makeBox('site-ad-top', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:90px;');
      if (header) header.insertAdjacentElement('afterend', topBox); else document.body.insertBefore(topBox, document.body.firstChild);
      mount(topBox, AD3, 90);
    } catch (e) {}

    try {
      var midBox = makeBox('site-ad-native', 'text-align:center;margin:14px auto;max-width:100%;overflow:hidden;min-height:280px;');
      if (firstSec) firstSec.insertAdjacentElement('afterend', midBox); else document.body.appendChild(midBox);
      mount(midBox, AD2, 280);
    } catch (e) {}

    var side = document.querySelector('aside, .sidebar, #sidebar');
    if (side) { try { var sb = makeBox('site-ad-rect', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:250px;'); side.appendChild(sb); mount(sb, AD5, 250); } catch (e) {} }

    try {
      var botBox = makeBox('site-ad-bottom', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:50px;');
      if (footer) footer.insertAdjacentElement('beforebegin', botBox); else document.body.appendChild(botBox);
      mount(botBox, AD4, 50);
    } catch (e) {}

    /* Between-question ads on test/live pages; in-content ads on other pages */
    if (isTest) {
      handleTestPage(tc.el, tc.mode);
    } else if (main) {
      insertContentAds(main, isDetail);
      setTimeout(function () { insertContentAds(main, isDetail); }, 800);
      setTimeout(function () { insertContentAds(main, isDetail); }, 2000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
