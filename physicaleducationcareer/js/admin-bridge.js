/* admin-bridge.js
 * Bridges admin-created questions (localStorage) into the student test engines.
 * Include on any student test page BEFORE the engine script:
 *   <script src="../js/admin-bridge.js"></script>
 *   <script>window.__PE_CONTEXT__ = { classKey:'class11', subjectKey:'physicalEducation', chapterKey:'chapter1', type:'MCQ' };</script>
 *   <script type="module" src="../js/mcq-engine.js"></script>
 *
 * Public API:
 *   window.LS_ADMIN_KEY                      - localStorage key used by admin
 *   window.loadAdminQuestions(cls,sub,ch,type) -> array of engine-shaped questions
 *   window.installAdminQuestionBank(ctx)     - sets window.questionBank if admin has questions for ctx
 */
(function () {
  var LS_KEY = 'pe_question_bank_v2';
  window.LS_ADMIN_KEY = LS_KEY;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function toEngineShape(q) {
    // MCQ engine expects: { q, options:[A,B,C,D], answer:0..3, explanation }
    // Theory engine expects: { q, a (model answer), explanation }
    if (q.type === 'Theory') {
      return { q: q.question, a: q.answer || q.explanation || '', explanation: q.explanation || '' };
    }
    var idx = ({ A: 0, B: 1, C: 2, D: 3 })[(q.correct || 'A').toUpperCase()] || 0;
    return {
      q: q.question,
      options: [q.a || '', q.b || '', q.c || '', q.d || ''],
      answer: idx,
      explanation: q.explanation || '',
      marks: q.marks || 1,
      difficulty: q.difficulty || 'Medium'
    };
  }

  window.loadAdminQuestions = function (classKey, subjectKey, chapterKey, type) {
    return readAll()
      .filter(function (q) {
        return q.classKey === classKey &&
               q.subjectKey === subjectKey &&
               q.chapterKey === chapterKey &&
               (!type || q.type === type);
      })
      .map(toEngineShape);
  };

  window.installAdminQuestionBank = function (ctx) {
    if (!ctx) ctx = window.__PE_CONTEXT__ || {};
    var qs = window.loadAdminQuestions(ctx.classKey, ctx.subjectKey, ctx.chapterKey, ctx.type);
    if (qs.length) {
      window.questionBank = qs;
    }
    return qs.length;
  };

  // Auto-install if a context was supplied
  if (window.__PE_CONTEXT__) window.installAdminQuestionBank();
})();
