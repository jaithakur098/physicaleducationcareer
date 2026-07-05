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

  /* ---------- Robust matching helpers ----------------------------------------
     Question Bank records were created by different flows over time — the
     admin form, bulk CSV/JSON imports, and legacy seed scripts — so they may
     use different field names OR different id formats. We normalise both the
     selector value and the question value before comparing so a Practice Test
     targeting "class12 / physical-education / chapter1" still matches
     questions stored as any of:
        cls / class / classId          -> "class12", "12", "class12__..."
        subject / subjectId            -> "physical-education", "class12__physical-education"
        chapter / chapterId / chapterKey -> "chapter1", "1", "class12__physical-education__chapter1"
  ----------------------------------------------------------------------------*/
  function norm(v){
    if (v == null) return '';
    return String(v).trim().toLowerCase();
  }
  // Produce equivalent forms for a given id/label so numeric and composite ids
  // collapse to the same comparable set.
  function variants(v){
    var s = norm(v);
    if (!s) return [];
    var out = [s];
    // slug + compact forms handle label values that were saved verbatim
    // e.g. "Class 12" -> "class-12", "class12"; "Physical Education" -> "physical-education", "physicaleducation".
    var slug    = s.replace(/[\s_]+/g,'-').replace(/[^a-z0-9\-]/g,'');
    var compact = s.replace(/[\s_\-]+/g,'');
    if (slug)    out.push(slug);
    if (compact) out.push(compact);
    var seps = ['__', '/', '::', '|', ':'];
    for (var i=0;i<seps.length;i++){
      if (s.indexOf(seps[i]) !== -1){
        var parts = s.split(seps[i]).filter(Boolean);
        if (parts.length) {
          out.push(parts[parts.length-1]);   // last segment  ("class12__physical-education__chapter1" -> "chapter1")
          out.push(parts[0]);                // first segment
        }
      }
    }
    // "class12" <-> "12"
    var mCls = s.match(/^class[\s_-]*(\d+)$/);
    if (mCls) out.push(mCls[1]);
    else if (/^\d+$/.test(s)) out.push('class' + s);
    // "chapter1" <-> "1" <-> "ch1"
    var mCh = s.match(/^(?:chapter|ch)[\s_-]*(\d+)$/);
    if (mCh) { out.push(mCh[1]); out.push('chapter' + mCh[1]); out.push('ch' + mCh[1]); }
    return out.filter(function(x,i,a){ return x && a.indexOf(x)===i; });
  }
  function anyEqual(aList, bList){
    for (var i=0;i<aList.length;i++){
      for (var j=0;j<bList.length;j++){
        if (aList[i] === bList[j]) return true;
      }
    }
    return false;
  }
  // Return the first defined / non-empty field among the given names.
  function pick(q){
    for (var i=1;i<arguments.length;i++){
      var k = arguments[i];
      if (q[k] !== undefined && q[k] !== null && q[k] !== '') return q[k];
    }
    return '';
  }
  function extractClass(q)   { return pick(q, 'cls', 'classId', 'class', 'className'); }
  function extractSubject(q) { return pick(q, 'subject', 'subjectId', 'subjectKey'); }
  function extractChapter(q) { return pick(q, 'chapter', 'chapterId', 'chapterKey', 'chapterNo'); }

  function questionMatches(q, classId, subjectId, chapterId){
    if (classId){
      if (!anyEqual(variants(extractClass(q)), variants(classId)))
        return { ok:false, reason:'class mismatch (question='+extractClass(q)+' vs test='+classId+')' };
    }
    if (subjectId){
      if (!anyEqual(variants(extractSubject(q)), variants(subjectId)))
        return { ok:false, reason:'subject mismatch (question='+extractSubject(q)+' vs test='+subjectId+')' };
    }
    if (chapterId){
      if (!anyEqual(variants(extractChapter(q)), variants(chapterId)))
        return { ok:false, reason:'chapter mismatch (question='+extractChapter(q)+' vs test='+chapterId+')' };
    }
    return { ok:true };
  }

  // Fetch the entire Question Bank without relying on createdAt.
  // (AdminData.listQuestions uses orderBy('createdAt','desc') which silently
  //  drops any legacy / bulk-imported question that has no createdAt field —
  //  that alone caused "No questions available for this selection".)
  async function fetchAllQuestions(){
    var snap = await db.collection('questions').get();
    return snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
  }

  function filterWithDebug(all, classId, subjectId, chapterId, label){
    var matched = [];
    var rejected = [];
    for (var i=0;i<all.length;i++){
      var q = all[i];
      var r = questionMatches(q, classId, subjectId, chapterId);
      if (r.ok) matched.push(q);
      else rejected.push({ id:q.id, reason:r.reason,
                           cls:extractClass(q), subject:extractSubject(q), chapter:extractChapter(q) });
    }
    try {
      console.groupCollapsed('[practice-data] '+(label||'filter')+' — '+matched.length+' / '+all.length+' matched');
      console.log('selector', { classId:classId, subjectId:subjectId, chapterId:chapterId });
      console.log('total questions fetched:', all.length);
      console.log('matched questions:', matched.length, matched);
      console.log('rejected questions:', rejected.length, rejected);
      console.groupEnd();
    } catch(_) {}
    return matched;
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

    /* -------- Question bank sourcing (robust) -------- */
    _matches: questionMatches,
    _variants: variants,
    _fetchAllQuestions: fetchAllQuestions,

    countAvailableQuestions: async function (classId, subjectId, chapterId) {
      var all = await fetchAllQuestions();
      var matched = filterWithDebug(all, classId, subjectId, chapterId, 'countAvailableQuestions');
      return matched.length;
    },
    listAvailableQuestions: async function (classId, subjectId, chapterId) {
      var all = await fetchAllQuestions();
      return filterWithDebug(all, classId, subjectId, chapterId, 'listAvailableQuestions');
    },
    getRandomQuestions: async function (test) {
      var all = await fetchAllQuestions();
      var matched = filterWithDebug(
        all, test.classId, test.subjectId, test.chapterId, 'getRandomQuestions'
      );
      shuffle(matched);
      var n = Number(test.totalQuestions) || matched.length;
      return matched.slice(0, n);
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
