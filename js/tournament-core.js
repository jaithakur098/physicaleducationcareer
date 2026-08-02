/* ============================================================================
   ALWAR CUP CHAMPIONSHIP — Core data + logic layer  (window.TCore)
   Firebase compat. Reuses the existing app initialised by config/firebase-init.js
   Requires: firebase-app-compat, firebase-auth-compat, firebase-firestore-compat
             (firebase-storage-compat optional — photos fall back to base64)
   ============================================================================ */
(function (root) {
  'use strict';

  var D = root.TOURNAMENT_DEFAULTS;
  if (!D) { console.error('[TCore] tournament-config.js must load first'); return; }
  if (typeof firebase === 'undefined') { console.error('[TCore] firebase SDK missing'); return; }

  var C  = D.collections;
  var db = firebase.firestore();
  var auth = firebase.auth();
  var storage = (firebase.storage) ? firebase.storage() : null;

  var rules = {
    ageRules: D.ageRules.slice(),
    weightRules: JSON.parse(JSON.stringify(D.weightRules))
  };

  /* ---------------------------------------------------------------- utils */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function fmtDate(d) {
    if (!d) return '—';
    var dt = (d.toDate) ? d.toDate() : new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------------------------------------------------------------- toast */
  function toast(msg, type) {
    var wrap = document.getElementById('tToastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tToastWrap';
      wrap.className = 't-toast-wrap';
      document.body.appendChild(wrap);
    }
    var el = document.createElement('div');
    el.className = 't-toast ' + (type || 'info');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2800);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3300);
  }

  /* ------------------------------------------------------- category rules */
  function loadCategoryRules() {
    return db.collection(C.settings).doc('categories').get().then(function (doc) {
      if (doc.exists) {
        var d = doc.data() || {};
        if (Array.isArray(d.ageRules) && d.ageRules.length) rules.ageRules = d.ageRules;
        if (d.weightRules && Object.keys(d.weightRules).length) rules.weightRules = d.weightRules;
      }
      return rules;
    }).catch(function () { return rules; });
  }
  function saveCategoryRules(next) {
    rules.ageRules = next.ageRules || rules.ageRules;
    rules.weightRules = next.weightRules || rules.weightRules;
    return db.collection(C.settings).doc('categories').set({
      ageRules: rules.ageRules,
      weightRules: rules.weightRules,
      updatedAt: Date.now()
    }, { merge: true });
  }
  function getRules() { return rules; }

  /* --------------------------------------------------------- calculations */
  function calcAge(dob, refDate) {
    if (!dob) return null;
    var b = new Date(dob), r = refDate ? new Date(refDate) : new Date();
    if (isNaN(b) || isNaN(r)) return null;
    var a = r.getFullYear() - b.getFullYear();
    var m = r.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && r.getDate() < b.getDate())) a--;
    return a;
  }
  function ageCategory(dob, refDate) {
    var age = calcAge(dob, refDate);
    if (age == null || age < 0) return null;
    for (var i = 0; i < rules.ageRules.length; i++) {
      var r = rules.ageRules[i];
      if (age >= Number(r.min) && age <= Number(r.max)) {
        return { key: r.key, name: r.name, age: age };
      }
    }
    var last = rules.ageRules[rules.ageRules.length - 1];
    return last ? { key: last.key, name: last.name, age: age } : null;
  }
  function normGender(g) {
    g = String(g || '').toLowerCase();
    if (g === 'm' || g === 'male' || g === 'boy' || g === 'boys') return 'male';
    if (g === 'f' || g === 'female' || g === 'girl' || g === 'girls') return 'female';
    return 'male';
  }
  function weightBucketKey(ageKey, gender) { return ageKey + '_' + normGender(gender); }
  function weightCategory(weightKg, ageKey, gender) {
    var w = parseFloat(weightKg);
    if (!isFinite(w) || w <= 0 || !ageKey) return null;
    var list = rules.weightRules[weightBucketKey(ageKey, gender)];
    if (!list || !list.length) return null;
    for (var i = 0; i < list.length; i++) {
      var lbl = String(list[i]).trim();
      if (lbl.charAt(0) === '+') { if (w > parseFloat(lbl.slice(1))) return lbl; continue; }
      var cap = parseFloat(lbl.replace('-', ''));
      if (w <= cap) return lbl;
    }
    return list[list.length - 1];
  }
  function categoryLabel(ageName, gender, weight) {
    var g = normGender(gender) === 'male' ? 'Boys' : 'Girls';
    return (ageName || '—') + ' ' + g + ' ' + (weight || '—') + ' Kg';
  }
  function categoryId(tournamentId, ageKey, gender, weight) {
    return [tournamentId, ageKey, normGender(gender), String(weight).replace(/[^0-9+\-]/g, '')].join('__');
  }

  /* --------------------------------------------------------------- upload */
  function uploadImage(file, path) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve('');
      if (file.size > 3 * 1024 * 1024) return reject(new Error('Image must be under 3 MB'));
      if (storage) {
        var ref = storage.ref().child(path + '/' + Date.now() + '_' + file.name.replace(/[^\w.\-]/g, '_'));
        ref.put(file).then(function (snap) { return snap.ref.getDownloadURL(); })
          .then(resolve)
          .catch(function () { toBase64(file).then(resolve).catch(reject); });
      } else {
        toBase64(file).then(resolve).catch(reject);
      }
    });
  }
  function toBase64(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------------------ QR  */
  function qrUrl(text, size) {
    size = size || 160;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
           '&data=' + encodeURIComponent(text);
  }
  function verifyUrl(type, id) {
    var base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return base + 'tournament-verify.html?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
  }

  /* --------------------------------------------------------------- auth   */
  function googleLogin() {
    var p = new firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(p);
  }
  function logout() { return auth.signOut(); }
  function onAuth(cb) { return auth.onAuthStateChanged(cb); }
  function currentUser() { return auth.currentUser; }
  function isAdmin(user) {
    if (!user) return Promise.resolve(false);
    return db.collection('admins').doc(user.uid).get()
      .then(function (d) { return d.exists; }).catch(function () { return false; });
  }

  /* ---------------------------------------------------------- tournaments */
  function listTournaments() {
    return db.collection(C.tournaments).get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    });
  }
  function getTournament(id) {
    return db.collection(C.tournaments).doc(id).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }
  function saveTournament(data, id) {
    data.updatedAt = Date.now();
    if (id) return db.collection(C.tournaments).doc(id).set(data, { merge: true }).then(function () { return id; });
    data.createdAt = Date.now();
    return db.collection(C.tournaments).add(data).then(function (r) { return r.id; });
  }
  function deleteTournament(id) { return db.collection(C.tournaments).doc(id).delete(); }
  function watchTournaments(cb) {
    return db.collection(C.tournaments).onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
    });
  }

  /* -------------------------------------------------------------- coaches */
  function getCoach(uidStr) {
    return db.collection(C.coaches).doc(uidStr).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }
  function saveCoach(uidStr, data) {
    data.updatedAt = Date.now();
    if (!data.coachId) data.coachId = 'ACC-' + new Date().getFullYear() + '-' + uidStr.slice(0, 6).toUpperCase();
    if (!data.createdAt) data.createdAt = Date.now();
    return db.collection(C.coaches).doc(uidStr).set(data, { merge: true }).then(function () { return data; });
  }
  function listCoaches() {
    return db.collection(C.coaches).get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }
  function watchCoaches(cb) {
    return db.collection(C.coaches).onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
    });
  }

  /* -------------------------------------------------------------- players */
  function buildPlayerCategories(p, tournamentRefDate) {
    var ac = ageCategory(p.dob, tournamentRefDate);
    var wc = ac ? weightCategory(p.weight, ac.key, p.gender) : null;
    return {
      age: ac ? ac.age : null,
      ageKey: ac ? ac.key : '',
      ageCategory: ac ? ac.name : '',
      weightCategory: wc || '',
      gender: normGender(p.gender),
      categoryLabel: ac ? categoryLabel(ac.name, p.gender, wc) : ''
    };
  }

  function nextRegNo(tournamentId) {
    return db.collection(C.players).where('tournamentId', '==', tournamentId).get()
      .then(function (s) {
        var yr = new Date().getFullYear();
        return 'ACC' + yr + '-' + pad(s.size + 1, 4);
      });
  }

  function savePlayer(data, id, tournamentRefDate) {
    var cat = buildPlayerCategories(data, tournamentRefDate);
    Object.assign(data, cat);
    data.updatedAt = Date.now();
    if (id) return db.collection(C.players).doc(id).set(data, { merge: true }).then(function () { return id; });
    data.createdAt = Date.now();
    data.status = data.status || 'pending';
    return nextRegNo(data.tournamentId).then(function (reg) {
      data.regNo = data.regNo || reg;
      return db.collection(C.players).add(data);
    }).then(function (r) { return r.id; });
  }
  function deletePlayer(id) { return db.collection(C.players).doc(id).delete(); }
  function getPlayer(id) {
    return db.collection(C.players).doc(id).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }
  function setPlayerStatus(ids, status) {
    var batch = db.batch();
    ids.forEach(function (i) {
      batch.update(db.collection(C.players).doc(i), { status: status, updatedAt: Date.now() });
    });
    return batch.commit();
  }
  function watchPlayers(filter, cb) {
    var q = db.collection(C.players);
    if (filter && filter.tournamentId) q = q.where('tournamentId', '==', filter.tournamentId);
    if (filter && filter.coachUid) q = q.where('coachUid', '==', filter.coachUid);
    return q.onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
    }, function (e) { console.error('[TCore.watchPlayers]', e); cb([]); });
  }
  function listPlayers(filter) {
    var q = db.collection(C.players);
    if (filter && filter.tournamentId) q = q.where('tournamentId', '==', filter.tournamentId);
    if (filter && filter.coachUid) q = q.where('coachUid', '==', filter.coachUid);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  /* ------------------------------------------------------------- referees */
  function saveReferee(data, id) {
    data.updatedAt = Date.now();
    if (id) return db.collection(C.referees).doc(id).set(data, { merge: true }).then(function () { return id; });
    data.createdAt = Date.now();
    data.refereeId = 'REF-' + new Date().getFullYear() + '-' + uid().slice(1, 6).toUpperCase();
    return db.collection(C.referees).add(data).then(function (r) { return r.id; });
  }
  function listReferees() {
    return db.collection(C.referees).get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }
  function deleteReferee(id) { return db.collection(C.referees).doc(id).delete(); }
  function getReferee(id) {
    return db.collection(C.referees).doc(id).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }

  /* -------------------------------------------------------------- results */
  function saveResult(catId, payload) {
    payload.updatedAt = Date.now();
    payload.published = true;
    return db.collection(C.results).doc(catId).set(payload, { merge: true }).then(function () { return catId; });
  }
  function listResults(tournamentId) {
    var q = db.collection(C.results);
    if (tournamentId) q = q.where('tournamentId', '==', tournamentId);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }
  function watchResults(tournamentId, cb) {
    var q = db.collection(C.results);
    if (tournamentId) q = q.where('tournamentId', '==', tournamentId);
    return q.onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
    }, function () { cb([]); });
  }

  /* --------------------------------------------------------- certificates */
  function certNumber(tournamentId, seq) {
    return 'ACC-' + new Date().getFullYear() + '-' + String(tournamentId).slice(0, 4).toUpperCase() + '-' + pad(seq, 5);
  }
  function listCertificates(filter) {
    var q = db.collection(C.certificates);
    if (filter && filter.tournamentId) q = q.where('tournamentId', '==', filter.tournamentId);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }
  function getCertificate(id) {
    return db.collection(C.certificates).doc(id).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }

  /* Generates certificates for one published category result. Idempotent:
     re-running replaces the same deterministic document ids. */
  function generateCertificatesForCategory(tournament, catId, result, playersInCat) {
    var batch = db.batch();
    var seq = 0;
    var made = [];
    function put(holderType, holder, type, medal) {
      seq++;
      var docId = catId + '__' + holderType + '__' + (holder.id || holder.uid || seq);
      var rec = {
        tournamentId: tournament.id,
        tournamentName: tournament.name || '',
        tournamentLogo: tournament.logo || '',
        categoryId: catId,
        holderType: holderType,
        holderId: holder.id || holder.uid || '',
        name: holder.name || holder.coachName || holder.playerName || '',
        academy: holder.academy || holder.academyName || '',
        district: holder.district || '',
        state: holder.state || '',
        category: (result && result.categoryLabel) || '',
        type: type,
        medal: medal || '',
        certNo: certNumber(tournament.id, seq),
        issuedAt: Date.now(),
        venue: tournament.venue || '',
        date: tournament.date || ''
      };
      batch.set(db.collection(C.certificates).doc(docId), rec, { merge: true });
      made.push(Object.assign({ id: docId }, rec));
    }

    var medalMap = {};
    D.medals.forEach(function (m) { if (result[m]) medalMap[result[m]] = m; });

    playersInCat.forEach(function (p) {
      var m = medalMap[p.id];
      if (m) put('player', { id: p.id, name: p.name, academy: p.academy, district: p.district, state: p.state },
                 'Merit Certificate', m.indexOf('bronze') === 0 ? 'bronze' : m);
      else put('player', { id: p.id, name: p.name, academy: p.academy, district: p.district, state: p.state },
               'Participation Certificate', '');
    });

    return batch.commit().then(function () { return made; });
  }

  function generateStaffCertificate(tournament, holderType, holder, type) {
    var docId = tournament.id + '__' + holderType + '__' + (holder.id || uid());
    var rec = {
      tournamentId: tournament.id,
      tournamentName: tournament.name || '',
      tournamentLogo: tournament.logo || '',
      holderType: holderType,
      holderId: holder.id || '',
      name: holder.name || holder.coachName || '',
      academy: holder.academy || holder.academyName || '',
      district: holder.district || '',
      state: holder.state || '',
      type: type,
      medal: '',
      certNo: certNumber(tournament.id, Math.floor(Math.random() * 90000) + 1000),
      issuedAt: Date.now(),
      venue: tournament.venue || '',
      date: tournament.date || ''
    };
    return db.collection(C.certificates).doc(docId).set(rec, { merge: true })
      .then(function () { return Object.assign({ id: docId }, rec); });
  }

  /* ------------------------------------------------------- draw generator */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* mode: 'random' | 'seeded' — returns rounds[][] of {a,b} pairs, byes = null slot */
  function generateDraw(players, mode) {
    var list = (mode === 'seeded')
      ? players.slice().sort(function (x, y) {
          return String(x.academy || '').localeCompare(String(y.academy || '')) ||
                 String(x.district || '').localeCompare(String(y.district || ''));
        })
      : shuffle(players);

    var n = list.length;
    if (!n) return { rounds: [], byes: [], size: 0 };
    var size = 1; while (size < n) size *= 2;
    var byesCount = size - n;

    /* Distribute byes to top slots (seeded) or randomly (random) */
    var slots = list.slice();
    for (var i = 0; i < byesCount; i++) slots.push(null);
    if (mode !== 'seeded') slots = shuffle(slots);

    var round1 = [];
    for (var k = 0; k < size; k += 2) round1.push({ a: slots[k] || null, b: slots[k + 1] || null });

    var rounds = [round1];
    var count = size / 2;
    while (count > 1) {
      count = count / 2;
      var r = [];
      for (var q = 0; q < count; q++) r.push({ a: null, b: null });
      rounds.push(r);
    }
    return { rounds: rounds, byes: byesCount, size: size };
  }

  /* Persisted draw sheets — collection: draws (doc id = categoryId) */
  function saveDraw(tournament, cat, drawData, mode) {
    var rec = {
      tournamentId: tournament.id || tournament,
      tournamentName: tournament.name || '',
      categoryId: cat.id,
      categoryLabel: cat.label || '',
      ageKey: cat.ageKey || '',
      gender: cat.gender || '',
      weight: cat.weight || '',
      mode: mode || 'random',
      entries: (cat.players || []).length,
      byes: drawData.byes || 0,
      size: drawData.size || 0,
      rounds: (drawData.rounds || []).map(function (r) {
        return r.map(function (m) {
          function slim(p) { return p ? { id: p.id, name: p.name || '', academy: p.academy || '', district: p.district || '' } : null; }
          return { a: slim(m.a), b: slim(m.b) };
        });
      }),
      published: true,
      updatedAt: Date.now()
    };
    return db.collection(C.draws).doc(cat.id).set(rec, { merge: true }).then(function () { return rec; });
  }
  function listDraws(tournamentId) {
    var q = db.collection(C.draws);
    if (tournamentId) q = q.where('tournamentId', '==', tournamentId);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }
  function watchDraws(tournamentId, cb) {
    var q = db.collection(C.draws);
    if (tournamentId) q = q.where('tournamentId', '==', tournamentId);
    return q.onSnapshot(function (s) {
      cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
    });
  }
  function deleteDraw(catId) { return db.collection(C.draws).doc(catId).delete(); }

  /* ---------------------------------------------------------- medal table */
  function medalTable(results, players, groupBy) {
    var byId = {};
    players.forEach(function (p) { byId[p.id] = p; });
    var map = {};
    function bump(key, medal) {
      if (!key) key = 'Unknown';
      if (!map[key]) map[key] = { name: key, gold: 0, silver: 0, bronze: 0, points: 0 };
      if (medal === 'gold') { map[key].gold++; map[key].points += 5; }
      else if (medal === 'silver') { map[key].silver++; map[key].points += 3; }
      else { map[key].bronze++; map[key].points += 1; }
    }
    results.forEach(function (r) {
      D.medals.forEach(function (m) {
        var pid = r[m];
        if (!pid) return;
        var p = byId[pid];
        if (!p) return;
        var key = groupBy === 'district' ? p.district : (groupBy === 'state' ? p.state : p.academy);
        bump(key, m.indexOf('bronze') === 0 ? 'bronze' : m);
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) {
        return b.points - a.points || b.gold - a.gold || b.silver - a.silver || a.name.localeCompare(b.name);
      });
  }

  /* Optional snapshot of a computed tally into the medalTable collection */
  function publishMedalTable(tournamentId, groupBy, rows) {
    return db.collection(C.medalTable).doc(tournamentId + '__' + (groupBy || 'academy'))
      .set({ tournamentId: tournamentId, groupBy: groupBy || 'academy', rows: rows, updatedAt: Date.now() }, { merge: true });
  }
  function listMedalTable(tournamentId) {
    return db.collection(C.medalTable).where('tournamentId', '==', tournamentId).get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  /* Category master records (collection: categories) — written when a draw or
     result is published so the public portal can list active categories. */
  function saveCategory(tournamentId, cat) {
    return db.collection(C.categories).doc(cat.id).set({
      tournamentId: tournamentId,
      label: cat.label || '',
      ageKey: cat.ageKey || '',
      gender: cat.gender || '',
      weight: cat.weight || '',
      entries: (cat.players || []).length,
      updatedAt: Date.now()
    }, { merge: true });
  }
  function listCategories(tournamentId) {
    var q = db.collection(C.categories);
    if (tournamentId) q = q.where('tournamentId', '==', tournamentId);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  /* ---------------------------------------------------------- export util */
  function toCSV(rows, headers) {
    var head = headers || (rows[0] ? Object.keys(rows[0]) : []);
    var out = [head.join(',')];
    rows.forEach(function (r) {
      out.push(head.map(function (h) {
        var v = r[h] == null ? '' : String(r[h]);
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(','));
    });
    return out.join('\n');
  }
  function download(name, content, mime) {
    var blob = (content instanceof Blob) ? content : new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportCSV(name, rows, headers) { download(name + '.csv', toCSV(rows, headers), 'text/csv;charset=utf-8'); toast('CSV exported', 'success'); }
  function exportExcel(name, rows) {
    if (typeof XLSX === 'undefined') { exportCSV(name, rows); return; }
    var ws = XLSX.utils.json_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, name + '.xlsx');
    toast('Excel exported', 'success');
  }
  function exportJSON(name, data) { download(name + '.json', JSON.stringify(data, null, 2), 'application/json'); toast('JSON exported', 'success'); }

  /* Prints any HTML fragment as a clean A4 document (browser → Save as PDF) */
  function printHTML(title, innerHTML, extraCSS) {
    var w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) { toast('Allow pop-ups to print / download PDF', 'error'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">' +
      '<style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#fff;color:#0a1633;padding:16px}' +
      '@page{size:A4;margin:10mm}' + (extraCSS || '') + '</style></head><body>' + innerHTML + '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 700);
  }

  /* ------------------------------------------------------------- exports  */
  root.TCore = {
    db: db, auth: auth, C: C, D: D,
    esc: esc, pad: pad, uid: uid, todayISO: todayISO, fmtDate: fmtDate, toast: toast,
    loadCategoryRules: loadCategoryRules, saveCategoryRules: saveCategoryRules, getRules: getRules,
    calcAge: calcAge, ageCategory: ageCategory, weightCategory: weightCategory,
    normGender: normGender, categoryLabel: categoryLabel, categoryId: categoryId,
    buildPlayerCategories: buildPlayerCategories,
    uploadImage: uploadImage, qrUrl: qrUrl, verifyUrl: verifyUrl,
    googleLogin: googleLogin, logout: logout, onAuth: onAuth, currentUser: currentUser, isAdmin: isAdmin,
    listTournaments: listTournaments, getTournament: getTournament, saveTournament: saveTournament,
    deleteTournament: deleteTournament, watchTournaments: watchTournaments,
    getCoach: getCoach, saveCoach: saveCoach, listCoaches: listCoaches, watchCoaches: watchCoaches,
    savePlayer: savePlayer, deletePlayer: deletePlayer, getPlayer: getPlayer,
    setPlayerStatus: setPlayerStatus, watchPlayers: watchPlayers, listPlayers: listPlayers,
    saveReferee: saveReferee, listReferees: listReferees, deleteReferee: deleteReferee, getReferee: getReferee,
    saveResult: saveResult, listResults: listResults, watchResults: watchResults,
    listCertificates: listCertificates, getCertificate: getCertificate,
    generateCertificatesForCategory: generateCertificatesForCategory,
    generateStaffCertificate: generateStaffCertificate,
    generateDraw: generateDraw, saveDraw: saveDraw, listDraws: listDraws, watchDraws: watchDraws, deleteDraw: deleteDraw,
    medalTable: medalTable, publishMedalTable: publishMedalTable, listMedalTable: listMedalTable,
    saveCategory: saveCategory, listCategories: listCategories,
    exportCSV: exportCSV, exportExcel: exportExcel, exportJSON: exportJSON,
    toCSV: toCSV, download: download, printHTML: printHTML
  };
})(window);
