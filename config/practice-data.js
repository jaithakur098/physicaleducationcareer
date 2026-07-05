/* ============================================================================
   PRACTICE TEST DATA LAYER (compat SDK)
   Separate from Live Tests. Uses the existing `questions` collection
   (Question Bank) — randomly picks N questions matching class/subject/chapter.
   Requires: firebase-app-compat.js, firebase-auth-compat.js,
             firebase-firestore-compat.js, config/firebase-init.js
   Collections:
     practice_tests {
       title, classId, subjectId, chapterId,
       totalQuestions, durationMin, marksPerQuestion, negativeMarks,
       isPublished, createdAt, updatedAt
     }
     practice_attempts {
       studentId, studentName, studentEmail,
       testId, testTitle, classId, subjectId, chapterId,
       score, correct, wrong, total, maxMarks, percent,
       durationSec, answers[], submittedAt, autoSubmitted
     }
   ============================================================================ */
(function (root) {
  'use strict';
  if (typeof firebase === 'undefined') { console.error('[practice-data] firebase not loaded'); return; }
  var db = firebase.firestore();
  function serverTs(){ return firebase.firestore.FieldValue.serverTimestamp(); }

  function shuffle(arr){
    for (var i=arr.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=arr[i]; arr[i]=arr[j]; arr[j]=t;
    }
    return arr;
  }

  var Practice = {
    /* -------- Admin: CRUD -------- */
    listAll: async function () {
      var snap = await db.collection('practice_tests').get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    listPublished: async function () {
      var snap = await db.collection('practice_tests').where('isPublished','==',true).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    get: async function (id) {
      var s = await db.collection('practice_tests').doc(id).get();
      return s.exists ? Object.assign({id:s.id}, s.data()) : null;
    },
    save: async function (data) {
      var payload = {
        title: data.title || 'Untitled Practice Test',
        classId: data.classId || '',
        subjectId: data.subjectId || '',
        chapterId: data.chapterId || '',
        totalQuestions: Number(data.totalQuestions) || 10,
        durationMin: Number(data.durationMin) || 10,
        marksPerQuestion: Number(data.marksPerQuestion) || 1,
        negativeMarks: Number(data.negativeMarks) || 0,
        isPublished: data.isPublished !== false,
        updatedAt: serverTs()
      };
      if (data.id) {
        await db.collection('practice_tests').doc(data.id).set(payload, { merge: true });
        return data.id;
      }
      payload.createdAt = serverTs();
      var ref = await db.collection('practice_tests').add(payload);
      return ref.id;
    },
    remove: function (id) {
      return db.collection('practice_tests').doc(id).delete();
    },
    togglePublish: function (id, isPublished) {
      return db.collection('practice_tests').doc(id).set(
        { isPublished: !!isPublished, updatedAt: serverTs() }, { merge: true }
      );
    },

    /* -------- Question bank sourcing -------- */
    countAvailableQuestions: async function (classId, subjectId, chapterId) {
      var q = db.collection('questions').where('cls','==',classId);
      if (subjectId) q = q.where('subject','==',subjectId);
      if (chapterId) q = q.where('chapter','==',chapterId);
      var snap = await q.get();
      return snap.size;
    },
    getRandomQuestions: async function (test) {
      var q = db.collection('questions').where('cls','==',test.classId);
      if (test.subjectId) q = q.where('subject','==',test.subjectId);
      if (test.chapterId) q = q.where('chapter','==',test.chapterId);
      var snap = await q.get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      shuffle(arr);
      var n = Number(test.totalQuestions) || arr.length;
      return arr.slice(0, n);
    },

    /* -------- Attempts / Results / Leaderboard -------- */
    submitAttempt: async function (payload) {
      var ref = await db.collection('practice_attempts').add(
        Object.assign({}, payload, { submittedAt: serverTs() })
      );
      return ref.id;
    },
    getAttempt: async function (id) {
      var s = await db.collection('practice_attempts').doc(id).get();
      return s.exists ? Object.assign({id:s.id}, s.data()) : null;
    },
    myAttempts: async function (uid) {
      var snap = await db.collection('practice_attempts').where('studentId','==',uid).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0;
        var bx = b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    leaderboard: async function (testId, topN) {
      var snap = await db.collection('practice_attempts').where('testId','==',testId).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      // Keep best attempt per student
      var best = {};
      arr.forEach(function(r){
        var uid = r.studentId || r.id;
        if (!best[uid] || (r.score||0) > (best[uid].score||0)) best[uid] = r;
      });
      var out = Object.keys(best).map(function(k){ return best[k]; });
      out.sort(function(a,b){
        if ((b.score||0)!==(a.score||0)) return (b.score||0)-(a.score||0);
        return (a.durationSec||0)-(b.durationSec||0);
      });
      return out.slice(0, topN || 50);
    }
  };

  root.Practice = Practice;
})(window);
