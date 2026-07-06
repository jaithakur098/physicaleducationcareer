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

  /* -------------------------------------------------------------------
     normalizeQuestion(raw) — turns ANY imported row (CSV / Excel / JSON,
     any alias set) into the exact same schema manual questions use.
     Guarantees: question, a, b, c, d, correct (A|B|C|D), examType,
     explanation, difficulty, marks, tags PLUS both legacy (cls/subject/
     chapter) and modern (classId/subjectId/chapterId) keys.
  ------------------------------------------------------------------- */
  function firstNonEmpty(o, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return '';
  }
  function asString(v) { return v == null ? '' : String(v).trim(); }

  function normalizeQuestion(raw) {
    raw = raw || {};
    // Options — accept a/b/c/d, A/B/C/D, optionA..D, option_a..d, opt1..4, options[]
    var opts = Array.isArray(raw.options) ? raw.options.slice(0, 4) : [];
    function opt(letter, idx) {
      return asString(firstNonEmpty(raw, [
        letter, letter.toUpperCase(),
        'option' + letter.toUpperCase(), 'option_' + letter, 'option' + letter,
        'opt' + (idx + 1), 'option' + (idx + 1),
        'choice' + letter.toUpperCase(), 'choice_' + letter
      ])) || asString(opts[idx] || '');
    }
    var a = opt('a', 0), b = opt('b', 1), c = opt('c', 2), d = opt('d', 3);

    // Correct — accept correct, correctAnswer, correctOption, answer, ans (letter, number, or option-text)
    var rawCorrect = firstNonEmpty(raw, [
      'correct', 'correctAnswer', 'correctOption', 'correct_answer',
      'answer', 'Answer', 'ans', 'correctIndex'
    ]);
    var letters = ['A', 'B', 'C', 'D'];
    var correct = 'A';
    if (typeof rawCorrect === 'number') {
      var n = rawCorrect;
      if (n >= 1 && n <= 4) correct = letters[n - 1];
      else if (n >= 0 && n <= 3) correct = letters[n];
    } else {
      var s = asString(rawCorrect);
      if (/^[a-dA-D]$/.test(s)) correct = s.toUpperCase();
      else if (/^[1-4]$/.test(s)) correct = letters[Number(s) - 1];
      else if (/^[0-3]$/.test(s)) correct = letters[Number(s)];
      else if (s) {
        var pos = [a, b, c, d].map(function (x) { return asString(x).toLowerCase(); }).indexOf(s.toLowerCase());
        if (pos >= 0) correct = letters[pos];
      }
    }

    var cls     = asString(firstNonEmpty(raw, ['cls', 'class', 'Class', 'className', 'classId', 'ClassId']));
    var subject = asString(firstNonEmpty(raw, ['subject', 'Subject', 'subjectId', 'SubjectId', 'subjectKey']));
    var chapter = asString(firstNonEmpty(raw, ['chapter', 'Chapter', 'chapterId', 'ChapterId', 'chapterKey', 'chapterNo', 'ChapterNo']));

    var question = asString(firstNonEmpty(raw, ['question', 'Question', 'q', 'text', 'questionText']));
    var explanation = asString(firstNonEmpty(raw, ['explanation', 'Explanation', 'reason', 'solution']));
    var difficulty = asString(firstNonEmpty(raw, ['difficulty', 'Difficulty', 'level'])) || 'Easy';
    var examType = asString(firstNonEmpty(raw, ['examType', 'ExamType', 'type', 'Type', 'questionType'])) || 'MCQ';
    var tags = asString(firstNonEmpty(raw, ['tags', 'Tags', 'tag']));
    var marks = Number(firstNonEmpty(raw, ['marks', 'Marks', 'mark', 'points'])) || 1;

    // Guard: only swap when the field OBVIOUSLY holds question text.
    // Chapter/subject titles can be long ("Fundamentals of Anatomy, Physiology
    // & Kinesiology"), so we only treat a value as question text when it has
    // a question mark, is very long (>120 chars) or has many words (>15).
    function looksLikeQuestion(v) {
      if (!v) return false;
      var s = String(v);
      if (/[?]/.test(s)) return true;
      if (s.length > 120) return true;
      if (s.split(/\s+/).length > 15) return true;
      return false;
    }
    if (!question && looksLikeQuestion(cls))     { question = cls; cls = ''; }
    if (!question && looksLikeQuestion(subject)) { question = subject; subject = ''; }
    if (!question && looksLikeQuestion(chapter)) { question = chapter; chapter = ''; }
    if (looksLikeQuestion(cls))     cls = '';
    if (looksLikeQuestion(subject)) subject = '';
    if (looksLikeQuestion(chapter)) chapter = '';

    return {
      question: question,
      a: a, b: b, c: c, d: d,
      correct: correct,
      examType: examType,
      explanation: explanation,
      difficulty: difficulty,
      marks: marks,
      tags: tags,
      // dual-write both key styles for full backward compatibility
      cls: cls, classId: cls,
      subject: subject, subjectId: subject,
      chapter: chapter, chapterId: chapter
    };
  }

  function validateNormalized(q) {
    if (!q.question) return 'missing question text';
    var filled = [q.a, q.b, q.c, q.d].filter(function (x) { return asString(x) !== ''; }).length;
    if (filled < 2) return 'need at least 2 options (A–D)';
    if (['A','B','C','D'].indexOf(q.correct) === -1) return 'invalid correct answer';
    if (asString(q[q.correct.toLowerCase()]) === '') return 'correct answer points to an empty option';
    if (!q.cls)     return 'missing class';
    if (!q.subject) return 'missing subject';
    if (!q.chapter) return 'missing chapter';
    return '';
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
    validateNormalized: validateNormalized
  };
})(window);

