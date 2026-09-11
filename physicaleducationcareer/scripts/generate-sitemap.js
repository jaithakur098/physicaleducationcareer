const fs = require('fs');

// Mock browser globals needed by catalog/data
global.window = global;
global.PORTAL_CATALOG = { SITE: 'https://physicaleducationcareer.in' };

// Load required files
eval(fs.readFileSync('config/portal-catalog.js', 'utf8'));
eval(fs.readFileSync('config/portal-seed.js', 'utf8'));

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

// Add Categories & Topics
PORTAL_CATALOG.CATEGORIES.forEach(c => {
  lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.categoryUrl(c.id)) + '</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>');
  c.topics.forEach(t => {
    lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.topicUrl(c.id, t.id)) + '</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>');
  });
});

// Add Articles from Seed
PORTAL_SEED.forEach(it => {
  if (it.slug) {
    const lm = it.lastUpdated || it.publishDate || '';
    lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.contentUrl(it.slug)) + '</loc>' + (lm ? '<lastmod>' + escXml(lm) + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.6</priority></url>');
  }
});
lines.push('</urlset>');

fs.writeFileSync('portal-content-sitemap.xml', lines.join('\n'));
console.log('Sitemap generated with ' + (PORTAL_SEED.length + 12 + PORTAL_CATALOG.CATEGORIES.reduce((acc, c) => acc + c.topics.length, 0)) + ' URLs');
