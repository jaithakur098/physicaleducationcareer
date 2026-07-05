/* ============================================================================
   STUDENT DATA LAYER (Firebase Auth + Firestore, compat SDK)
   Requires: firebase-app-compat.js, firebase-auth-compat.js,
             firebase-firestore-compat.js, config/firebase-init.js
   Collections:
     students                {uid, name, email, phone, className, school,
                              city, state, blocked, createdAt}
     student_attempts        {studentId, studentName, testId, testTitle,
                              classId, subjectId, score, correct, wrong,
                              total, maxMarks, percent, durationSec,
                              answers[], submittedAt, autoSubmitted}
   ============================================================================ */
(function (root) {
  'use strict';
  if (typeof firebase === 'undefined') { console.error('[student-data] firebase not loaded'); return; }
  if (!firebase.auth) { console.error('[student-data] firebase-auth-compat missing'); return; }
  var auth = firebase.auth();
  var db   = firebase.firestore();
  var QB   = root.QuestionBank || null;

  function serverTs(){ return firebase.firestore.FieldValue.serverTimestamp(); }

  var Student = {
    auth: auth,
    db: db,

    /* -------- Auth -------- */
    onChange: function (cb) { return auth.onAuthStateChanged(cb); },
    currentUser: function () { return auth.currentUser; },

    register: async function (data) {
      var cred = await auth.createUserWithEmailAndPassword(data.email, data.password);
      var uid = cred.user.uid;
      await cred.user.updateProfile({ displayName: data.name });
      await db.collection('students').doc(uid).set({
        uid: uid,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        className: data.className || '',
        school: data.school || '',
        city: data.city || '',
        state: data.state || '',
        blocked: false,
        createdAt: serverTs(),
        updatedAt: serverTs()
      });
      return uid;
    },

    login: async function (email, password) {
      var cred = await auth.signInWithEmailAndPassword(email, password);
      // check blocked
      var snap = await db.collection('students').doc(cred.user.uid).get();
      if (snap.exists && snap.data().blocked) {
        await auth.signOut();
        throw new Error('Your account has been blocked. Please contact admin.');
      }
      return cred.user;
    },

    logout: function () { return auth.signOut(); },

    forgotPassword: function (email) { return auth.sendPasswordResetEmail(email); },

    /* -------- Profile -------- */
    getProfile: async function (uid) {
      var s = await db.collection('students').doc(uid).get();
      return s.exists ? Object.assign({ id: s.id }, s.data()) : null;
    },
    updateProfile: async function (uid, data) {
      var payload = {};
      ['name','phone','className','school','city','state'].forEach(function(k){
        if (data[k] !== undefined) payload[k] = data[k];
      });
      payload.updatedAt = serverTs();
      await db.collection('students').doc(uid).set(payload, { merge: true });
      if (data.name && auth.currentUser) {
        try { await auth.currentUser.updateProfile({ displayName: data.name }); } catch(e){}
      }
    },

    /* -------- Live Tests (ACTIVE / published only) -------- */
    listActiveTests: async function () {
      var snap = await db.collection('live_tests').where('isPublished','==',true).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = a.startAt && a.startAt.toMillis ? a.startAt.toMillis() : 0;
        var bx = b.startAt && b.startAt.toMillis ? b.startAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    getTest: async function (id) {
      var s = await db.collection('live_tests').doc(id).get();
      return s.exists ? Object.assign({id:s.id}, s.data()) : null;
    },
    getTestQuestions: async function (test) {
      // Use the same Question Bank loader as Practice Tests and Admin Live Tests.
      if (QB && QB.getQuestionsForTest) {
        var shared = await QB.getQuestionsForTest(test || {});
        return QB.toLetterQuestion ? shared.map(QB.toLetterQuestion) : shared;
      }
      var snap = await db.collection('questions').get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      if (test && (test.classId || test.subjectId || test.chapterId)) {
        arr = arr.filter(function(q){
          var cls = q.classId || q.cls || q.class || q.className || '';
          var sub = q.subjectId || q.subject || q.subjectKey || '';
          var ch  = q.chapterId || q.chapter || q.chapterKey || q.chapterNo || '';
          return (!test.classId || cls === test.classId) &&
                 (!test.subjectId || sub === test.subjectId) &&
                 (!test.chapterId || ch === test.chapterId);
        });
      }
      // shuffle
      for (var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
      var n = Number(test.totalQuestions) || arr.length;
      return arr.slice(0, n);
    },

    /* -------- Attempts / Results -------- */
    hasAttempted: async function (testId, uid) {
      var s = await db.collection('live_tests').doc(testId)
        .collection('attempts').doc(uid).get();
      return s.exists;
    },
    submitAttempt: async function (payload) {
      var uid = payload.studentId;
      var ref = await db.collection('student_attempts').add(
        Object.assign({}, payload, { submittedAt: serverTs() })
      );
      // marker doc to enforce single attempt per test
      await db.collection('live_tests').doc(payload.testId)
        .collection('attempts').doc(uid).set({
          attemptId: ref.id,
          score: payload.score,
          percent: payload.percent,
          submittedAt: serverTs()
        });
      return ref.id;
    },
    myResults: async function (uid) {
      var snap = await db.collection('student_attempts')
        .where('studentId','==',uid).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0;
        var bx = b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    getAttempt: async function (id) {
      var s = await db.collection('student_attempts').doc(id).get();
      return s.exists ? Object.assign({id:s.id}, s.data()) : null;
    },
    leaderboard: async function (testId, topN) {
      var snap = await db.collection('student_attempts')
        .where('testId','==',testId).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        if ((b.score||0)!==(a.score||0)) return (b.score||0)-(a.score||0);
        return (a.durationSec||0)-(b.durationSec||0);
      });
      return arr.slice(0, topN || 50);
    },

    /* -------- Admin: student management -------- */
    listStudents: async function () {
      var snap = await db.collection('students').get();
      return snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    },
    setBlocked: function (uid, blocked) {
      return db.collection('students').doc(uid).set(
        { blocked: !!blocked, updatedAt: serverTs() }, { merge: true }
      );
    },
    deleteStudentDoc: function (uid) {
      return db.collection('students').doc(uid).delete();
    },
    resultsByStudent: async function (uid) {
      var snap = await db.collection('student_attempts')
        .where('studentId','==',uid).get();
      return snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    }
  };

  root.Student = Student;
})(window);
