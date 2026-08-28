/* Site ad injector — contains the exact publisher ad codes supplied by the site owner.
   Loaded only on NON-admin pages. Admin pages never include this file.
   Placement is additive (inserts ad nodes); it does not modify page logic,
   Firebase/auth, test scoring, navigation or any existing functionality. */
(function () {
  'use strict';
  if (window.__siteAdsLoaded) return;
  window.__siteAdsLoaded = true;

  function place(node, host) {
    host = host || (document.body || document.head);
    host.appendChild(node);
  }
  function srcScript(url, attrs) {
    var s = document.createElement('script');
    s.src = url;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    return s;
  }
  function textScript(txt) {
    var s = document.createElement('script');
    s.textContent = txt;
    return s;
  }
  function box(cls) {
    var d = document.createElement('div');
    d.className = 'site-ad ' + cls;
    d.style.cssText = 'text-align:center;margin:16px 0;max-width:100%;overflow:hidden;';
    return d;
  }

  /* ----- Exact ad codes (verbatim) ----- */
  function ad1() { // popunder / native
    place(srcScript('https://pl31056699.profitableratecpmnetwork.com/69/5a/da/695ada49c89d1a0d8bf1fe58021024f7.js'));
  }
  function ad2(host) { // native container
    var wrap = box('site-ad-native');
    var c = document.createElement('div');
    c.id = 'container-26a3fcbbc72ff01eb703de7c3450ed15';
    wrap.appendChild(c);
    host.appendChild(wrap);
    place(srcScript('https://pl31056701.profitableratecpmnetwork.com/26a3fcbbc72ff01eb703de7c3450ed15/invoke.js', { 'async': 'async', 'data-cfasync': 'false' }));
  }
  function ad3(host) { // 728x90
    var wrap = box('site-ad-banner');
    host.appendChild(wrap);
    wrap.appendChild(textScript("atOptions = {\n    'key' : 'b2c767bd72c48c41fbcc95d2cae4601b',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };"));
    wrap.appendChild(srcScript('https://www.highrevenueformat.com/b2c767bd72c48c41fbcc95d2cae4601b/invoke.js'));
  }
  function ad4(host) { // 320x50
    var wrap = box('site-ad-banner');
    host.appendChild(wrap);
    wrap.appendChild(textScript("atOptions = {\n    'key' : '476b14cb868a858f021da25d83e22fcc',\n    'format' : 'iframe',\n    'height' : 50,\n    'width' : 320,\n    'params' : {}\n  };"));
    wrap.appendChild(srcScript('https://www.highrevenueformat.com/476b14cb868a858f021da25d83e22fcc/invoke.js'));
  }
  function ad5(host) { // 300x250
    var wrap = box('site-ad-rect');
    host.appendChild(wrap);
    wrap.appendChild(textScript("atOptions = {\n    'key' : 'ee866c73f37e6848b60b7bf340ccc93d',\n    'format' : 'iframe',\n    'height' : 250,\n    'width' : 300,\n    'params' : {}\n  };"));
    wrap.appendChild(srcScript('https://www.highrevenueformat.com/ee866c73f37e6848b60b7bf340ccc93d/invoke.js'));
  }

  function run() {
    try {
      // AD1 — global native/popunder (once)
      ad1();

      var qwrap = document.getElementById('qwrap');
      if (qwrap) {
        // Student test / practice page: insert an ad BETWEEN questions.
        function seed() {
          var qs = qwrap.querySelectorAll('.q');
          for (var i = 0; i < qs.length; i++) {
            var q = qs[i];
            if (q.getAttribute('data-ad-done')) continue;
            q.setAttribute('data-ad-done', '1');
            var ad = document.createElement('div');
            ad.className = 'site-ad site-ad-between';
            ad.style.cssText = 'text-align:center;margin:14px 0;max-width:100%;overflow:hidden;';
            q.parentNode.insertBefore(ad, q.nextSibling);
            ad5(ad);
          }
        }
        seed();
        if (window.MutationObserver) {
          var obs = new MutationObserver(seed);
          obs.observe(qwrap, { childList: true, subtree: true });
        }
        return;
      }

      // Content / public / student (non-test) page.
      var main = document.querySelector('#main, main, article, .content, .container, .edu-wrap, .gov-section, .block, .edu-content');
      if (!main) return;

      // Top banner (728x90)
      ad3(main);
      // Native mid
      var blocks = main.children;
      var idx = Math.max(1, Math.floor(blocks.length / 2));
      ad2(main);
      if (blocks[idx]) main.insertBefore(main.querySelector('.site-ad-native'), blocks[idx]);
      // Sidebar rectangle
      var side = document.querySelector('aside, .sidebar, #sidebar');
      if (side) ad5(side);
      // Bottom banner (320x50)
      ad4(main);
      // Long-page extra rectangle after ~6 blocks
      if (blocks.length > 12 && blocks[6]) {
        var extra = box('site-ad-rect');
        main.insertBefore(extra, blocks[6]);
        ad5(extra);
      }
    } catch (e) {
      /* ad placement must never break the page */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
