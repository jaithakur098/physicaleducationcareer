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
  // Lazy QB lookup — script order between question-bank.js and student-data.js
  // no longer matters. Whoever loads first wins; the second script is picked
  // up when the first function needing it is called.
  function getQB(){ return root.QuestionBank || null; }

  try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch(e){}

  function serverTs(){ return firebase.firestore.FieldValue.serverTimestamp(); }

  function friendlyAuthError(err) {
    var code = err && err.code ? String(err.code) : '';
    var map = {
      'auth/quota-exceeded'      : 'Too many sign-in attempts right now. Please wait a few minutes and try again.',
      'auth/too-many-requests'   : 'Too many sign-in attempts from this device. Please wait a few minutes and try again.',
      'auth/invalid-email'       : 'That email address looks invalid. Please check and try again.',
      'auth/user-disabled'       : 'This account has been disabled. Please contact the admin.',
      'auth/user-not-found'      : 'No account found for that email. Please register first.',
      'auth/wrong-password'      : 'Incorrect password. Please try again or reset it.',
      'auth/invalid-credential'  : 'Incorrect email or password. Please try again.',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
      'auth/weak-password'       : 'Password is too weak. Please choose at least 6 characters.',
      'auth/operation-not-allowed': 'Email/password sign-in is currently disabled. Please contact the admin.'
    };
    var friendly = new Error(map[code] || (err && err.message) || 'Sign-in failed. Please try again.');
    friendly.code = code;
    return friendly;
  }


  var Student = {
    auth: auth,
    db: db,

    /* -------- Auth -------- */
    onChange: function (cb) { return auth.onAuthStateChanged(cb); },
    currentUser: function () { return auth.currentUser; },

    register: async function (data) {
      try {
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
      } catch (e) { throw friendlyAuthError(e); }
    },

    login: async function (email, password) {
      try {
        var cred = await auth.signInWithEmailAndPassword(email, password);
        var snap = await db.collection('students').doc(cred.user.uid).get();
        if (snap.exists && snap.data().blocked) {
          await auth.signOut();
          throw new Error('Your account has been blocked. Please contact admin.');
        }
        return cred.user;
      } catch (e) {
        if (e && e.code && String(e.code).indexOf('auth/') === 0) throw friendlyAuthError(e);
        throw e;
      }
    },

    logout: function () { return auth.signOut(); },

    forgotPassword: function (email) {
      return auth.sendPasswordResetEmail(email).catch(function(e){ throw friendlyAuthError(e); });
    },


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
      // Published-only, no orderBy on the query (avoids composite-index requirement
      // and prevents docs missing the ordering field from being dropped).
      var snap = await db.collection('live_tests').where('isPublished','==',true).get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      arr.sort(function(a,b){
        var ax = (a.startAt && a.startAt.toMillis) ? a.startAt.toMillis()
               : (a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0);
        var bx = (b.startAt && b.startAt.toMillis) ? b.startAt.toMillis()
               : (b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0);
        return bx - ax;
      });
      try { console.log('[student-data] listActiveTests ->', arr.length, 'published live tests'); } catch(_) {}
      return arr;
    },
    getTest: async function (id) {
      var s = await db.collection('live_tests').doc(id).get();
      return s.exists ? Object.assign({id:s.id}, s.data()) : null;
    },
    getTestQuestions: async function (test) {
      // ALWAYS route through the shared Question Bank loader when available so
      // Practice / Live / Admin all agree on which questions match. The lookup
      // is lazy so script order between question-bank.js and student-data.js
      // no longer breaks live tests.
      var QB = getQB();
      if (QB && QB.getQuestionsForTest) {
        var shared = await QB.getQuestionsForTest(test || {});
        return QB.toLetterQuestion ? shared.map(QB.toLetterQuestion) : shared;
      }
      // Fallback path (should rarely trigger). Use the same loose matching
      // used by QuestionBank so legacy / bulk-imported rows still match.
      var snap = await db.collection('questions').get();
      var arr = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
      function n(v){ return v==null?'':String(v).trim().toLowerCase(); }
      arr = arr.filter(function(q){
        var cls = q.classId || q.cls || q.class || q.className || '';
        var sub = q.subjectId || q.subject || q.subjectKey || '';
        var ch  = q.chapterId || q.chapter || q.chapterKey || q.chapterNo || '';
        return (!test.classId   || n(cls)===n(test.classId)) &&
               (!test.subjectId || n(sub)===n(test.subjectId)) &&
               (!test.chapterId || n(ch)===n(test.chapterId));
      });
      for (var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
      var num = Number(test.totalQuestions) || arr.length;
      return arr.slice(0, num);
    },

    /* -------- Attempts / Results -------- */
    hasAttempted: async function (testId, uid) {
      var s = await db.collection('live_tests').doc(testId)
        .collection('attempts').doc(uid).get();
      return s.exists;
    },
    submitAttempt: async function (payload) {
      var uid = payload.studentId;
      // Every new submission enters admin verification workflow as `pending`.
      var doc = Object.assign({ status: 'pending', type: 'live' }, payload, { submittedAt: serverTs() });
      var ref = await db.collection('student_attempts').add(doc);
      await db.collection('live_tests').doc(payload.testId)
        .collection('attempts').doc(uid).set({
          attemptId: ref.id,
          score: payload.score,
          percent: payload.percent,
          status: 'pending',
          submittedAt: serverTs()
        });
      return ref.id;
    },
    // Reports: EVERY completed attempt (both Live and Practice), newest first.
    myResults: async function (uid) {
      var live = db.collection('student_attempts').where('studentId','==',uid).get();
      var prac = db.collection('practice_attempts').where('studentId','==',uid).get();
      var res = await Promise.all([live, prac.catch(function(){ return { docs: [] }; })]);
      var arr = [];
      res[0].docs.forEach(function(d){ arr.push(Object.assign({id:d.id, type:'live'},  d.data())); });
      res[1].docs.forEach(function(d){ arr.push(Object.assign({id:d.id, type:'practice'}, d.data())); });
      arr.sort(function(a,b){
        var ax = a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0;
        var bx = b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0;
        return bx - ax;
      });
      return arr;
    },
    getAttempt: async function (id) {
      var s = await db.collection('student_attempts').doc(id).get();
      if (s.exists) return Object.assign({ id: s.id, type: 'live' }, s.data());
      // Fallback: certificate/result pages sometimes receive practice attempt ids.
      var p = await db.collection('practice_attempts').doc(id).get();
      return p.exists ? Object.assign({ id: p.id, type: 'practice' }, p.data()) : null;
    },
    // Leaderboard shows APPROVED attempts only. Pending/rejected are hidden.
    leaderboard: async function (testId, topN) {
      var snap = await db.collection('student_attempts')
        .where('testId','==',testId).get();
      var arr = snap.docs
        .map(function(d){ return Object.assign({id:d.id}, d.data()); })
        .filter(function(r){ return (r.status||'pending') === 'approved'; });
      arr.sort(function(a,b){
        if ((b.score||0)!==(a.score||0)) return (b.score||0)-(a.score||0);
        return (a.durationSec||0)-(b.durationSec||0);
      });
      return arr.slice(0, topN || 50);
    },

    /* -------- Admin: pending attempts approval workflow -------- */
    // Return every attempt (live + practice) with the requested status.
    // status = 'pending' | 'approved' | 'rejected'
    listAttemptsByStatus: async function (status) {
      status = status || 'pending';
      var all = [];
      var liveSnap = await db.collection('student_attempts').get();
      liveSnap.docs.forEach(function(d){
        var v = d.data(); if ((v.status||'pending') !== status) return;
        all.push(Object.assign({ id: d.id, _col: 'student_attempts', type: v.type || 'live' }, v));
      });
      try {
        var pracSnap = await db.collection('practice_attempts').get();
        pracSnap.docs.forEach(function(d){
          var v = d.data(); if ((v.status||'pending') !== status) return;
          all.push(Object.assign({ id: d.id, _col: 'practice_attempts', type: v.type || 'practice' }, v));
        });
      } catch(_){}
      all.sort(function(a,b){
        var ax = a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0;
        var bx = b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0;
        return bx - ax;
      });
      return all;
    },
    setAttemptStatus: async function (col, id, status) {
      col = col || 'student_attempts';
      await db.collection(col).doc(id).set(
        { status: status, reviewedAt: serverTs() }, { merge: true }
      );
      // Mirror status onto the live_tests/{tid}/attempts/{uid} marker doc.
      if (col === 'student_attempts') {
        try {
          var s = await db.collection('student_attempts').doc(id).get();
          if (s.exists) {
            var v = s.data();
            if (v.testId && v.studentId) {
              await db.collection('live_tests').doc(v.testId)
                .collection('attempts').doc(v.studentId)
                .set({ status: status }, { merge: true });
            }
          }
        } catch(_){}
      }
    },
    approveAttempt: function (col, id) { return this.setAttemptStatus(col, id, 'approved'); },
    rejectAttempt:  function (col, id) { return this.setAttemptStatus(col, id, 'rejected'); },

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
