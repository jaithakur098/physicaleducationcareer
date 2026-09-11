/* ============================================================================
   Bulk Delete — Question Bank (Admin)
   Non-invasive overlay: injects a toolbar and checkboxes into the existing
   question list. It looks for a container marked with any of:
      #questionList | [data-qbank-list] | .qbank-list | #qbList
   and rows marked with `data-qid` (or containing a delete button with data-qid).
   Requires: firebase (compat), config/admin-data.js OR direct `questions` collection,
             js/pec-upgrades.js (for PEC.confirm & PEC.toast)
   Enable by adding <script src="js/admin-bulk-delete.js" defer></script> to admin.html.
   ============================================================================ */
(function(){
  'use strict';
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  function findList(){
    return document.querySelector('#questionList, [data-qbank-list], .qbank-list, #qbList, #questionsTable tbody');
  }

  function collectRows(list){
    // Rows are <tr> with data-qid, or elements with data-qid, or nearest ancestor to a delete btn.
    var rows = Array.prototype.slice.call(list.querySelectorAll('[data-qid]'));
    if (!rows.length){
      rows = Array.prototype.slice.call(list.querySelectorAll('tr, .q-item, .question-row'))
        .filter(function(r){ return r.querySelector('[data-qid], [data-delete-qid], [data-action="delete-question"]'); });
      rows.forEach(function(r){
        var b = r.querySelector('[data-qid], [data-delete-qid]');
        if (b) r.setAttribute('data-qid', b.getAttribute('data-qid') || b.getAttribute('data-delete-qid'));
      });
    }
    return rows;
  }

  function injectCheckboxes(list){
    var rows = collectRows(list);
    rows.forEach(function(r){
      if (r.querySelector('.pec-bulk-cb')) return;
      var qid = r.getAttribute('data-qid'); if(!qid) return;
      var cell = document.createElement(r.tagName==='TR' ? 'td' : 'span');
      cell.className='pec-bulk-cell';
      cell.innerHTML = '<input type="checkbox" class="pec-bulk-cb" data-qid="'+qid+'" style="width:18px;height:18px;cursor:pointer;accent-color:#d4af37">';
      r.insertBefore(cell, r.firstChild);
    });
  }

  function selected(list){
    return Array.prototype.slice.call(list.querySelectorAll('.pec-bulk-cb:checked'))
      .map(function(cb){ return cb.getAttribute('data-qid'); });
  }

  function buildToolbar(list){
    if (document.getElementById('pecBulkBar')) return;
    var bar = document.createElement('div');
    bar.id='pecBulkBar';
    bar.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 14px;margin:10px 0;background:#0f2148;border:1px solid #d4af37;border-radius:10px;color:#fff;font-family:Inter,sans-serif';
    bar.innerHTML = ''
      + '<strong style="color:#d4af37">Bulk Actions:</strong>'
      + '<button class="pec-btn" data-a="all">Select All</button>'
      + '<button class="pec-btn" data-a="none">Unselect All</button>'
      + '<button class="pec-btn danger" data-a="del"><i class="fa-solid fa-trash"></i> Delete Selected</button>'
      + '<span id="pecBulkCount" style="margin-left:auto;color:#dbe4ff">0 selected</span>';
    list.parentNode.insertBefore(bar, list);

    function updateCount(){
      var n = list.querySelectorAll('.pec-bulk-cb:checked').length;
      var el = document.getElementById('pecBulkCount'); if(el) el.textContent = n+' selected';
    }
    list.addEventListener('change', function(e){ if(e.target.classList.contains('pec-bulk-cb')) updateCount(); });

    bar.addEventListener('click', async function(e){
      var b = e.target.closest('[data-a]'); if(!b) return;
      var act = b.getAttribute('data-a');
      var boxes = list.querySelectorAll('.pec-bulk-cb');
      if (act==='all'){ boxes.forEach(function(c){ c.checked=true; }); updateCount(); return; }
      if (act==='none'){ boxes.forEach(function(c){ c.checked=false; }); updateCount(); return; }
      if (act==='del'){
        var ids = selected(list);
        if (!ids.length){ window.PEC && PEC.toast('No questions selected', 'err'); return; }
        var ok = await (window.PEC ? PEC.confirm('Delete '+ids.length+' selected question(s)? This cannot be undone.', { danger:true, ok:'Delete', title:'Delete Selected Questions' }) : Promise.resolve(confirm('Delete '+ids.length+' selected question(s)?')));
        if (!ok) return;
        await bulkDelete(ids);
      }
    });
  }

  async function bulkDelete(ids){
    if (typeof firebase === 'undefined'){ alert('Firebase not loaded'); return; }
    var db = firebase.firestore();
    var col = 'questions';
    var chunk = 400; // Firestore batch limit is 500
    var done = 0, failed = 0;
    try {
      for (var i=0;i<ids.length;i+=chunk){
        var batch = db.batch();
        var slice = ids.slice(i, i+chunk);
        slice.forEach(function(id){ batch.delete(db.collection(col).doc(id)); });
        await batch.commit();
        done += slice.length;
      }
    } catch(e){
      failed = ids.length - done;
      console.error('[bulk-delete] error', e);
    }
    if (window.PEC) PEC.toast('Deleted '+done+(failed?(' — '+failed+' failed'):'')+' question(s)', failed?'err':'ok');
    // Refresh list — try known reload hooks first.
    if (window.AdminUI && typeof AdminUI.reloadQuestions==='function') AdminUI.reloadQuestions();
    else if (typeof window.loadQuestions==='function') window.loadQuestions();
    else if (typeof window.refreshQuestionBank==='function') window.refreshQuestionBank();
    else location.reload();
  }

  function init(){
    var list = findList();
    if (!list) return;
    buildToolbar(list);
    injectCheckboxes(list);
    // Watch for future re-renders and re-inject checkboxes.
    var mo = new MutationObserver(function(){ injectCheckboxes(list); });
    mo.observe(list, { childList:true, subtree:true });
  }

  ready(init);
})();
