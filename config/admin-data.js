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

  /* ============================================================
     UNIFIED QUESTION SCHEMA NORMALISER
     Every write (manual save, update, CSV / Excel / JSON import)
     passes through this helper so the Firestore document always
     contains BOTH the legacy shape (cls / subject / chapter /
     a-d / correct) AND the modern shape (classId / subjectId /
     chapterId / optionA-D / options[] / correctAnswer / answer /
     questionType). This is what makes Question Bank, Practice
     Test and Live Test read the same records without an extra
     Edit → Save round-trip.
  ============================================================ */
  function _firstNonEmpty() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
  }
  function _optAt(arr, i) {
    return Array.isArray(arr) && arr[i] !== undefined && arr[i] !== null ? arr[i] : '';
  }
  function _letterFromAny(raw, opts) {
    if (raw === undefined || raw === null || raw === '') return { letter: '', index: -1 };
    if (typeof raw === 'number') {
      var n = raw;
      if (n >= 1 && n <= 4) return { letter: String.fromCharCode(64 + n), index: n - 1 };
      if (n >= 0 && n <= 3) return { letter: String.fromCharCode(65 + n), index: n };
    }
    var s = String(raw).trim();
    if (/^[a-dA-D]$/.test(s)) {
      var L = s.toUpperCase();
      return { letter: L, index: L.charCodeAt(0) - 65 };
    }
    if (/^[1-4]$/.test(s)) return { letter: String.fromCharCode(64 + Number(s)), index: Number(s) - 1 };
    if (/^[0-3]$/.test(s)) return { letter: String.fromCharCode(65 + Number(s)), index: Number(s) };
    // Match by option text
    var target = s.toLowerCase();
    for (var i = 0; i < opts.length; i++) {
      if (String(opts[i] || '').trim().toLowerCase() === target) {
        return { letter: String.fromCharCode(65 + i), index: i };
      }
    }
    return { letter: '', index: -1 };
  }
  function normalizeQuestion(input) {
    var src = input || {};
    var out = {};
    // Copy any custom fields verbatim, then overwrite canonical ones below.
    Object.keys(src).forEach(function (k) { out[k] = src[k]; });

    // ---- Question text ----
    out.question = String(_firstNonEmpty(src.question, src.Question, src.text, src.q) || '');

    // ---- Options: accept optionA/OptionA/option_A/a/A/options[] ----
    var A = _firstNonEmpty(src.optionA, src.OptionA, src.option_a, src.option_A, src.a, src.A, _optAt(src.options, 0));
    var B = _firstNonEmpty(src.optionB, src.OptionB, src.option_b, src.option_B, src.b, src.B, _optAt(src.options, 1));
    var C = _firstNonEmpty(src.optionC, src.OptionC, src.option_c, src.option_C, src.c, src.C, _optAt(src.options, 2));
    var D = _firstNonEmpty(src.optionD, src.OptionD, src.option_d, src.option_D, src.d, src.D, _optAt(src.options, 3));
    out.a = out.A = out.optionA = String(A || '');
    out.b = out.B = out.optionB = String(B || '');
    out.c = out.C = out.optionC = String(C || '');
    out.d = out.D = out.optionD = String(D || '');
    out.options = [out.optionA, out.optionB, out.optionC, out.optionD];

    // ---- Correct answer: derive canonical letter + zero-based index ----
    var rawAns = _firstNonEmpty(src.correct, src.correctAnswer, src.answer, src.Correct, src.Answer, src.correctOption);
    var parsed = _letterFromAny(rawAns, [out.optionA, out.optionB, out.optionC, out.optionD]);
    if (parsed.letter === '') { parsed = { letter: 'A', index: 0 }; }
    out.correct = parsed.letter;         // legacy readers ("A".."D")
    out.correctAnswer = parsed.letter;   // modern readers ("A".."D")
    out.answer = parsed.index;           // MCQ engine reads zero-based index

    // ---- Class / Subject / Chapter (both aliases) ----
    var cls = _firstNonEmpty(src.cls, src.classId, src.Class, src['class'], src.className);
    var sub = _firstNonEmpty(src.subject, src.subjectId, src.Subject, src.subjectKey);
    var ch  = _firstNonEmpty(src.chapter, src.chapterId, src.Chapter, src.chapterKey, src.chapterNo);
    out.cls = String(cls || ''); out.classId = String(cls || '');
    out.subject = String(sub || ''); out.subjectId = String(sub || '');
    out.chapter = String(ch || ''); out.chapterId = String(ch || '');

    // ---- Question type / metadata ----
    out.questionType = String(_firstNonEmpty(src.questionType, src.examType, src.type, src.Type) || 'MCQ');
    out.examType = out.questionType;
    out.explanation = String(_firstNonEmpty(src.explanation, src.Explanation, src.solution) || '');
    out.difficulty = String(_firstNonEmpty(src.difficulty, src.Difficulty) || 'Easy');
    out.marks = Number(_firstNonEmpty(src.marks, src.Marks, 1)) || 1;
    out.tags = String(_firstNonEmpty(src.tags, src.Tags) || '');

    return out;
  }

  // Given an existing Firestore doc, return a patch of ONLY the fields that
  // are missing / inconsistent so migration never overwrites good data.
  function repairPatch(existing) {
    var canonical = normalizeQuestion(existing || {});
    var patch = {};
    // Option fields
    ['optionA','optionB','optionC','optionD','a','b','c','d','A','B','C','D'].forEach(function (k) {
      var canon = canonical[k];
      if (canon && (existing[k] === undefined || existing[k] === null || existing[k] === '')) {
        patch[k] = canon;
      }
    });
    // options array
    if (!Array.isArray(existing.options) || existing.options.length < 4 ||
        existing.options.some(function (x) { return x == null || x === ''; })) {
      if (canonical.options.some(function (x) { return x !== ''; })) patch.options = canonical.options;
    }
    // Answer letter / index
    if (!existing.correct)        patch.correct = canonical.correct;
    if (!existing.correctAnswer)  patch.correctAnswer = canonical.correctAnswer;
    if (existing.answer === undefined || existing.answer === null || existing.answer === '')
      patch.answer = canonical.answer;
    // Question text
    if (!existing.question && canonical.question) patch.question = canonical.question;
    // Type / explanation
    if (!existing.questionType) patch.questionType = canonical.questionType;
    if (!existing.examType)     patch.examType = canonical.examType;
    return patch;
  }

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
      // Route every write through the unified schema normaliser so the
      // document always has BOTH legacy (a-d/correct) AND modern
      // (optionA-D/options[]/correctAnswer/answer) shapes filled in.
      var payload = normalizeQuestion(data);
      payload.createdAt = now; payload.updatedAt = now;
      var ref = await db.collection('questions').add(payload);
      return ref.id;
    },
    updateQuestion: async function (id, data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var payload = normalizeQuestion(data);
      payload.updatedAt = now;
      // set+merge (not update) so a partial doc still gets missing fields.
      await db.collection('questions').doc(id).set(payload, { merge: true });
    },
    // Public — used by admin.html preview / migration UI.
    normalizeQuestion: normalizeQuestion,
    repairQuestionPatch: repairPatch,
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

          var patch = {};
          if ((q.classId === undefined || q.classId === null || q.classId === '') && classId) patch.classId = classId;
          if ((q.subjectId === undefined || q.subjectId === null || q.subjectId === '') && subjectId) patch.subjectId = subjectId;
          if ((q.chapterId === undefined || q.chapterId === null || q.chapterId === '') && chapterId) patch.chapterId = chapterId;
          if (q.createdAt == null) patch.createdAt = q.updatedAt || firebase.firestore.FieldValue.serverTimestamp();
          if (q.updatedAt == null) patch.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

          // Rebuild missing option / answer / question-text fields without
          // deleting anything. `repairPatch` only fills empty slots.
          var optionsPatch = repairPatch(q);
          Object.keys(optionsPatch).forEach(function (k) { patch[k] = optionsPatch[k]; });

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
    },

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
