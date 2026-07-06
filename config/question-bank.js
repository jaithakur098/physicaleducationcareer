/* ============================================================================
   SHARED QUESTION BANK LOADER
   Single matching / loading helper for Question Bank, Practice Tests and Live Tests.
   Supports legacy and current question fields without requiring manual re-save.

   ROOT-CAUSE FIX (v3):
   -----------------------------------------------------------------------------
   Bulk-imported questions were being stored with whatever field names the
   CSV / Excel / JSON file happened to use (optionA, option_a, options[],
   answer, correctAnswer, correctOption, classId, chapterKey, ...). Manually
   created questions on the other hand were always saved as
   { cls, subject, chapter, a, b, c, d, correct: 'A'|'B'|'C'|'D' }.

   Because the Question Bank UI, Practice Test engine and Live Test engine
   all read `q.a / q.b / q.c / q.d` and `q.correct`, imported rows displayed
   with empty option text and wrong / missing answers until the admin opened
   Edit and pressed Save (which happened to canonicalise the record on the
   way out).

   The fix has two layers so old data keeps working AND new imports write
   the exact same schema as manual questions:

     1. `QuestionBank.normalizeQuestion(raw)` converts ANY legacy shape to
        the canonical shape. Used by the bulk-import path and by
        saveQuestion / updateQuestion in admin-data.js.
     2. `optionValue()` and `correctIndex()` fall back to every known alias
        so already-imported documents still render correctly before an
        admin runs "Repair / Migrate All Questions".
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
    return pick(q, 'classId', 'cls', 'class', 'className', 'Class');
  }

  function extractSubject(q) {
    return pick(q, 'subjectId', 'subject', 'subjectKey', 'Subject');
  }

  function extractChapter(q) {
    return pick(q, 'chapterId', 'chapter', 'chapterKey', 'chapterNo', 'Chapter');
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

  /* ---------------- Option / answer helpers ---------------- */
  // Alias groups for each option letter. Order matters — first non-empty wins.
  var OPTION_ALIASES = {
    a: ['a', 'A', 'optionA', 'option_a', 'optiona', 'opt_a', 'optA', 'OptionA', 'Option_A', 'OPTION_A', 'choiceA', 'choice_a'],
    b: ['b', 'B', 'optionB', 'option_b', 'optionb', 'opt_b', 'optB', 'OptionB', 'Option_B', 'OPTION_B', 'choiceB', 'choice_b'],
    c: ['c', 'C', 'optionC', 'option_c', 'optionc', 'opt_c', 'optC', 'OptionC', 'Option_C', 'OPTION_C', 'choiceC', 'choice_c'],
    d: ['d', 'D', 'optionD', 'option_d', 'optiond', 'opt_d', 'optD', 'OptionD', 'Option_D', 'OPTION_D', 'choiceD', 'choice_d']
  };
  var LETTERS = ['a', 'b', 'c', 'd'];

  function optionValue(q, key, idx) {
    q = q || {};
    var aliases = OPTION_ALIASES[key] || [key];
    for (var i = 0; i < aliases.length; i++) {
      var v = q[aliases[i]];
      if (v !== undefined && v !== null && String(v) !== '') return v;
    }
    if (Array.isArray(q.options) && q.options[idx] !== undefined && q.options[idx] !== null && String(q.options[idx]) !== '') {
      return q.options[idx];
    }
    // Options as an object keyed by letter { A: '...', B: '...' }
    if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
      var letter = key.toLowerCase();
      var candidates = [letter, letter.toUpperCase(), String(idx), String(idx + 1)];
      for (var j = 0; j < candidates.length; j++) {
        var w = q.options[candidates[j]];
        if (w !== undefined && w !== null && String(w) !== '') return w;
      }
    }
    return '';
  }

  function correctIndex(q) {
    q = q || {};
    var raw = pick(q, 'answer', 'correct', 'correctAnswer', 'correctOption', 'Answer', 'Correct', 'CorrectAnswer', 'ans');
    if (typeof raw === 'number') return raw >= 1 && raw <= 4 ? raw - 1 : raw;
    var s = norm(raw);
    if (!s) return 0;
    if (/^[a-d]$/.test(s)) return s.charCodeAt(0) - 97;
    if (/^[1-4]$/.test(s)) return Number(s) - 1;
    if (/^[0-3]$/.test(s)) return Number(s);
    // Match the raw string against option text.
    var opts = LETTERS.map(function (k, i) { return norm(optionValue(q, k, i)); });
    var pos = opts.indexOf(s);
    return pos >= 0 ? pos : 0;
  }

  function questionText(q) {
    return pick(q || {}, 'question', 'Question', 'q', 'text', 'title') || '';
  }

  function toLetterQuestion(q) {
    q = q || {};
    var idx = correctIndex(q);
    return Object.assign({}, q, {
      question: questionText(q),
      a: optionValue(q, 'a', 0),
      b: optionValue(q, 'b', 1),
      c: optionValue(q, 'c', 2),
      d: optionValue(q, 'd', 3),
      correct: (LETTERS[idx] || 'a').toUpperCase()
    });
  }

  function toEngineQuestion(q) {
    var lq = toLetterQuestion(q);
    return Object.assign({}, q, {
      question: lq.question,
      options: [lq.a, lq.b, lq.c, lq.d],
      answer: correctIndex(lq)
    });
  }

  /* ---------------- Canonical normaliser ----------------
     Turns ANY incoming record (manual form, CSV, Excel, JSON, legacy Firestore
     doc) into the exact schema used by manual questions so every downstream
     consumer (Question Bank UI, Practice Test, Live Test) works identically.
  ------------------------------------------------------- */
  function normalizeQuestion(raw) {
    raw = raw || {};
    var idx = correctIndex(raw);

    var out = {
      question:    questionText(raw),
      a:           optionValue(raw, 'a', 0),
      b:           optionValue(raw, 'b', 1),
      c:           optionValue(raw, 'c', 2),
      d:           optionValue(raw, 'd', 3),
      correct:     (LETTERS[idx] || 'a').toUpperCase(),
      examType:    pick(raw, 'examType', 'type', 'Type', 'questionType') || 'MCQ',
      explanation: pick(raw, 'explanation', 'Explanation', 'reason', 'solution') || '',
      difficulty:  pick(raw, 'difficulty', 'Difficulty', 'level') || 'Easy',
      marks:       Number(pick(raw, 'marks', 'Marks', 'mark', 'points')) || 1,
      tags:        pick(raw, 'tags', 'Tags') || ''
    };

    // Class / subject / chapter — write BOTH legacy and modern names so every
    // consumer (old queries using cls/subject/chapter and new ones using
    // classId/subjectId/chapterId) matches without any migration step.
    var cls     = String(extractClass(raw)   || '').trim();
    var subject = String(extractSubject(raw) || '').trim();
    var chapter = String(extractChapter(raw) || '').trim();
    if (cls)     { out.cls = cls;         out.classId   = cls; }
    if (subject) { out.subject = subject; out.subjectId = subject; }
    if (chapter) { out.chapter = chapter; out.chapterId = chapter; }

    // Preserve id if the caller supplied one (e.g. update path)
    if (raw.id) out.id = raw.id;
    return out;
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
    toEngineQuestion: toEngineQuestion,
    normalizeQuestion: normalizeQuestion,
    optionValue: optionValue,
    correctIndex: correctIndex,
    questionText: questionText,
    extractClass: extractClass,
    extractSubject: extractSubject,
    extractChapter: extractChapter
  };
})(window);
