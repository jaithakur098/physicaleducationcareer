/* =====================================================================
 * PEEngine – Question Bank Bulk Manager
 * Progressive enhancement of admin.html Question Bank table.
 * Adds: checkbox column, Select All / Unselect All / Delete Selected /
 *       Delete All Filtered / Export Selected / Duplicate Selected /
 *       Validate Selected / Move Selected.
 * No existing code changed — only DOM additions and event hooks.
 * =================================================================== */
(function () {
  if (window.__PECBulkMgrLoaded) return;
  window.__PECBulkMgrLoaded = true;

  var selected = new Set();
  window.PECBulkSelected = selected;

  function $(id) { return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function ensureToolbar() {
    if ($('pecBulkBar')) return;
    var bank = document.querySelector('#bank .table-toolbar');
    if (!bank) return;
    var bar = document.createElement('div');
    bar.id = 'pecBulkBar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;padding:10px 12px;background:rgba(15,33,72,.35);border:1px solid var(--glass-border);border-radius:10px';
    bar.innerHTML =
      '<span id="pecBulkCount" style="font-size:13px;color:var(--ink-mute)">0 selected</span>'+
      '<button class="btn" onclick="PECBulk.selectAll(true)"><i class="fa-solid fa-check-double"></i> Select All</button>'+
      '<button class="btn" onclick="PECBulk.selectAll(false)"><i class="fa-solid fa-xmark"></i> Unselect All</button>'+
      '<button class="btn btn-danger" onclick="PECBulk.deleteSelected()"><i class="fa-solid fa-trash"></i> Delete Selected</button>'+
      '<button class="btn btn-danger" onclick="PECBulk.deleteFiltered()"><i class="fa-solid fa-filter-circle-xmark"></i> Delete All Filtered</button>'+
      '<button class="btn" onclick="PECBulk.exportSelected()"><i class="fa-solid fa-file-export"></i> Export Selected</button>'+
      '<button class="btn" onclick="PECBulk.duplicateSelected()"><i class="fa-solid fa-copy"></i> Duplicate Selected</button>'+
      '<button class="btn" onclick="PECBulk.validateSelected()"><i class="fa-solid fa-shield-halved"></i> Validate Selected</button>';
    bank.parentNode.insertBefore(bar, bank.nextSibling);
  }

  function updateCount() {
    var el = $('pecBulkCount');
    if (el) el.textContent = selected.size + ' selected';
  }

  function decorateTable() {
    var tbody = $('qTableBody'); if (!tbody) return;
    // Add header cell once
    var headRow = document.querySelector('#bank table thead tr');
    if (headRow && !headRow.querySelector('.pec-cb-head')) {
      var th = document.createElement('th');
      th.className = 'pec-cb-head';
      th.style.width = '34px';
      th.innerHTML = '<input type="checkbox" id="pecHeadCb" onclick="PECBulk.selectVisible(this.checked)"/>';
      headRow.insertBefore(th, headRow.firstChild);
    }
    Array.prototype.forEach.call(tbody.rows, function (row) {
      if (row.querySelector('.pec-cb-cell')) return;
      // Find id from an existing edit button
      var btn = row.querySelector('button[onclick^="editRow("]');
      var m = btn && btn.getAttribute('onclick').match(/editRow\('([^']+)'\)/);
      var id = m && m[1];
      var td = document.createElement('td');
      td.className = 'pec-cb-cell';
      td.innerHTML = id ? '<input type="checkbox" data-pecid="'+esc(id)+'"'+(selected.has(id)?' checked':'')+' onclick="PECBulk.toggle(\''+esc(id)+'\',this.checked)"/>' : '';
      row.insertBefore(td, row.firstChild);
      // Fix colspan on empty rows
      var empty = row.querySelector('td.empty');
      if (empty && empty.colSpan) empty.colSpan += 1;
    });
    updateCount();
  }

  function hookRenderTable() {
    if (typeof window.renderTable !== 'function') { setTimeout(hookRenderTable, 300); return; }
    if (window.renderTable.__pecWrapped) return;
    var orig = window.renderTable;
    window.renderTable = function () {
      var r = orig.apply(this, arguments);
      try { ensureToolbar(); decorateTable(); } catch(e){ console.warn('[bulk]', e); }
      return r;
    };
    window.renderTable.__pecWrapped = true;
    try { ensureToolbar(); decorateTable(); } catch(e){}
  }

  function currentFilteredIds() {
    // Read visible rows regardless of page — replicate the current search filter.
    var searchEl = $('tableSearch');
    var search = (searchEl && searchEl.value || '').toLowerCase();
    var qs = window.questions || [];
    return qs.filter(function (q) {
      return !search ||
        (q.question || '').toLowerCase().indexOf(search) !== -1 ||
        (q.tags || '').toLowerCase().indexOf(search) !== -1;
    }).map(function (q) { return q.id; });
  }

  var API = {
    toggle: function (id, on) {
      if (on) selected.add(id); else selected.delete(id);
      updateCount();
    },
    selectVisible: function (on) {
      document.querySelectorAll('#qTableBody input[data-pecid]').forEach(function (cb) {
        cb.checked = on;
        var id = cb.getAttribute('data-pecid');
        if (on) selected.add(id); else selected.delete(id);
      });
      updateCount();
    },
    selectAll: function (on) {
      if (!on) { selected.clear(); }
      else { currentFilteredIds().forEach(function (id) { selected.add(id); }); }
      // Reflect in visible checkboxes
      document.querySelectorAll('#qTableBody input[data-pecid]').forEach(function (cb) {
        cb.checked = selected.has(cb.getAttribute('data-pecid'));
      });
      var h = $('pecHeadCb'); if (h) h.checked = on;
      updateCount();
    },
    deleteSelected: async function () {
      if (!selected.size) return alert('No questions selected.');
      if (!confirm('Delete ' + selected.size + ' selected questions?\n\nThis cannot be undone.')) return;
      await this._bulkDelete(Array.from(selected));
    },
    deleteFiltered: async function () {
      var ids = currentFilteredIds();
      if (!ids.length) return alert('No filtered questions to delete.');
      if (!confirm('Delete ' + ids.length + ' filtered questions?\n\nThis cannot be undone.')) return;
      await this._bulkDelete(ids);
    },
    _bulkDelete: async function (ids) {
      var btnBar = $('pecBulkBar');
      var prev = btnBar ? btnBar.innerHTML : '';
      if (btnBar) btnBar.innerHTML = '<span style="color:var(--ink-soft)"><i class="fa-solid fa-spinner fa-spin"></i> Deleting 0 / ' + ids.length + ' …</span>';
      try {
        await AdminData.bulkDeleteQuestions(ids, function (done, total) {
          if (btnBar) btnBar.firstChild.textContent = ' Deleting ' + done + ' / ' + total + ' …';
        });
        selected.clear();
        if (typeof window.refreshQuestions === 'function') await window.refreshQuestions();
        if (window.toast) toast('Deleted ' + ids.length + ' questions', 'success');
      } catch (e) {
        alert('Delete failed: ' + (e && e.message || e));
      } finally {
        if (btnBar) btnBar.innerHTML = prev;
        ensureToolbar(); decorateTable();
      }
    },
    exportSelected: function () {
      if (!selected.size) return alert('No questions selected.');
      var rows = (window.questions || []).filter(function (q) { return selected.has(q.id); });
      var blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'questions_selected_' + Date.now() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    },
    duplicateSelected: async function () {
      if (!selected.size) return alert('No questions selected.');
      if (!confirm('Duplicate ' + selected.size + ' questions?')) return;
      var rows = (window.questions || []).filter(function (q) { return selected.has(q.id); });
      var ok = 0;
      for (var i = 0; i < rows.length; i++) {
        var r = Object.assign({}, rows[i]); delete r.id; delete r.createdAt; delete r.updatedAt;
        try { await AdminData.saveQuestion(r); ok++; } catch (e) { console.warn(e); }
      }
      if (window.toast) toast('Duplicated ' + ok + ' questions', 'success');
      if (typeof window.refreshQuestions === 'function') await window.refreshQuestions();
    },
    validateSelected: function () {
      var ids = selected.size ? Array.from(selected) : currentFilteredIds();
      var qs = (window.questions || []).filter(function (q) { return ids.indexOf(q.id) !== -1; });
      var bad = [];
      qs.forEach(function (q) {
        var miss = [];
        if (!(q.question || q.text)) miss.push('question');
        if (!(q.optionA || q.a)) miss.push('optionA');
        if (!(q.optionB || q.b)) miss.push('optionB');
        if (!(q.optionC || q.c)) miss.push('optionC');
        if (!(q.optionD || q.d)) miss.push('optionD');
        if (!(q.correctAnswer || q.correct)) miss.push('correctAnswer');
        if (!(q.classId || q.cls)) miss.push('classId');
        if (!(q.subjectId || q.subject)) miss.push('subjectId');
        if (!(q.chapterId || q.chapter)) miss.push('chapterId');
        if (miss.length) bad.push({ id: q.id, q: (q.question || q.text || '').slice(0, 60), missing: miss.join(',') });
      });
      if (!bad.length) return alert('✅ All ' + qs.length + ' questions validated OK.');
      var csv = 'id,question,missing\n' + bad.map(function (b) {
        return '"' + b.id + '","' + (b.q || '').replace(/"/g, '""') + '","' + b.missing + '"';
      }).join('\n');
      var blob = new Blob([csv], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'validation_report_' + Date.now() + '.csv';
      document.body.appendChild(a); a.click(); a.remove();
      alert('Found ' + bad.length + ' invalid question(s). Report downloaded.');
    }
  };
  window.PECBulk = API;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookRenderTable);
  else hookRenderTable();
})();
