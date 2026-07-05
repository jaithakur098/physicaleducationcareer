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


    /* ---------- Questions ---------- */
    listQuestions: async function () {
      var snap = await db.collection('questions')
        .orderBy('createdAt', 'desc').limit(500).get();
      return snap.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
    },
    saveQuestion: async function (data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      var ref = await db.collection('questions').add(
        Object.assign({}, data, { createdAt: now, updatedAt: now })
      );
      return ref.id;
    },
    updateQuestion: async function (id, data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('questions').doc(id).update(
        Object.assign({}, data, { updatedAt: now })
      );
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
      var ref = await db.collection('live_tests').add(
        Object.assign({}, data, { createdAt: now, updatedAt: now })
      );
      return ref.id;
    },
    updateLiveTest: async function (id, data) {
      var now = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('live_tests').doc(id).update(
        Object.assign({}, data, { updatedAt: now })
      );
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
