/* =====================================================================
 * PEEngine – Repair / Migrate PLUS
 * Upgrades the EXISTING "Repair / Migrate All Questions" panel with:
 *  - Scan All (duplicates, broken, missing fields, migrate-needed)
 *  - Duplicate Manager (per-group actions, keep oldest/latest, merge)
 *  - Repair All / Migrate All (uses existing migrateAllQuestions)
 *  - Remove All Duplicates
 *  - Export Validation & Duplicate Reports (CSV / Excel-compatible)
 * No new menu item; the panel is enhanced in place.
 * =================================================================== */
(function () {
  if (window.__PECRepairPlusLoaded) return;
  window.__PECRepairPlusLoaded = true;

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function ts(d){ try { return d && d.toDate ? d.toDate().toISOString() : ''; } catch(_) { return ''; } }
  function csvCell(v){ return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'; }
  function download(name, mime, data){
    var blob = new Blob([data], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
  }

  var lastScan = null;

  function ensureUi() {
    if (document.getElementById('pecRepairPlus')) return;
    // The existing Repair/Migrate panel contains the button #migrateBtn.
    var mBtn = document.getElementById('migrateBtn');
    if (!mBtn) { setTimeout(ensureUi, 400); return; }
    var panel = mBtn.closest('.panel');
    if (!panel) return;

    var box = document.createElement('div');
    box.id = 'pecRepairPlus';
    box.style.cssText = 'margin-top:18px;padding-top:16px;border-top:1px dashed var(--glass-border)';
    box.innerHTML =
      '<h4 style="margin:0 0 10px"><i class="fa-solid fa-toolbox"></i> Maintenance Toolkit</h4>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">'+
        '<button class="btn btn-gold" id="pecScanBtn"><i class="fa-solid fa-magnifying-glass-chart"></i> Scan All</button>'+
        '<button class="btn" id="pecRepairAllBtn"><i class="fa-solid fa-screwdriver-wrench"></i> Repair All</button>'+
        '<button class="btn" id="pecMigrateAllBtn"><i class="fa-solid fa-wand-magic-sparkles"></i> Migrate All</button>'+
        '<button class="btn btn-danger" id="pecRmDupBtn"><i class="fa-solid fa-copy"></i> Remove All Duplicates</button>'+
        '<button class="btn" id="pecExpValBtn"><i class="fa-solid fa-file-csv"></i> Export Validation CSV</button>'+
        '<button class="btn" id="pecExpDupBtn"><i class="fa-solid fa-file-excel"></i> Export Duplicate Report</button>'+
      '</div>'+
      '<div id="pecScanStats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px"></div>'+
      '<div id="pecScanMsg" style="font-size:13px;color:var(--ink-soft);margin-bottom:12px">Click <b>Scan All</b> to analyse the Question Bank.</div>'+
      '<div id="pecDupWrap"></div>';
    panel.appendChild(box);

    document.getElementById('pecScanBtn').onclick = doScan;
    document.getElementById('pecRepairAllBtn').onclick = doRepairAll;
    document.getElementById('pecMigrateAllBtn').onclick = doRepairAll; // Same underlying safe migration.
    document.getElementById('pecRmDupBtn').onclick = removeAllDuplicates;
    document.getElementById('pecExpValBtn').onclick = exportValidation;
    document.getElementById('pecExpDupBtn').onclick = exportDuplicates;
  }

  function statBox(label, value, color) {
    return '<div style="background:rgba(15,33,72,.55);border:1px solid var(--glass-border);border-radius:10px;padding:10px 12px">'+
      '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-mute)">'+esc(label)+'</div>'+
      '<div style="font-family:Playfair Display,serif;font-size:22px;color:'+(color||'#d4af37')+';margin-top:2px">'+esc(value)+'</div>'+
    '</div>';
  }

  async function doScan() {
    var btn = document.getElementById('pecScanBtn');
    btn.disabled = true; var t0 = Date.now();
    document.getElementById('pecScanMsg').textContent = 'Scanning… please wait.';
    try {
      lastScan = await AdminData.scanBank();
      var s = lastScan;
      document.getElementById('pecScanStats').innerHTML =
        statBox('Total Questions', s.total, '#d4af37') +
        statBox('Duplicates', s.duplicates, s.duplicates ? '#e67e22' : '#2ecc71') +
        statBox('Broken', s.broken, s.broken ? '#e74c3c' : '#2ecc71') +
        statBox('Missing Fields', s.missingFields, s.missingFields ? '#e67e22' : '#2ecc71') +
        statBox('Repairable', s.repairable, '#3498db') +
        statBox('Migration Needed', s.migrateNeeded, s.migrateNeeded ? '#e67e22' : '#2ecc71');
      document.getElementById('pecScanMsg').textContent =
        'Scan completed in ' + ((Date.now()-t0)/1000).toFixed(1) + 's. ' +
        (s.duplicates ? 'Review duplicate groups below.' : 'No duplicates detected.');
      renderDupGroups();
    } catch (e) {
      document.getElementById('pecScanMsg').innerHTML = '<span style="color:#e74c3c">Scan failed: '+esc(e.message||e)+'</span>';
    } finally { btn.disabled = false; }
  }

  function renderDupGroups() {
    var wrap = document.getElementById('pecDupWrap');
    if (!lastScan || !lastScan.duplicateGroups || !lastScan.duplicateGroups.length) {
      wrap.innerHTML = ''; return;
    }
    // Cap UI rendering for performance; report export always covers everything.
    var groups = lastScan.duplicateGroups;
    var SHOW = 100;
    var head = '<h5 style="margin:14px 0 8px">Duplicate Groups ('+groups.length+
      (groups.length>SHOW?' — showing first '+SHOW:'')+')</h5>';
    var html = head;
    groups.slice(0, SHOW).forEach(function (g, gi) {
      html += '<div style="border:1px solid var(--glass-border);border-radius:10px;padding:10px;margin-bottom:10px;background:rgba(15,33,72,.35)">'+
        '<div style="font-size:13px;color:var(--ink);margin-bottom:6px"><b>Group '+(gi+1)+'</b> — '+g.length+' copies · '+esc((g[0].question||'').slice(0,110))+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'+
          '<button class="btn" onclick="PECRepair.keepOldest('+gi+')"><i class="fa-solid fa-clock-rotate-left"></i> Keep Oldest</button>'+
          '<button class="btn" onclick="PECRepair.keepLatest('+gi+')"><i class="fa-solid fa-clock"></i> Keep Latest</button>'+
          '<button class="btn" onclick="PECRepair.mergeGroup('+gi+')"><i class="fa-solid fa-code-merge"></i> Merge</button>'+
          '<button class="btn btn-danger" onclick="PECRepair.deleteAllInGroup('+gi+')"><i class="fa-solid fa-trash"></i> Delete All Duplicates</button>'+
        '</div>'+
        '<div style="overflow-x:auto"><table style="width:100%;font-size:12px"><thead><tr>'+
          '<th style="text-align:left;padding:4px">Doc ID</th><th style="text-align:left;padding:4px">Class</th>'+
          '<th style="text-align:left;padding:4px">Subject</th><th style="text-align:left;padding:4px">Chapter</th>'+
          '<th style="text-align:left;padding:4px">Type</th><th style="text-align:left;padding:4px">Difficulty</th>'+
          '<th style="text-align:left;padding:4px">Created</th><th style="padding:4px">Action</th>'+
        '</tr></thead><tbody>';
      g.forEach(function (q) {
        html += '<tr>'+
          '<td style="padding:4px;font-family:monospace">'+esc(q.id)+'</td>'+
          '<td style="padding:4px">'+esc(q.classId||q.cls||'')+'</td>'+
          '<td style="padding:4px">'+esc(q.subjectId||q.subject||'')+'</td>'+
          '<td style="padding:4px">'+esc(q.chapterId||q.chapter||'')+'</td>'+
          '<td style="padding:4px">'+esc(q.examType||'MCQ')+'</td>'+
          '<td style="padding:4px">'+esc(q.difficulty||'')+'</td>'+
          '<td style="padding:4px">'+esc(ts(q.createdAt))+'</td>'+
          '<td style="padding:4px;text-align:center">'+
            '<button class="btn btn-danger" style="padding:2px 8px" onclick="PECRepair.deleteOne(\''+esc(q.id)+'\','+gi+')"><i class="fa-solid fa-trash"></i></button>'+
          '</td>'+
        '</tr>';
      });
      html += '</tbody></table></div></div>';
    });
    wrap.innerHTML = html;
  }

  async function doRepairAll() {
    if (!confirm('Run Repair / Migrate on ALL questions?\n\nThis backfills missing options, correct answer, class/subject/chapter mappings, defaults. Safe to re-run.')) return;
    var btn = document.getElementById('migrateBtn'); if (btn && btn.onclick) return btn.click(); // reuse existing runner
    if (typeof window.runMigration === 'function') return window.runMigration();
    // Fallback: direct call
    var res = await AdminData.migrateAllQuestions(function(d,t){ /* progress */ });
    alert('Repair complete: '+res.updated+' updated / '+res.total+' scanned.');
  }

  async function removeAllDuplicates() {
    if (!lastScan) return alert('Run "Scan All" first.');
    if (!lastScan.duplicateGroups.length) return alert('No duplicates found.');
    var toRemove = lastScan.duplicateGroups.reduce(function (a,g){ return a + (g.length - 1); }, 0);
    if (!confirm('Delete '+toRemove+' duplicate questions (keeping the oldest of each group)?\n\nThis cannot be undone.')) return;
    await AdminData.removeDuplicatesKeepOldest(lastScan.duplicateGroups);
    alert('Removed '+toRemove+' duplicates.');
    await doScan();
    if (typeof window.refreshQuestions === 'function') window.refreshQuestions();
  }

  function exportValidation() {
    if (!lastScan) return alert('Run "Scan All" first.');
    var rows = [['id','missing_fields']];
    lastScan.missingDetails.forEach(function (m) { rows.push([m.id, m.missing.join('|')]); });
    var csv = rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n');
    download('validation_report_'+Date.now()+'.csv', 'text/csv', csv);
  }

  function exportDuplicates() {
    if (!lastScan) return alert('Run "Scan All" first.');
    var rows = [['group','doc_id','question','class','subject','chapter','type','difficulty','created']];
    lastScan.duplicateGroups.forEach(function (g, gi) {
      g.forEach(function (q) {
        rows.push([gi+1, q.id, (q.question||'').slice(0,300), q.classId||q.cls||'', q.subjectId||q.subject||'', q.chapterId||q.chapter||'', q.examType||'MCQ', q.difficulty||'', ts(q.createdAt)]);
      });
    });
    var csv = rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n');
    download('duplicate_report_'+Date.now()+'.csv', 'text/csv', csv);
    // Excel-compatible: same CSV opens in Excel; also emit .xls fallback (HTML table).
    var html = '<table>'+rows.map(function(r,i){
      return '<tr>'+r.map(function(c){ return '<'+(i===0?'th':'td')+'>'+esc(c)+'</'+(i===0?'th':'td')+'>'; }).join('')+'</tr>';
    }).join('')+'</table>';
    download('duplicate_report_'+Date.now()+'.xls', 'application/vnd.ms-excel', html);
  }

  var GroupOps = {
    keepOldest: async function (gi) {
      var g = lastScan.duplicateGroups[gi]; if (!g) return;
      if (!confirm('Keep oldest, delete '+(g.length-1)+' others?')) return;
      await AdminData.removeDuplicatesKeepOldest([g]);
      lastScan.duplicateGroups.splice(gi,1); renderDupGroups();
    },
    keepLatest: async function (gi) {
      var g = lastScan.duplicateGroups[gi]; if (!g) return;
      if (!confirm('Keep latest, delete '+(g.length-1)+' others?')) return;
      await AdminData.removeDuplicatesKeepLatest([g]);
      lastScan.duplicateGroups.splice(gi,1); renderDupGroups();
    },
    mergeGroup: async function (gi) {
      var g = lastScan.duplicateGroups[gi]; if (!g) return;
      // Keep the oldest; merge missing fields from siblings.
      var keep = g.slice().sort(function(a,b){
        var ax = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
        var bx = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
        return ax - bx;
      })[0];
      if (!confirm('Merge '+g.length+' records into '+keep.id+'?')) return;
      await AdminData.mergeDuplicateGroup(keep.id, g);
      lastScan.duplicateGroups.splice(gi,1); renderDupGroups();
    },
    deleteAllInGroup: async function (gi) {
      var g = lastScan.duplicateGroups[gi]; if (!g) return;
      if (!confirm('Delete ALL '+g.length+' copies in this group (including the original)? This is destructive.')) return;
      await AdminData.bulkDeleteQuestions(g.map(function(q){ return q.id; }));
      lastScan.duplicateGroups.splice(gi,1); renderDupGroups();
    },
    deleteOne: async function (id, gi) {
      if (!confirm('Delete this record ('+id+')?')) return;
      await AdminData.bulkDeleteQuestions([id]);
      var g = lastScan.duplicateGroups[gi];
      if (g) {
        var idx = g.findIndex(function(q){ return q.id === id; });
        if (idx >= 0) g.splice(idx, 1);
        if (g.length < 2) lastScan.duplicateGroups.splice(gi, 1);
      }
      renderDupGroups();
    }
  };
  window.PECRepair = GroupOps;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureUi);
  else ensureUi();
})();
