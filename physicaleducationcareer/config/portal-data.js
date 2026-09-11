/* ============================================================================
   STUDENT INFORMATION PORTAL — DATA LAYER (Firebase Firestore, compat SDK)
   ----------------------------------------------------------------------------
   Collection: portal_content
     { id, slug, type, category, topic, title, shortDescription, fullContent,
       featuredImage, thumbnail, officialUrl, applyUrl, resultUrl, admitUrl,
       downloadUrl, publishDate, lastUpdated, status, featured, seoTitle,
       metaDescription, keywords, createdAt, updatedAt,
       + type-specific fields (org, postName, vacancies, qualification, ageLimit,
         fee, importantDates{}, selection, salary, howToApply[], faq[{q,a}],
         exam, resultDate, howToCheck, officialResultLink, releaseDate,
         howToDownload, officialDownloadLink, instructions, author) }

    Public read rule required in Firestore (see firestore-rules-portal-additions.txt):
      match /portal_content/{id} { allow read: if resource.data.status == 'published'
        || (request.auth != null && exists(/databases/$(db)/documents/admins/$(request.auth.uid))); }
    Admin writes (authenticated admin): allow write via existing admin rule set.

   On every publish/unpublish/delete we refresh a sitemap cache document
   (portal_meta/sitemap) so the sitemap can be regenerated automatically.
   ============================================================================ */
