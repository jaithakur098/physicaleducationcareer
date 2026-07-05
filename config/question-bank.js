/* ============================================================================
   SHARED QUESTION BANK LOADER
   Single matching / loading helper for Question Bank, Practice Tests and Live Tests.
   Supports legacy and current question fields without requiring manual re-save.
   ============================================================================ */
(function (root) {
  'use strict';

  function norm(v) {
    return v == null ? '' : String(v).trim().toLowerCase();
  }

  function slug(v) {
    return norm(v).replace(/[\s_]+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  function compact(v) {
    return norm(v).replace(/[\s_\-]+/g, '');
  }

  function variants(v) {
    var s = norm(v);
    if (!s) return [];
    var out = [s, slug(s), compact(s)];
    var seps = ['__', '/', '::', '|', ':'];
    for (var i = 0; i < seps.length; i++) {
      if (s.indexOf(seps[i]) !== -1) {
        var parts = s.split(seps[i]).filter(Boolean);
        if (parts.length) {
          out.push(parts[0]);
          out.push(parts[parts.length - 1]);
          out.push(slug(parts[parts.length - 1]));
          out.push(compact(parts[parts.length - 1]));
        }
      }
    }
    var mCls = s.match(/^class[\s_-]*(\d+)$/);
    if (mCls) out.push(mCls[1], 'class' + mCls[1]);
    else if (/^\d+$/.test(s)) out.push('class' + s);
    var mCh = s.match(/^(?:chapter|ch)[\s_-]*(\d+)$/);
    if (mCh) out.push(mCh[1], 'chapter' + mCh[1], 'ch' + mCh[1]);
    return out.filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  }

  function anyEqual(aList, bList) {
    for (var i = 0; i < aList.length; i++) {
      for (var j = 0; j < bList.length; j++) {
        if (aList[i] === bList[j]) return true;
      }
    }
    return false;
  }

  function pick(o) {
    o = o || {};
    for (var i = 1; i < arguments.length; i++) {
      var k = arguments[i];
      if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
    }
    return '';
  }

  function extractClass(q) {
    return pick(q, 'classId', 'cls', 'class', 'className');
  }

  function extractSubject(q) {
    return pick(q, 'subjectId', 'subject', 'subjectKey');
  }

  function extractChapter(q) {
    return pick(q, 'chapterId', 'chapter', 'chapterKey', 'chapterNo');
  }

  function questionMatches(q, classId, subjectId, chapterId) {
    if (classId && !anyEqual(variants(extractClass(q)), variants(classId))) {
      return { ok: false, reason: 'class mismatch (question=' + extractClass(q) + ' vs test=' + classId + ')' };
    }
    if (subjectId && !anyEqual(variants(extractSubject(q)), variants(subjectId))) {
      return { ok: false, reason: 'subject mismatch (question=' + extractSubject(q) + ' vs test=' + subjectId + ')' };
    }
    if (chapterId && !anyEqual(variants(extractChapter(q)), variants(chapterId))) {
      return { ok: false, reason: 'chapter mismatch (question=' + extractChapter(q) + ' vs test=' + chapterId + ')' };
    }
    return { ok: true };
  }

  function filterQuestions(all, classId, subjectId, chapterId, label) {
    all = all || [];
    var matched = [];
    var rejected = [];
    for (var i = 0; i < all.length; i++) {
      var q = all[i] || {};
      var r = questionMatches(q, classId, subjectId, chapterId);
      if (r.ok) matched.push(q);
      else rejected.push({ id: q.id, reason: r.reason, cls: extractClass(q), subject: extractSubject(q), chapter: extractChapter(q) });
    }
    try {
      console.groupCollapsed('[question-bank] ' + (label || 'filter') + ' — ' + matched.length + ' / ' + all.length + ' matched');
      console.log('selector', { classId: classId, subjectId: subjectId, chapterId: chapterId });
      console.log('matched questions:', matched.length, matched);
      console.log('rejected questions:', rejected.length, rejected);
      console.groupEnd();
    } catch (_) {}
    return matched;
  }

  async function fetchAllQuestions() {
    var firestore = root.db || (root.firebase && root.firebase.firestore ? root.firebase.firestore() : null);
    if (!firestore) throw new Error('Firestore is not initialised');
    var snap = await firestore.collection('questions').get();
    return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
  }

  function shuffle(arr) {
    var a = (arr || []).slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function byQuestionIds(all, ids) {
    var map = {};
    (all || []).forEach(function (q) { if (q && q.id) map[q.id] = q; });
    return (ids || []).map(function (id) { return map[id]; }).filter(Boolean);
  }

  async function listAvailableQuestions(classId, subjectId, chapterId) {
    var all = await fetchAllQuestions();
    return filterQuestions(all, classId, subjectId, chapterId, 'listAvailableQuestions');
  }

  async function getQuestionsForTest(test) {
    test = test || {};
    var all = await fetchAllQuestions();
    var matched = (test.questionIds && test.questionIds.length)
      ? byQuestionIds(all, test.questionIds)
      : filterQuestions(all, test.classId, test.subjectId, test.chapterId, 'getQuestionsForTest');
    if (!(test.questionIds && test.questionIds.length)) matched = shuffle(matched);
    var n = Number(test.totalQuestions) || matched.length;
    return matched.slice(0, n);
  }

  function optionValue(q, key, idx) {
    if (q[key] !== undefined && q[key] !== null && q[key] !== '') return q[key];
    if (q[key.toUpperCase()] !== undefined && q[key.toUpperCase()] !== null && q[key.toUpperCase()] !== '') return q[key.toUpperCase()];
    if (Array.isArray(q.options) && q.options[idx] !== undefined) return q.options[idx];
    return '';
  }

  function correctIndex(q) {
    var raw = q.answer !== undefined ? q.answer : (q.correct !== undefined ? q.correct : q.correctAnswer);
    if (typeof raw === 'number') return raw >= 1 && raw <= 4 ? raw - 1 : raw;
    var s = norm(raw);
    if (!s) return 0;
    if (/^[a-d]$/.test(s)) return s.charCodeAt(0) - 97;
    if (/^[1-4]$/.test(s)) return Number(s) - 1;
    if (/^[0-3]$/.test(s)) return Number(s);
    var opts = ['a', 'b', 'c', 'd'].map(function (k, i) { return norm(optionValue(q, k, i)); });
    var pos = opts.indexOf(s);
    return pos >= 0 ? pos : 0;
  }

  function toLetterQuestion(q) {
    q = q || {};
    var idx = correctIndex(q);
    var letters = ['a', 'b', 'c', 'd'];
    return Object.assign({}, q, {
      a: optionValue(q, 'a', 0),
      b: optionValue(q, 'b', 1),
      c: optionValue(q, 'c', 2),
      d: optionValue(q, 'd', 3),
      correct: letters[idx] || 'a'
    });
  }

  function toEngineQuestion(q) {
    var lq = toLetterQuestion(q);
    return Object.assign({}, q, {
      question: lq.question || '',
      options: [lq.a, lq.b, lq.c, lq.d],
      answer: correctIndex(lq)
    });
  }

  root.QuestionBank = {
    norm: norm,
    variants: variants,
    questionMatches: questionMatches,
    filterQuestions: filterQuestions,
    fetchAllQuestions: fetchAllQuestions,
    listAvailableQuestions: listAvailableQuestions,
    getQuestionsForTest: getQuestionsForTest,
    toLetterQuestion: toLetterQuestion,
    toEngineQuestion: toEngineQuestion
  };
})(window);