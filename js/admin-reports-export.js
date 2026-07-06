/* ============================================================================
   Student Reports — PDF / Excel / Print (Admin)
   Adds window.ReportsExport with:
     exportPDF(rows, meta)   - jsPDF (autoTable optional)
     exportExcel(rows, meta) - SheetJS XLSX
     printRows(rows, meta)   - HTML print view
   `rows` is an array of report objects; expected fields:
     studentName, email, className, subject, testName,
     chapterNo, chapterName, marks, correct, wrong, unattempted,
     percent, rank, durationSec, date
   Missing fields render as "-". Non-invasive: attaches to window.
   ============================================================================ */
(function(root){
  'use strict';

  var HEADERS = [
    ['studentName','Student Name'],['email','Email'],['className','Class'],
    ['subject','Subject'],['testName','Test Name'],['chapterNo','Chapter No'],
    ['chapterName','Chapter Name'],['marks','Marks'],['correct','Correct'],
    ['wrong','Wrong'],['unattempted','Unattempted'],['percent','Percentage'],
    ['rank','Rank'],['durationSec','Time (sec)'],['date','Date']
  ];

  function val(r,k){
    var v = r[k];
    if (v==null || v==='') return '-';
    if (k==='percent') return (Number(v).toFixed(2))+'%';
    if (k==='date' && v && v.toDate) return v.toDate().toLocaleString();
    return String(v);
  }

  function ensureScript(src){
    return new Promise(function(res, rej){
      if (document.querySelector('script[data-lib="'+src+'"]')) return res();
      var s = document.createElement('script'); s.src = src; s.setAttribute('data-lib', src);
      s.onload = res; s.onerror = function(){ rej(new Error('load '+src)); };
      document.head.appendChild(s);
    });
  }

  async function exportPDF(rows, meta){
    meta = meta || {};
    await ensureScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    try { await ensureScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'); } catch(_){}
    var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    var doc = new jsPDF({ orientation:'landscape', unit:'pt', format:'a4' });
    doc.setFontSize(16); doc.setTextColor(30,45,90);
    doc.text(meta.title || 'Student Reports — PhysicalEducationCareer.in', 40, 40);
    doc.setFontSize(10); doc.setTextColor(80,80,80);
    doc.text('Generated: '+new Date().toLocaleString(), 40, 58);
    var head = [HEADERS.map(function(h){ return h[1]; })];
    var body = rows.map(function(r){ return HEADERS.map(function(h){ return val(r, h[0]); }); });
    if (doc.autoTable){
      doc.autoTable({
        head: head, body: body, startY: 74,
        styles: { fontSize:8, cellPadding:4 },
        headStyles: { fillColor:[15,33,72], textColor:[212,175,55] },
        alternateRowStyles: { fillColor:[245,247,255] }
      });
    } else {
      var y=90; body.forEach(function(row){ doc.text(row.join(' | ').slice(0,180), 40, y); y+=12; if(y>560){ doc.addPage(); y=40; } });
    }
    doc.save('student-reports-'+Date.now()+'.pdf');
  }

  async function exportExcel(rows, meta){
    await ensureScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    var XLSX = window.XLSX;
    var aoa = [ HEADERS.map(function(h){ return h[1]; }) ];
    rows.forEach(function(r){ aoa.push(HEADERS.map(function(h){ return val(r, h[0]); })); });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = HEADERS.map(function(){ return { wch:18 }; });
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, 'student-reports-'+Date.now()+'.xlsx');
  }

  function printRows(rows, meta){
    var win = window.open('', '_blank');
    var thead = HEADERS.map(function(h){ return '<th>'+h[1]+'</th>'; }).join('');
    var tbody = rows.map(function(r){
      return '<tr>'+HEADERS.map(function(h){ return '<td>'+String(val(r,h[0])).replace(/</g,'&lt;')+'</td>'; }).join('')+'</tr>';
    }).join('');
    win.document.write(
      '<!doctype html><html><head><title>Student Reports</title>'
      + '<style>body{font-family:Inter,Arial,sans-serif;padding:24px;color:#111}h1{color:#0f2148;margin:0 0 4px}'
      + '.sub{color:#666;font-size:12px;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}'
      + 'th{background:#0f2148;color:#d4af37;text-align:left;padding:6px 8px}td{padding:6px 8px;border-bottom:1px solid #e2e6f0}'
      + 'tr:nth-child(even) td{background:#f6f8ff}</style></head><body>'
      + '<h1>'+(meta&&meta.title||'Student Reports')+'</h1>'
      + '<div class="sub">PhysicalEducationCareer.in · Generated '+new Date().toLocaleString()+'</div>'
      + '<table><thead><tr>'+thead+'</tr></thead><tbody>'+tbody+'</tbody></table>'
      + '<script>window.onload=function(){window.print();};<\/script></body></html>');
    win.document.close();
  }

  root.ReportsExport = { exportPDF: exportPDF, exportExcel: exportExcel, printRows: printRows, HEADERS: HEADERS };
})(window);
