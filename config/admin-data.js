/* ============================================================================
   ADMIN DATA LAYER
   All classes / subjects / chapters / questions / live tests live in Firestore.
   No hardcoded dropdown values. Seeds sensible defaults on first run.
   Collections:
     classes            {id, label, order}
     subjects           {id, classId, label, order}
     chapters           {id, classId, subjectId, title, order}
     questions          {cls, subject, chapter, examType, question, a..d,
                         correct, explanation, difficulty, marks, tags,
                         createdAt, updatedAt}
     live_tests         {title, classId, subjectId, chapterId, durationMin,
                         totalQuestions, negativeMarking, startTime, endTime,
                         isPublished, testUrl, createdAt, updatedAt}
     student_attempts   {liveTestId, studentId, score, submittedAt}
   ============================================================================ */
(function (root) {
  'use strict';

  if (!root.db) {
    console.error('[admin-data] Firestore not initialised. Load firebase-init.js first.');
    return;
  }
  var db = root.db;

  /* ---------- Default seed (used only if collection is empty) ---------- */
  var SEED_CLASSES = [
    { id: 'class10', label: 'Class 10', order: 10 },
    { id: 'class11', label: 'Class 11', order: 11 },
    { id: 'class12', label: 'Class 12', order: 12 }
  ];
  var SEED_SUBJECTS = [
    { id: 'physical-education', label: 'Physical Education' },
    { id: 'health-science',     label: 'Health Science' },
    { id: 'sports-studies',     label: 'Sports Studies' }
  ];
  var SEED_CHAPTERS = {
    'class10|physical-education': [
      'Health and Physical Education','Physical Fitness and Wellness','Yoga',
      'Sports and Games','Athletics'
    ],
    'class11|physical-education': [
      'Changing Trends & Career in Physical Education','Olympism','Yoga',
      'Physical Education & Sports for CWSN','Physical Fitness, Wellness & Lifestyle',
      'Test, Measurement & Evaluation','Fundamentals of Anatomy, Physiology & Kinesiology',
      'Psychology & Sports','Training & Doping in Sports','Khelo India & Traditional Games'
    ],
    'class12|physical-education': [
      'Management of Sporting Events','Children & Women in Sports',
      'Yoga as Preventive Measure','Physical Education & Sports for CWSN',
      'Sports & Nutrition','Test & Measurement in Sports','Physiology & Sports',
      'Biomechanics & Sports','Psychology & Sports','Training in Sports'
    ]
  };

  async function ensureSeed() {
    var cs = await db.collection('classes').limit(1).get();
    if (cs.empty) {
      var batch = db.batch();
      SEED_CLASSES.forEach(function (c) {
        batch.set(db.collection('classes').doc(c.id), c);
      });
      SEED_CLASSES.forEach(function (c) {
        SEED_SUBJECTS.forEach(function (s, si) {
          batch.set(
            db.collection('subjects').doc(c.id + '__' + s.id),
            { id: s.id, classId: c.id, label: s.label, order: si }
          );
        });
      });
      Object.keys(SEED_CHAPTERS).forEach(function (key) {
        var parts = key.split('|');
        SEED_CHAPTERS[key].forEach(function (title, idx) {
          var chId = 'chapter' + (idx + 1);
          batch.set(
            db.collection('chapters').doc(parts[0] + '__' + parts[1] + '__' + chId),
            {
              id: chId, classId: parts[0], subjectId: parts[1],
              title: title, order: idx + 1
            }
          );
        });
      });
      await batch.commit();
    }
  }

  /* ---------- Public API ---------- */
  root.AdminData = {
    ensureSeed: ensureSeed,

    listClasses: async function () {
      var snap = await db.collection('classes').orderBy('order').get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (c) { return c.active !== false; });
    },

    listSubjects: async function (classId) {
      if (!classId) return [];
      var snap = await db.collection('subjects').where('classId', '==', classId).get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (s) { return s.active !== false; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },

    listChapters: async function (classId, subjectId) {
      if (!classId || !subjectId) return [];
      var snap = await db.collection('chapters')
        .where('classId', '==', classId)
        .where('subjectId', '==', subjectId)
        .get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .filter(function (c) { return c.active !== false; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },

    /* ---------- Master Data: full lists (include inactive) ---------- */
    listAllClasses: async function () {
      var snap = await db.collection('classes').get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },
    listAllSubjects: async function (classId) {
      var q = db.collection('subjects');
      if (classId) q = q.where('classId', '==', classId);
      var snap = await q.get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },
    listAllChapters: async function (classId, subjectId) {
      var q = db.collection('chapters');
      if (classId) q = q.where('classId', '==', classId);
      if (subjectId) q = q.where('subjectId', '==', subjectId);
      var snap = await q.get();
      return snap.docs
        .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },

    /* ---------- Master Data: Classes CRUD ---------- */
    saveClass: async function (data) {
      var payload = {
        label: data.label,
        order: Number(data.order) || 0,
        active: data.active !== false
      };
      if (data.id) {
        await db.collection('classes').doc(data.id).set(payload, { merge: true });
        return data.id;
      }
      var ref = await db.collection('classes').add(payload);
      return ref.id;
    },
    updateClass: async function (id, data) {
      var payload = {};
      if (data.label !== undefined) payload.label = data.label;
      if (data.order !== undefined) payload.order = Number(data.order) || 0;
      if (data.active !== undefined) payload.active = !!data.active;
      await db.collection('classes').doc(id).set(payload, { merge: true });
    },
    deleteClass: function (id) {
      return db.collection('classes').doc(id).delete();
    },

    /* ---------- Master Data: Subjects CRUD ---------- */
    saveSubject: async function (data) {
      if (!data.classId) throw new Error('classId is required');
      var payload = {
        classId: data.classId,
        label: data.label,
        order: Number(data.order) || 0,
        active: data.active !== false
      };
      if (data.id) {
        await db.collection('subjects').doc(data.id).set(payload, { merge: true });
        return data.id;
      }
      var ref = await db.collection('subjects').add(payload);
      return ref.id;
    },
    updateSubject: async function (id, data) {
      var payload = {};
      ['classId','label'].forEach(function(k){ if (data[k] !== undefined) payload[k] = data[k]; });
      if (data.order !== undefined) payload.order = Number(data.order) || 0;
      if (data.active !== undefined) payload.active = !!data.active;
      await db.collection('subjects').doc(id).set(payload, { merge: true });
    },
    deleteSubject: function (id) {
      return db.collection('subjects').doc(id).delete();
    },

    /* ---------- Master Data: Chapters CRUD ---------- */
    saveChapter: async function (data) {
      if (!data.classId || !data.subjectId) throw new Error('classId and subjectId are required');
      var payload = {
        classId: data.classId,
        subjectId: data.subjectId,
        title: data.title,
        order: Number(data.order) || 0,
        active: data.active !== false
      };
      if (data.id) {
        await db.collection('chapters').doc(data.id).set(payload, { merge: true });
        return data.id;
      }
      var ref = await db.collection('chapters').add(payload);
      return ref.id;
    },
    updateChapter: async function (id, data) {
      var payload = {};
      ['classId','subjectId','title'].forEach(function(k){ if (data[k] !== undefined) payload[k] = data[k]; });
      if (data.order !== undefined) payload.order = Number(data.order) || 0;
      if (data.active !== undefined) payload.active = !!data.active;
      await db.collection('chapters').doc(id).set(payload, { merge: true });
    },
    deleteChapter: function (id) {
      return db.collection('chapters').doc(id).delete();
    },


    /* ---------- Resolve raw class/subject/chapter values → canonical master IDs.
       Used by bulk import so questions immediately match Practice/Live Test
       Builders without any manual Edit → Save step.
    ---------------------------------------------------------------------- */
    resolveMasterRefs: async function (raw) {
      raw = raw || {};
      function n(v){ return v==null ? '' : String(v).trim().toLowerCase(); }
      function slug(v){ return n(v).replace(/[\s_]+/g,'-').replace(/[^a-z0-9\-]/g,''); }
      function compact(v){ return n(v).replace(/[\s_\-]+/g,''); }
      var rawCls = raw.classId || raw.cls || raw.class || raw.className || '';
      var rawSub = raw.subjectId || raw.subject || raw.subjectKey || '';
      var rawCh  = raw.chapterId || raw.chapter || raw.chapterKey || raw.chapterNo || '';
      var classes  = (await db.collection('classes').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var subjects = (await db.collection('subjects').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var chapters = (await db.collection('chapters').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      function matchClass(r){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        var m=n(r).match(/^class[\s_-]*(\d+)$/); if(m) cands.push('class'+m[1]);
        if (/^\d+$/.test(n(r))) cands.push('class'+n(r));
        for (var i=0;i<classes.length;i++){ var c=classes[i];
          if (cands.indexOf(n(c.id))!==-1||cands.indexOf(slug(c.label))!==-1||cands.indexOf(compact(c.label))!==-1) return c.id; }
        return String(r);
      }
      function matchSubject(r, cid){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        for (var i=0;i<subjects.length;i++){ var s=subjects[i];
          if (cid && s.classId && n(s.classId)!==n(cid)) continue;
          if (cands.indexOf(n(s.id))!==-1||cands.indexOf(slug(s.label))!==-1||cands.indexOf(compact(s.label))!==-1) return s.id; }
        return String(r);
      }
      function matchChapter(r, cid, sid){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        var m=n(r).match(/^(?:chapter|ch)[\s_-]*(\d+)$/);
        if (m){ cands.push('chapter'+m[1], 'ch'+m[1], m[1]); }
        if (/^\d+$/.test(n(r))) cands.push('chapter'+n(r));
        for (var i=0;i<chapters.length;i++){ var c=chapters[i];
          if (cid && c.classId && n(c.classId)!==n(cid)) continue;
          if (sid && c.subjectId && n(c.subjectId)!==n(sid)) continue;
          if (cands.indexOf(n(c.id))!==-1||cands.indexOf(slug(c.title||''))!==-1||cands.indexOf(compact(c.title||''))!==-1) return c.id; }
        return String(r);
      }
      var classId = matchClass(rawCls);
      var subjectId = matchSubject(rawSub, classId);
      var chapterId = matchChapter(rawCh, classId, subjectId);
      return { classId: classId, subjectId: subjectId, chapterId: chapterId };
    },

    /* ---------- Preloaded master resolver for bulk import.
       Loads classes/subjects/chapters ONCE and returns a synchronous
       resolve(raw) function, so importing N rows costs 3 reads total
       instead of 3 reads per row (which throttled / failed large files).
    ---------------------------------------------------------------------- */
    getMasterResolver: async function () {
      function n(v){ return v==null ? '' : String(v).trim().toLowerCase(); }
      function slug(v){ return n(v).replace(/[\s_]+/g,'-').replace(/[^a-z0-9\-]/g,''); }
      function compact(v){ return n(v).replace(/[\s_\-]+/g,''); }
      var classes  = (await db.collection('classes').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var subjects = (await db.collection('subjects').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var chapters = (await db.collection('chapters').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      function matchClass(r){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        var m=n(r).match(/^class[\s_-]*(\d+)$/); if(m) cands.push('class'+m[1]);
        if (/^\d+$/.test(n(r))) cands.push('class'+n(r));
        for (var i=0;i<classes.length;i++){ var c=classes[i];
          if (cands.indexOf(n(c.id))!==-1||cands.indexOf(slug(c.label))!==-1||cands.indexOf(compact(c.label))!==-1) return c.id; }
        return String(r);
      }
      function matchSubject(r, cid){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        for (var i=0;i<subjects.length;i++){ var s=subjects[i];
          if (cid && s.classId && n(s.classId)!==n(cid)) continue;
          if (cands.indexOf(n(s.id))!==-1||cands.indexOf(slug(s.label))!==-1||cands.indexOf(compact(s.label))!==-1) return s.id; }
        return String(r);
      }
      function matchChapter(r, cid, sid){
        if (!r) return '';
        var cands=[n(r), slug(r), compact(r)];
        var m=n(r).match(/^(?:chapter|ch)[\s_-]*(\d+)$/);
        if (m){ cands.push('chapter'+m[1], 'ch'+m[1], m[1]); }
        if (/^\d+$/.test(n(r))) cands.push('chapter'+n(r));
        for (var i=0;i<chapters.length;i++){ var c=chapters[i];
          if (cid && c.classId && n(c.classId)!==n(cid)) continue;
          if (sid && c.subjectId && n(c.subjectId)!==n(sid)) continue;
          if (cands.indexOf(n(c.id))!==-1||cands.indexOf(slug(c.title||''))!==-1||cands.indexOf(compact(c.title||''))!==-1) return c.id; }
        return String(r);
      }
      return function (raw) {
        raw = raw || {};
        var rawCls = raw.classId || raw.cls || raw.class || raw.className || '';
        var rawSub = raw.subjectId || raw.subject || raw.subjectKey || '';
        var rawCh  = raw.chapterId || raw.chapter || raw.chapterKey || raw.chapterNo || '';
        var classId   = matchClass(rawCls);
        var subjectId = matchSubject(rawSub, classId);
        var chapterId = matchChapter(rawCh, classId, subjectId);
        return { classId: classId, subjectId: subjectId, chapterId: chapterId };
      };
    },

    /* ---------- Questions ---------- */
    listQuestions: async function () {
      // IMPORTANT: no orderBy('createdAt') and no limit — bulk-imported
      // questions without createdAt would otherwise be silently dropped,
      // and hard limits caused Practice/Live tests to disagree with the
      // Question Bank. Sorted client-side for a stable order.
      var snap = await db.collection('questions').get();
      var arr = snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      arr.sort(function (a, b) {
        var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        if (bx !== ax) return bx - ax;
        return String(b.id).localeCompare(String(a.id));
      });
      try { console.log('[admin-data] listQuestions fetched', arr.length, 'documents'); } catch(_) {}
      return arr;
    },
    saveQuestion: async function (data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      // Write both legacy (cls/subject/chapter) and modern
      // (classId/subjectId/chapterId) field names so every consumer works.
      var payload = Object.assign({}, data);
      if (payload.cls && !payload.classId)     payload.classId    = payload.cls;
      if (payload.classId && !payload.cls)     payload.cls        = payload.classId;
      if (payload.subject && !payload.subjectId) payload.subjectId = payload.subject;
      if (payload.subjectId && !payload.subject) payload.subject   = payload.subjectId;
      if (payload.chapter && !payload.chapterId) payload.chapterId = payload.chapter;
      if (payload.chapterId && !payload.chapter) payload.chapter   = payload.chapterId;

      // Dual-write MCQ option/answer fields so every consumer (Answer Review,
      // exports, legacy pages) can read them regardless of schema version.
      if (payload.a != null && payload.optionA == null) payload.optionA = payload.a;
      if (payload.b != null && payload.optionB == null) payload.optionB = payload.b;
      if (payload.c != null && payload.optionC == null) payload.optionC = payload.c;
      if (payload.d != null && payload.optionD == null) payload.optionD = payload.d;
      if (payload.optionA != null && payload.a == null) payload.a = payload.optionA;
      if (payload.optionB != null && payload.b == null) payload.b = payload.optionB;
      if (payload.optionC != null && payload.c == null) payload.c = payload.optionC;
      if (payload.optionD != null && payload.d == null) payload.d = payload.optionD;
      if (payload.correct && !payload.correctAnswer) payload.correctAnswer = payload.correct;
      if (payload.correctAnswer && !payload.correct) payload.correct = payload.correctAnswer;
      payload.createdAt = now; payload.updatedAt = now;
      var ref = await db.collection('questions').add(payload);
      return ref.id;
    },
    updateQuestion: async function (id, data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var payload = Object.assign({}, data);
      if (payload.cls && !payload.classId)     payload.classId    = payload.cls;
      if (payload.classId && !payload.cls)     payload.cls        = payload.classId;
      if (payload.subject && !payload.subjectId) payload.subjectId = payload.subject;
      if (payload.subjectId && !payload.subject) payload.subject   = payload.subjectId;
      if (payload.chapter && !payload.chapterId) payload.chapterId = payload.chapter;
      if (payload.chapterId && !payload.chapter) payload.chapter   = payload.chapterId;

      // Dual-write MCQ option/answer fields so every consumer (Answer Review,
      // exports, legacy pages) can read them regardless of schema version.
      if (payload.a != null && payload.optionA == null) payload.optionA = payload.a;
      if (payload.b != null && payload.optionB == null) payload.optionB = payload.b;
      if (payload.c != null && payload.optionC == null) payload.optionC = payload.c;
      if (payload.d != null && payload.optionD == null) payload.optionD = payload.d;
      if (payload.optionA != null && payload.a == null) payload.a = payload.optionA;
      if (payload.optionB != null && payload.b == null) payload.b = payload.optionB;
      if (payload.optionC != null && payload.c == null) payload.c = payload.optionC;
      if (payload.optionD != null && payload.d == null) payload.d = payload.optionD;
      if (payload.correct && !payload.correctAnswer) payload.correctAnswer = payload.correct;
      if (payload.correctAnswer && !payload.correct) payload.correct = payload.correctAnswer;
      payload.updatedAt = now;
      await db.collection('questions').doc(id).update(payload);
    },
    deleteQuestion: function (id) {
      return db.collection('questions').doc(id).delete();
    },
    countQuestions: async function () {
      try {
        var agg = await db.collection('questions').get();
        return agg.size;
      } catch (e) { return 0; }
    },

    /* ---------- One-click "Repair / Migrate All Questions" ----------
       Scans every document in `questions` and safely adds only missing
       classId / subjectId / chapterId / createdAt values. It never touches
       question text, options, answer, explanation, images, or document ids.
       Existing classId / subjectId / chapterId values are preserved exactly.
       Uses batched writes (max 400/batch). Calls onProgress(done,total).
    ---------------------------------------------------------------- */
    migrateAllQuestions: async function (onProgress) {
      function norm(v){ return v==null ? '' : String(v).trim().toLowerCase(); }
      function slug(v){ return norm(v).replace(/[\s_]+/g,'-').replace(/[^a-z0-9\-]/g,''); }
      function compact(v){ return norm(v).replace(/[\s_\-]+/g,''); }
      function pickField(o){
        for (var i=1;i<arguments.length;i++){
          var k = arguments[i];
          if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
        }
        return '';
      }

      // Preload master data so we can turn labels back into canonical ids.
      var classes  = (await db.collection('classes').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var subjects = (await db.collection('subjects').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      var chapters = (await db.collection('chapters').get()).docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });

      function resolveClassId(raw){
        if (!raw) return '';
        var candidates = [norm(raw), slug(raw), compact(raw)];
        var mCls = norm(raw).match(/^class[\s_-]*(\d+)$/);
        if (mCls) candidates.push('class'+mCls[1]);
        if (/^\d+$/.test(norm(raw))) candidates.push('class'+norm(raw));
        for (var i=0;i<classes.length;i++){
          var c = classes[i];
          if (candidates.indexOf(norm(c.id))!==-1) return c.id;
          if (candidates.indexOf(slug(c.label))!==-1) return c.id;
          if (candidates.indexOf(compact(c.label))!==-1) return c.id;
        }
        return String(raw);
      }
      function resolveSubjectId(raw, classId){
        if (!raw) return '';
        var candidates = [norm(raw), slug(raw), compact(raw)];
        for (var i=0;i<subjects.length;i++){
          var s = subjects[i];
          if (classId && s.classId && norm(s.classId)!==norm(classId)) continue;
          if (candidates.indexOf(norm(s.id))!==-1) return s.id;
          if (candidates.indexOf(slug(s.label))!==-1) return s.id;
          if (candidates.indexOf(compact(s.label))!==-1) return s.id;
        }
        return String(raw);
      }
      function resolveChapterId(raw, classId, subjectId){
        if (!raw) return '';
        var candidates = [norm(raw), slug(raw), compact(raw)];
        var mCh = norm(raw).match(/^(?:chapter|ch)[\s_-]*(\d+)$/);
        if (mCh) { candidates.push('chapter'+mCh[1]); candidates.push('ch'+mCh[1]); candidates.push(mCh[1]); }
        if (/^\d+$/.test(norm(raw))) { candidates.push('chapter'+norm(raw)); }
        for (var i=0;i<chapters.length;i++){
          var c = chapters[i];
          if (classId && c.classId && norm(c.classId)!==norm(classId)) continue;
          if (subjectId && c.subjectId && norm(c.subjectId)!==norm(subjectId)) continue;
          if (candidates.indexOf(norm(c.id))!==-1) return c.id;
          if (candidates.indexOf(slug(c.title||''))!==-1) return c.id;
          if (candidates.indexOf(compact(c.title||''))!==-1) return c.id;
        }
        return String(raw);
      }

      var snap = await db.collection('questions').get();
      var docs = snap.docs;
      var total = docs.length;
      var done  = 0, updated = 0, skipped = 0;
      if (typeof onProgress === 'function') onProgress(0, total, {updated:0, skipped:0});

      var BATCH = 400;
      for (var start=0; start<total; start+=BATCH) {
        var batch = db.batch();
        var slice = docs.slice(start, start+BATCH);
        for (var i=0;i<slice.length;i++){
          var d = slice[i]; var q = d.data() || {};
          var rawCls = pickField(q, 'cls', 'class', 'className');
          var rawSub = pickField(q, 'subject', 'subjectKey');
          var rawCh  = pickField(q, 'chapter', 'chapterKey', 'chapterNo');
          var classId   = resolveClassId(rawCls);
          var subjectId = resolveSubjectId(rawSub, classId);
          var chapterId = resolveChapterId(rawCh, classId, subjectId);

          // Detect garbage previously written into class/subject/chapter fields
          // (e.g. question text or an option ended up in classId). A value is
          // treated as garbage when it is very long, contains a question mark,
          // has many words, or doesn't resolve to any known master-data id.
          function looksBad(v, resolvedId, allKnownIds) {
            var s = String(v == null ? '' : v).trim();
            if (!s) return false;
            if (s.length > 60) return true;
            if (s.indexOf('?') !== -1) return true;
            if (s.split(/\s+/).length > 8) return true;
            return allKnownIds.indexOf(String(resolvedId)) === -1;
          }
          var classIds   = classes.map(function(c){ return c.id; });
          var subjectIds = subjects.map(function(s){ return s.id; });
          var chapterIds = chapters.map(function(c){ return c.id; });

          var patch = {};
          var needsReview = false;

          // Only rewrite when the existing stored value is missing OR garbage.
          if ((q.classId == null || q.classId === '' || looksBad(q.classId, classId, classIds)) && classId && classIds.indexOf(classId) !== -1) { patch.classId = classId; patch.cls = classId; }
          else if (q.classId && !q.cls) { patch.cls = q.classId; }
          if ((q.subjectId == null || q.subjectId === '' || looksBad(q.subjectId, subjectId, subjectIds)) && subjectId && subjectIds.indexOf(subjectId) !== -1) { patch.subjectId = subjectId; patch.subject = subjectId; }
          else if (q.subjectId && !q.subject) { patch.subject = q.subjectId; }
          if ((q.chapterId == null || q.chapterId === '' || looksBad(q.chapterId, chapterId, chapterIds)) && chapterId && chapterIds.indexOf(chapterId) !== -1) { patch.chapterId = chapterId; patch.chapter = chapterId; }
          else if (q.chapterId && !q.chapter) { patch.chapter = q.chapterId; }

          // Flag rows we could not confidently repair so the admin can spot them.
          if (looksBad(q.classId, classId, classIds) && classIds.indexOf(classId) === -1) needsReview = true;
          if (looksBad(q.subjectId, subjectId, subjectIds) && subjectIds.indexOf(subjectId) === -1) needsReview = true;
          if (looksBad(q.chapterId, chapterId, chapterIds) && chapterIds.indexOf(chapterId) === -1) needsReview = true;
          if (needsReview && !q._needsReview) patch._needsReview = true;
          if (!needsReview && q._needsReview) patch._needsReview = false;

          if (q.createdAt == null) patch.createdAt = q.updatedAt || firebase.firestore.FieldValue.serverTimestamp();

          // Backfill MCQ option/answer text so Answer Review never shows blank options.
          function _first(){ for (var _i=0;_i<arguments.length;_i++){ var _v=arguments[_i]; if (_v!=null && _v!=='') return _v; } return ''; }
          var _opts = q.options || q.opts || null;
          var _oA = _first(q.optionA, q.option_a, q.OptionA, q.a, q.A, _opts && _opts[0]);
          var _oB = _first(q.optionB, q.option_b, q.OptionB, q.b, q.B, _opts && _opts[1]);
          var _oC = _first(q.optionC, q.option_c, q.OptionC, q.c, q.C, _opts && _opts[2]);
          var _oD = _first(q.optionD, q.option_d, q.OptionD, q.d, q.D, _opts && _opts[3]);
          if (_oA && !q.optionA) patch.optionA = _oA;
          if (_oB && !q.optionB) patch.optionB = _oB;
          if (_oC && !q.optionC) patch.optionC = _oC;
          if (_oD && !q.optionD) patch.optionD = _oD;
          if (_oA && !q.a) patch.a = _oA;
          if (_oB && !q.b) patch.b = _oB;
          if (_oC && !q.c) patch.c = _oC;
          if (_oD && !q.d) patch.d = _oD;
          var _ca = _first(q.correctAnswer, q.correct, q.answer, q.ans);
          if (_ca){
            _ca = String(_ca).trim().toUpperCase();
            if (['A','B','C','D'].indexOf(_ca)!==-1){
              if (!q.correctAnswer) patch.correctAnswer = _ca;
              if (!q.correct) patch.correct = _ca;
            }
          }
          var _ex = _first(q.explanation, q.explaination, q.solution);
          if (_ex && !q.explanation) patch.explanation = _ex;
          if (!q.difficulty) patch.difficulty = 'Medium';
          if (!q.examType) patch.examType = 'MCQ';
          if (!q.marks) patch.marks = 1;


          if (Object.keys(patch).length) {
            batch.set(d.ref, patch, { merge: true });
            updated++;
          } else {
            skipped++;
          }
          done++;
        }
        await batch.commit();
        if (typeof onProgress === 'function') onProgress(done, total, {updated:updated, skipped:skipped});
      }

      try {
        console.log('[admin-data] migrateAllQuestions complete', {total:total, updated:updated, skipped:skipped});
      } catch(_) {}
      return { total: total, updated: updated, skipped: skipped };
    }
    ,

    /* ---------- Bulk delete ---------- */
    bulkDeleteQuestions: async function (ids, onProgress) {
      if (!ids || !ids.length) return { deleted: 0 };
      var BATCH = 400, done = 0, total = ids.length;
      for (var start = 0; start < total; start += BATCH) {
        var batch = db.batch();
        var slice = ids.slice(start, start + BATCH);
        for (var i = 0; i < slice.length; i++) {
          batch.delete(db.collection('questions').doc(slice[i]));
        }
        await batch.commit();
        done += slice.length;
        if (typeof onProgress === 'function') onProgress(done, total);
      }
      return { deleted: done };
    },

    /* ---------- Duplicate + broken scanner ---------- */
    scanBank: async function () {
      var snap = await db.collection('questions').get();
      var docs = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      function norm(s){ return String(s == null ? '' : s).replace(/\s+/g,' ').trim().toLowerCase(); }
      function keyText(q){ return norm(q.question || q.text || q.q); }
      function keyFull(q){
        return keyText(q) + '||' +
          norm(q.optionA || q.a) + '|' + norm(q.optionB || q.b) + '|' +
          norm(q.optionC || q.c) + '|' + norm(q.optionD || q.d);
      }
      var byText = {}, byFull = {};
      docs.forEach(function(q){
        var kt = keyText(q); if (!kt) return;
        (byText[kt] = byText[kt] || []).push(q);
        var kf = keyFull(q);
        (byFull[kf] = byFull[kf] || []).push(q);
      });
      // Duplicate groups (2+): prefer full-match grouping.
      var dupGroups = [];
      Object.keys(byFull).forEach(function(k){
        if (byFull[k].length > 1) dupGroups.push(byFull[k]);
      });
      // Also detect same-text-only duplicates that aren't already counted.
      var seen = {};
      dupGroups.forEach(function(g){ g.forEach(function(q){ seen[q.id]=1; }); });
      Object.keys(byText).forEach(function(k){
        var g = byText[k];
        if (g.length > 1) {
          var unseen = g.filter(function(q){ return !seen[q.id]; });
          if (unseen.length > 1) dupGroups.push(unseen);
        }
      });
      var duplicateCount = dupGroups.reduce(function(a,g){ return a + (g.length - 1); }, 0);
      var broken = [], missingFields = [], repairable = [], migrateNeeded = [];
      docs.forEach(function(q){
        var miss = [];
        if (!q.question && !q.text) miss.push('question');
        var hasA = q.optionA || q.a, hasB = q.optionB || q.b, hasC = q.optionC || q.c, hasD = q.optionD || q.d;
        if (!hasA) miss.push('optionA');
        if (!hasB) miss.push('optionB');
        if (!hasC) miss.push('optionC');
        if (!hasD) miss.push('optionD');
        if (!(q.correctAnswer || q.correct)) miss.push('correctAnswer');
        if (!q.classId && !q.cls) miss.push('classId');
        if (!q.subjectId && !q.subject) miss.push('subjectId');
        if (!q.chapterId && !q.chapter) miss.push('chapterId');
        if (miss.length) missingFields.push({ id: q.id, missing: miss });
        var legacy = (q.a || q.b || q.c || q.d || q.correct) && !(q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer);
        if (legacy) migrateNeeded.push(q.id);
        if (miss.indexOf('question') !== -1 || miss.length >= 5) broken.push(q.id);
        else if (miss.length) repairable.push(q.id);
      });
      return {
        total: docs.length,
        duplicates: duplicateCount,
        duplicateGroups: dupGroups,
        broken: broken.length,
        brokenIds: broken,
        missingFields: missingFields.length,
        missingDetails: missingFields,
        repairable: repairable.length,
        migrateNeeded: migrateNeeded.length,
        migrateNeededIds: migrateNeeded
      };
    },

    /* ---------- Duplicate removal helpers ---------- */
    removeDuplicatesKeepOldest: async function (groups, onProgress) {
      var toDel = [];
      (groups || []).forEach(function(g){
        var arr = g.slice().sort(function(a,b){
          var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return ax - bx;
        });
        for (var i=1;i<arr.length;i++) toDel.push(arr[i].id);
      });
      return this.bulkDeleteQuestions(toDel, onProgress);
    },
    removeDuplicatesKeepLatest: async function (groups, onProgress) {
      var toDel = [];
      (groups || []).forEach(function(g){
        var arr = g.slice().sort(function(a,b){
          var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return bx - ax;
        });
        for (var i=1;i<arr.length;i++) toDel.push(arr[i].id);
      });
      return this.bulkDeleteQuestions(toDel, onProgress);
    },
    mergeDuplicateGroup: async function (keepId, group) {
      // Merge missing fields from removed docs into the kept doc, then delete others.
      var keep = group.find(function(q){ return q.id === keepId; });
      if (!keep) return { merged: 0 };
      var others = group.filter(function(q){ return q.id !== keepId; });
      var patch = {};
      ['optionA','optionB','optionC','optionD','correctAnswer','explanation',
       'a','b','c','d','correct','classId','subjectId','chapterId','cls','subject','chapter',
       'difficulty','examType','marks','tags'].forEach(function(f){
        if ((keep[f] == null || keep[f] === '') ) {
          for (var i=0;i<others.length;i++){
            if (others[i][f] != null && others[i][f] !== '') { patch[f] = others[i][f]; break; }
          }
        }
      });
      if (Object.keys(patch).length) await db.collection('questions').doc(keepId).set(patch, { merge: true });
      var ids = others.map(function(q){ return q.id; });
      await this.bulkDeleteQuestions(ids);
      return { merged: ids.length + 1, deleted: ids.length };
    }
,

    /* ---------- Live Tests ---------- */
    listLiveTests: async function () {
      var snap = await db.collection('live_tests').orderBy('createdAt', 'desc').get();
      return snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
    },
    listPublishedTests: async function (classId, subjectId) {
      var q = db.collection('live_tests').where('isPublished', '==', true);
      if (classId)   q = q.where('classId', '==', classId);
      if (subjectId) q = q.where('subjectId', '==', subjectId);
      var snap = await q.get();
      return snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
    },
    saveLiveTest: async function (data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var payload = Object.assign({}, data, { createdAt: now, updatedAt: now });
      var ref = await db.collection('live_tests').add(payload);
      // Auto-generate testUrl if missing so students always have a link.
      if (!payload.testUrl) {
        var testUrl = 'tests/mcq-engine.html?testId=' + ref.id;
        await ref.set({ testUrl: testUrl, updatedAt: now }, { merge: true });
      }
      return ref.id;
    },
    updateLiveTest: async function (id, data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var payload = Object.assign({}, data, { updatedAt: now });
      if (payload.testUrl === '' || payload.testUrl == null) {
        payload.testUrl = 'tests/mcq-engine.html?testId=' + id;
      }
      await db.collection('live_tests').doc(id).update(payload);
    },
    deleteLiveTest: function (id) {
      return db.collection('live_tests').doc(id).delete();
    },
    togglePublish: async function (id, isPublished) {
      await db.collection('live_tests').doc(id).update({
        isPublished: !!isPublished,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    },

    /* ---------- Analytics ---------- */
    countLiveTests: async function () {
      var s = await db.collection('live_tests').get();
      return { total: s.size, published: s.docs.filter(function (d) { return d.data().isPublished; }).length };
    },
    countStudentsAppeared: async function () {
      try {
        var s = await db.collection('student_attempts').get();
        var set = {};
        s.docs.forEach(function (d) { set[d.data().studentId || d.id] = 1; });
        return Object.keys(set).length;
      } catch (e) { return 0; }
    }
  };
})(window);
