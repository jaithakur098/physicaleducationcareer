/* Site ad injector — contains the exact publisher ad codes supplied by the site owner.
   Loaded only on NON-admin pages. Admin pages never include this file.

   IMPORTANT (root-cause fix):
   The ad-network scripts (highrevenueformat / profitableratecpmnetwork) call
   document.write(). If injected directly into the already-loaded page, that
   document.write() implicitly runs document.open() and ERASES the parent page
   (white/blank screen). To guarantee "page renders first, ads load second",
   every ad is rendered inside its OWN sandboxed <iframe> (srcdoc). Any
   document.write() then only touches the throwaway iframe, never index.html
   or any other page. The page can therefore never be blanked by an ad script.

   Placement is additive (inserts ad nodes); it does not modify page logic,
   Firebase/auth, test scoring, navigation or any existing functionality. */
(function () {
  'use strict';
  if (window.__siteAdsLoaded) return;
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

  /* Render an ad inside an isolated, sandboxed iframe so it can NEVER touch
     or blank the parent document. */
  function isolatedAd(adHtml, height) {
    var frame = document.createElement('iframe');
    frame.setAttribute('title', 'Advertisement');
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('loading', 'lazy');
    /* No allow-same-origin: the iframe cannot read or modify the parent. */
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

  /* ----- Exact ad codes (verbatim, supplied by owner) ----- */
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

  function run() {
    if (isAdminPage()) return;
    try {
      /* AD1 — global native/popunder. Kept off-screen; isolated iframe. */
      var ad1host = document.createElement('div');
      ad1host.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
      (document.body || document.documentElement).appendChild(ad1host);
      mount(ad1host, AD1, 1);
    } catch (e) {}

    /* Student test / practice page: insert an ad BETWEEN questions (AD5). */
    var qwrap = document.getElementById('qwrap');
    if (qwrap) {
      try {
        function seed() {
          var qs = qwrap.querySelectorAll('.q');
          for (var i = 0; i < qs.length; i++) {
            var q = qs[i];
            if (q.getAttribute('data-ad-done')) continue;
            q.setAttribute('data-ad-done', '1');
            var ad = makeBox('site-ad-between', 'text-align:center;margin:14px 0;max-width:100%;overflow:hidden;');
            q.parentNode.insertBefore(ad, q.nextSibling);
            mount(ad, AD5, 250);
          }
        }
        seed();
        if (window.MutationObserver) {
          var obs = new MutationObserver(function () { setTimeout(seed, 0); });
          obs.observe(qwrap, { childList: true, subtree: true });
        }
      } catch (e) {}
      return;
    }

    /* Content / public / student (non-test) page. */
    var main = document.querySelector('#main, main, article, .content, .container, .edu-wrap, .gov-section, .block, .edu-content');
    if (!main) return;
    try { main.insertBefore(makeBox('site-ad-top', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:90px;'), main.firstChild); } catch (e) {}
    var topBox = main.querySelector('.site-ad-top'); if (topBox) mount(topBox, AD3, 90);

    try {
      var midBox = makeBox('site-ad-native', 'text-align:center;margin:14px auto;max-width:100%;overflow:hidden;min-height:280px;');
      main.appendChild(midBox);
      var blocks = main.children;
      var idx = Math.max(1, Math.floor(blocks.length / 2));
      if (blocks[idx]) main.insertBefore(midBox, blocks[idx]); else main.appendChild(midBox);
      mount(midBox, AD2, 280);
    } catch (e) {}

    var side = document.querySelector('aside, .sidebar, #sidebar');
    if (side) { try { var sb = makeBox('site-ad-rect', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:250px;'); side.appendChild(sb); mount(sb, AD5, 250); } catch (e) {} }

    try { var botBox = makeBox('site-ad-bottom', 'text-align:center;margin:10px auto;max-width:100%;overflow:hidden;min-height:50px;'); main.appendChild(botBox); mount(botBox, AD4, 50); } catch (e) {}

    try {
      var ch = main.children;
      if (ch.length > 12 && ch[6]) { var extra = makeBox('site-ad-rect', 'text-align:center;margin:14px auto;max-width:100%;overflow:hidden;min-height:250px;'); main.insertBefore(extra, ch[6]); mount(extra, AD5, 250); }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
