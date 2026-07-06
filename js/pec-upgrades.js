/* ============================================================================
   PEEngine Upgrades — shared helpers (loads on any page)
   • Confirm modal    -> PEC.confirm(message)
   • Toast messages   -> PEC.toast(msg, 'ok'|'err')
   • Certificate ID   -> PEC.certId()          e.g. PEC-2026-000001
   • QR code URL      -> PEC.qrUrl(text, sz)
   • Options letter   -> PEC.letter(idx)
   Non-invasive: attaches to window.PEC.
   ============================================================================ */
(function (root) {
  'use strict';
  if (root.PEC) return;

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}

  var css = ''
    + '.pec-modal-mask{position:fixed;inset:0;background:rgba(4,10,26,.72);backdrop-filter:blur(6px);display:grid;place-items:center;z-index:9999}'
    + '.pec-modal{background:#0f2148;border:1px solid #d4af37;border-radius:14px;padding:22px 26px;max-width:420px;width:92%;color:#fff;font-family:Inter,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6)}'
    + '.pec-modal h3{margin:0 0 10px;color:#d4af37;font-size:20px}'
    + '.pec-modal p{margin:0 0 18px;color:#dbe4ff;font-size:14px;line-height:1.55}'
    + '.pec-modal .row{display:flex;gap:10px;justify-content:flex-end}'
    + '.pec-btn{padding:9px 16px;border-radius:8px;border:1px solid #2a3a6b;background:#182a55;color:#fff;cursor:pointer;font-weight:600}'
    + '.pec-btn.primary{background:linear-gradient(135deg,#d4af37,#b8860b);color:#1a1206;border-color:#d4af37}'
    + '.pec-btn.danger{background:#c0392b;border-color:#c0392b}'
    + '.pec-toast-wrap{position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px}'
    + '.pec-toast{background:#0f2148;border-left:4px solid #d4af37;color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.5);font-family:Inter,sans-serif;font-size:14px;min-width:220px;animation:pec-in .25s ease}'
    + '.pec-toast.ok{border-left-color:#2ecc71}.pec-toast.err{border-left-color:#e74c3c}'
    + '@keyframes pec-in{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}';

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  function toast(msg, kind){
    var wrap = document.querySelector('.pec-toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='pec-toast-wrap'; document.body.appendChild(wrap); }
    var t = document.createElement('div'); t.className='pec-toast '+(kind||''); t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function(){ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(function(){ t.remove(); }, 320); }, 3200);
  }

  function confirmModal(message, opts){
    opts = opts || {};
    return new Promise(function(resolve){
      var mask = document.createElement('div'); mask.className='pec-modal-mask';
      mask.innerHTML = '<div class="pec-modal" role="dialog" aria-modal="true">'
        + '<h3>'+esc(opts.title||'Confirm')+'</h3>'
        + '<p>'+esc(message||'Are you sure?')+'</p>'
        + '<div class="row">'
        +   '<button class="pec-btn" data-a="0">'+esc(opts.cancel||'Cancel')+'</button>'
        +   '<button class="pec-btn '+(opts.danger?'danger':'primary')+'" data-a="1">'+esc(opts.ok||'Confirm')+'</button>'
        + '</div></div>';
      document.body.appendChild(mask);
      mask.addEventListener('click', function(e){
        if (e.target===mask){ mask.remove(); resolve(false); return; }
        var b = e.target.closest('[data-a]'); if(!b) return;
        var ok = b.getAttribute('data-a')==='1';
        mask.remove(); resolve(ok);
      });
    });
  }

  // Cert ID: PEC-YYYY-NNNNNN (year + 6-digit counter). Sequence stored in
  // Firestore doc `certificate_meta/counter` so IDs never duplicate.
  async function certId(){
    var yr = new Date().getFullYear();
    if (typeof firebase === 'undefined' || !firebase.firestore){
      // Offline fallback — not persisted; ok for preview only.
      return 'PEC-'+yr+'-'+String(Math.floor(Math.random()*899999)+100000);
    }
    var db = firebase.firestore();
    var ref = db.collection('certificate_meta').doc('counter');
    try {
      var next = await db.runTransaction(async function(tx){
        var snap = await tx.get(ref);
        var cur = (snap.exists && snap.data() && snap.data().value) ? snap.data().value : 0;
        var nxt = cur + 1;
        tx.set(ref, { value: nxt, year: yr, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge:true });
        return nxt;
      });
      return 'PEC-'+yr+'-'+String(next).padStart(6,'0');
    } catch(e){
      console.warn('[PEC.certId] transaction failed, using random fallback', e);
      return 'PEC-'+yr+'-'+String(Math.floor(Math.random()*899999)+100000);
    }
  }

  function qrUrl(text, size){
    var s = size || 220;
    return 'https://api.qrserver.com/v1/create-qr-code/?size='+s+'x'+s+'&data='+encodeURIComponent(text||'');
  }

  function letter(i){ return ['A','B','C','D','E','F'][i] || String(i); }

  // Save (or update) a certificate record in Firebase — idempotent per attempt.
  async function ensureCertificate(attempt, profile){
    if (typeof firebase === 'undefined' || !firebase.firestore) return null;
    if (!attempt || (attempt.percent||0) < 90) return null;
    var db = firebase.firestore();
    // If attempt already has a certificateId, return the existing record.
    if (attempt.certificateId){
      var s = await db.collection('certificates').doc(attempt.certificateId).get();
      if (s.exists) return Object.assign({id:s.id}, s.data());
    }
    var id = await certId();
    var rec = {
      certId: id,
      attemptId: attempt.id || null,
      attemptType: attempt.type || 'practice',
      studentId: attempt.studentId || null,
      studentName: (profile && profile.name) || attempt.studentName || '',
      studentEmail: attempt.studentEmail || (profile && profile.email) || '',
      classId: attempt.classId || '',
      subjectId: attempt.subjectId || '',
      chapterId: attempt.chapterId || '',
      testId: attempt.testId || '',
      testTitle: attempt.testTitle || '',
      score: attempt.score || 0,
      maxMarks: attempt.maxMarks || 0,
      correct: attempt.correct || 0,
      wrong: attempt.wrong || 0,
      total: attempt.total || 0,
      percent: attempt.percent || 0,
      durationSec: attempt.durationSec || 0,
      status: 'verified',
      issuedAt: firebase.firestore.FieldValue.serverTimestamp(),
      downloadCount: 0
    };
    await db.collection('certificates').doc(id).set(rec);
    // Backlink on the attempt (best-effort; ignore auth errors).
    try {
      var col = attempt.type==='practice' ? 'practice_attempts' : 'student_attempts';
      if (attempt.id) await db.collection(col).doc(attempt.id).set({ certificateId:id }, { merge:true });
    } catch(_){}
    return Object.assign({id:id}, rec);
  }

  async function bumpDownloadCount(certId){
    if (typeof firebase==='undefined' || !certId) return;
    try {
      var db = firebase.firestore();
      await db.collection('certificates').doc(certId).set({
        downloadCount: firebase.firestore.FieldValue.increment(1),
        lastDownloadAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge:true });
    } catch(e){ console.warn('bumpDownloadCount', e); }
  }

  root.PEC = {
    esc: esc,
    toast: toast,
    confirm: confirmModal,
    certId: certId,
    qrUrl: qrUrl,
    letter: letter,
    ensureCertificate: ensureCertificate,
    bumpDownloadCount: bumpDownloadCount
  };
})(window);
