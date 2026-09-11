const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = process.cwd();
const PORT = 8088;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.xml':'application/xml', '.txt':'text/plain' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'text/plain' });
  fs.createReadStream(fp).pipe(res);
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const base = 'http://localhost:' + PORT + '/';

  const pages = [
    'index.html',
    'student-portal.html',
    'portal-category.html?cat=govt-jobs',
    'portal-topic.html?cat=govt-jobs&topic=ssc-jobs',
    'portal-content.html?slug=ssc-cgl-2026',
    'portal-search.html',
    'admin-content.html',
    'govt-jobs.html',
    'admissions.html',
    'cbse.html',
    'old-pyq.html',
    'live-test.html',
    'live-tests.html',
    'downloads.html',
    'about.html',
    'contact.html'
  ];

  const results = [];
  for (const pg of pages) {
    const page = await browser.newPage();
    const errors = [], perms = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    try {
      await page.goto(base + pg, { waitUntil: 'load', timeout: 20000 });
    } catch (e) { errors.push('GOTO: ' + e.message); }
    await sleep(1800); // allow Firebase/CDN + render
    const info = await page.evaluate(() => {
      return {
        bodyLen: (document.body && document.body.innerText || '').trim().length,
        h1: (document.querySelector('h1')||{}).innerText || '',
        url: location.href,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        catCards: document.querySelectorAll('#catGrid .cat-card, #portalHomeGrid .course-card').length,
        topicCards: document.querySelectorAll('#topicGrid .topic-card').length
      };
    });
    const realErrors = errors.filter(t => !/favicon|net::ERR|Failed to load resource|gstatic|googleapis|firebase|Firebase|ERR_|Download the React/i.test(t));
    const permissionErr = errors.filter(t => /permission|Missing or insufficient|permission-denied/i.test(t));
    results.push({ pg, info, realErrors, permissionErr, blank: info.bodyLen < 120 });
    await page.close();
  }

  // responsive overflow checks on homepage
  const resp = await browser.newPage();
  const overflow = {};
  for (const vp of [{w:390,h:844,n:'mobile'},{w:1280,h:900,n:'desktop'}]) {
    await resp.setViewport({ width: vp.w, height: vp.h });
    await resp.goto(base + 'index.html', { waitUntil: 'load' });
    await sleep(1200);
    const o = await resp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    overflow[vp.n] = o;
  }
  // click-through: student-portal -> first category card
  await resp.setViewport({ width: 1280, height: 900 });
  await resp.goto(base + 'student-portal.html', { waitUntil: 'load' });
  await sleep(1200);
  let navOK = false;
  try {
    await resp.click('#catGrid .cat-card');
    await sleep(800);
    navOK = /portal-category\.html/.test(resp.url());
  } catch(e) { navOK = 'ERR:' + e.message; }
  await resp.close();

  await browser.close();
  server.close();

  // ---- report ----
  let fails = 0;
  for (const r of results) {
    const status = (r.blank ? 'BLANK' : (r.realErrors.length ? 'JS-ERR' : 'OK'));
    if (r.blank || r.realErrors.length) fails++;
    console.log(`[${status}] ${r.pg}  bodyLen=${r.info.bodyLen} catCards=${r.info.catCards} topicCards=${r.info.topicCards} url=${r.info.url.split('/').pop()}`);
    if (r.realErrors.length) r.realErrors.slice(0,3).forEach(e => console.log('     JS-ERR: ' + e.slice(0,160)));
    if (r.permissionErr.length) r.permissionErr.forEach(e => console.log('     FIREBASE-PERM: ' + e.slice(0,160)));
  }
  console.log('\nRESPONSIVE overflow (px, 0 = none): mobile=' + overflow.mobile + ' desktop=' + overflow.desktop);
  console.log('NAV click student-portal -> category: ' + navOK);
  console.log('PAGES WITH ISSUES: ' + fails);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
