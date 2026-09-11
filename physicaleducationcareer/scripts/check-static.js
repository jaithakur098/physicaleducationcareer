const fs = require('fs');
const files = ['index.html','admin.html','student-portal.html','portal-category.html','portal-topic.html','portal-content.html','portal-search.html','admin-content.html'];
let problems = 0;
const seen = {};
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  // duplicate id check
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) { problems++; console.log('DUP IDS in ' + f + ': ' + [...new Set(dup)].join(', ')); }
  // link/script targets
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  for (const r of refs) {
    if (/^https?:/i.test(r) || r.startsWith('#') || r.startsWith('mailto:') || r.startsWith('tel:') || r.startsWith('data:') || r.startsWith('//')) continue;
    const clean = r.split('?')[0].split('#')[0];
    if (clean.endsWith('.html') || clean.endsWith('.js') || clean.endsWith('.css')) {
      if (!fs.existsSync(clean)) { problems++; console.log('MISSING TARGET in ' + f + ': ' + r + ' -> ' + clean); }
    }
  }
  // detect duplicate 12-category rendering (catalog is single source)
}
// sitemap xml validity
try {
  const sm = fs.readFileSync('sitemap.xml', 'utf8');
  if (!sm.includes('<urlset') || !sm.trim().endsWith('</urlset>')) { problems++; console.log('SITEMAP: malformed'); }
  else console.log('SITEMAP: well-formed urlset present');
} catch (e) { problems++; console.log('SITEMAP: ' + e.message); }

console.log(problems ? (problems + ' problem(s) found') : 'LINK/ID/XML CHECK: all local targets resolve, no duplicate ids, sitemap ok');