(function (root) {
  'use strict';

  if (typeof firebase === 'undefined' || !firebase.firestore) {
    console.error('[portal-data] Firebase/Firestore not loaded. Load firebase-init.js first.');
    return;
  }
  var db = firebase.firestore();
  var serverTs = function () { return firebase.firestore.FieldValue.serverTimestamp(); };

  function clean(obj) {
    var out = {};
    Object.keys(obj).forEach(function (k) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') out[k] = obj[k];
    });
    return out;
  }

  async function ensureUniqueSlug(base, excludeId) {
    var slug = PORTAL_CATALOG.slugify(base) || 'content';
    var n = 1;
    while (true) {
      var snap = await db.collection('portal_content').where('slug', '==', slug).limit(1).get();
      var clash = false;
      snap.forEach(function (d) { if (d.id !== excludeId) clash = true; });
      if (!clash) return slug;
      n++;
      slug = PORTAL_CATALOG.slugify(base) + '-' + n;
    }
  }

  function toItem(d) { return Object.assign({ id: d.id }, d.data()); }

  var PortalData = {
    db: db,

    /* ---------- CREATE / UPDATE / DELETE ---------- */
    async createContent(data) {
      var slug = await ensureUniqueSlug(data.title || 'content');
      var doc = clean(Object.assign({
        slug: slug,
        status: data.status || 'draft',
        featured: !!data.featured,
        createdAt: serverTs(),
        updatedAt: serverTs()
      }, data));
      var ref = await db.collection('portal_content').add(doc);
      await this.refreshSitemapCache();
      return ref.id;
    },

    async updateContent(id, data) {
      var payload = clean(Object.assign({ updatedAt: serverTs() }, data));
      if (data.title && !data.slug) {
        payload.slug = await ensureUniqueSlug(data.title, id);
      }
      await db.collection('portal_content').doc(id).set(payload, { merge: true });
      await this.refreshSitemapCache();
      return id;
    },

    async deleteContent(id) {
      await db.collection('portal_content').doc(id).delete();
      await this.refreshSitemapCache();
    },

    async duplicateContent(id) {
      var snap = await db.collection('portal_content').doc(id).get();
      if (!snap.exists) throw new Error('Content not found');
      var d = snap.data();
      delete d.createdAt; delete d.updatedAt;
      d.title = (d.title || 'Content') + ' (Copy)';
      d.status = 'draft';
      return await this.createContent(d);
    },

    async setStatus(id, status) {
      await db.collection('portal_content').doc(id).set(
        { status: status, updatedAt: serverTs() }, { merge: true }
      );
      await this.refreshSitemapCache();
    },

    /* ---------- READ (public) ---------- */
    async listAll() {
      var snap = await db.collection('portal_content').orderBy('updatedAt', 'desc').get();
      return snap.docs.map(toItem);
    },
    async listPublished() {
      var snap = await db.collection('portal_content').where('status', '==', 'published').get();
      return snap.docs.map(toItem).sort(function (a, b) {
        var ax = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        var bx = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return bx - ax;
      });
    },
    async listByCategory(catId) {
      var snap = await db.collection('portal_content').where('category', '==', catId).get();
      return snap.docs.map(toItem).filter(function (it) { return it.status === 'published'; });
    },
    async listByTopic(catId, topicId) {
      var snap = await db.collection('portal_content').where('category', '==', catId).get();
      return snap.docs.map(toItem)
        .filter(function (it) { return it.topic === topicId && it.status === 'published'; })
        .sort(function (a, b) {
          var ax = a.publishDate ? new Date(a.publishDate).getTime() : 0;
          var bx = b.publishDate ? new Date(b.publishDate).getTime() : 0;
          return bx - ax;
        });
    },
    async getBySlug(slug) {
      var snap = await db.collection('portal_content').where('slug', '==', slug).limit(1).get();
      if (snap.empty) return null;
      return toItem(snap.docs[0]);
    },
    async getById(id) {
      var snap = await db.collection('portal_content').doc(id).get();
      return snap.exists ? toItem(snap) : null;
    },

    /* ---------- SEARCH / FILTER (public) ---------- */
    async search(opts) {
      opts = opts || {};
      var all = await this.listPublished();
      var q = (opts.q || '').trim().toLowerCase();
      return all.filter(function (it) {
        if (opts.category && it.category !== opts.category) return false;
        if (opts.topic && it.topic !== opts.topic) return false;
        if (opts.type && it.type !== opts.type) return false;
        if (opts.featured && !it.featured) return false;
        if (q) {
          var hay = [
            it.title, it.shortDescription, it.fullContent, it.keywords,
            PORTAL_CATALOG.getCategoryName(it.category),
            PORTAL_CATALOG.getTopicName(it.category, it.topic)
          ].join(' ').toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    },

    /* ---------- TOPIC / CATEGORY HELPERS ---------- */
    getCustomTopics: async function(catId) {
      var snap = await db.collection('portal_topics').where('category', '==', catId).get();
      return snap.docs.map(toItem);
    },
    getAllCustomTopics: async function() {
      var snap = await db.collection('portal_topics').get();
      return snap.docs.map(toItem);
    },
    getCatMeta: async function(catId) {
      var snap = await db.collection('portal_categories').doc(catId).get();
      return snap.exists ? snap.data() : null;
    },
    getAllCatMeta: async function() {
      var snap = await db.collection('portal_categories').get();
      var map = {};
      snap.forEach(function(doc) { map[doc.id] = doc.data(); });
      return map;
    },

    /* ---------- SITEMAP CACHE ---------- */
    async refreshSitemapCache() {
      try {
        var published = await this.listPublished();
        var entries = [];
        PORTAL_CATALOG.CATEGORIES.forEach(function (c) {
          entries.push({ loc: PORTAL_CATALOG.categoryUrl(c.id), changefreq: 'weekly', priority: '0.8' });
          c.topics.forEach(function (t) {
            entries.push({ loc: PORTAL_CATALOG.topicUrl(c.id, t.id), changefreq: 'weekly', priority: '0.7' });
          });
        });
        published.forEach(function (it) {
          if (it.slug) {
            entries.push({
              loc: PORTAL_CATALOG.contentUrl(it.slug),
              changefreq: 'monthly',
              priority: '0.6',
              lastmod: it.lastUpdated || it.publishDate || ''
            });
          }
        });
        await db.collection('portal_meta').doc('sitemap').set({
          entries: entries,
          updatedAt: serverTs(),
          count: entries.length
        }, { merge: true });
        return entries;
      } catch (e) {
        console.warn('[portal-data] sitemap cache refresh failed', e);
        return [];
      }
    },
    async getSitemapCache() {
      var snap = await db.collection('portal_meta').doc('sitemap').get();
      return snap.exists ? (snap.data().entries || []) : null;
    },

    /* Build a full sitemap XML string from the cache (category/topic always
       included, then published content). Used by the admin "Download Sitemap". */
    async buildSitemapXml() {
      var lines = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
      function escXml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      PORTAL_CATALOG.CATEGORIES.forEach(function (c) {
        lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.categoryUrl(c.id)) + '</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>');
        c.topics.forEach(function (t) {
          lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.topicUrl(c.id, t.id)) + '</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>');
        });
      });
      var published = await this.listPublished();
      published.forEach(function (it) {
        if (it.slug) {
          var lm = it.lastUpdated || it.publishDate || '';
          lines.push('  <url><loc>' + escXml(PORTAL_CATALOG.contentUrl(it.slug)) + '</loc>' + (lm ? '<lastmod>' + escXml(lm) + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.6</priority></url>');
        }
      });
      lines.push('</urlset>');
      return lines.join('\n');
    }
  };

  root.PortalData = PortalData;
})(window);
