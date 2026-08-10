/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP — Core data + logic layer (window.TCore)
 Firebase compat. Reuses the existing app initialised by config/firebase-init.js
 Requires: firebase-app-compat, firebase-auth-compat, firebase-firestore-compat
 (firebase-storage-compat optional — photos fall back to base64)
 Load after config/tournament-config.js (window.TOURNAMENT_DEFAULTS).
 ============================================================================ */
(function (root) {
  'use strict';

  var D = root.TOURNAMENT_DEFAULTS;
  if (!D) { console.error('[TCore] tournament-config.js must load first'); return; }
  if (typeof firebase === 'undefined') { console.error('[TCore] firebase SDK missing'); return; }

  var C = D.collections;
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
  function uid() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function fmtDate(d) {
    if (!d) return '—';
    var dt = (d.toDate) ? d.toDate() : new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function truncate(str, n) {
    str = String(str == null ? '' : str);
    n = n || 40;
    return str.length <= n ? str : str.slice(0, n - 1) + '…';
  }

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

  /* ------------------------------------------------------------------ QR */
  function qrUrl(text, size) {
    size = size || 160;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
      '&data=' + encodeURIComponent(text);
  }
  function verifyUrl(type, id) {
    var base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return base + 'tournament-verify.html?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
  }

  /* --------------------------------------------------------------- auth */
  function friendlyAuthError(err) {
    var code = err && err.code ? err.code : '';
    var map = {
      'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add “' + location.hostname + '” under Firebase Console → Authentication → Settings → Authorized domains.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console → Authentication → Sign-in method.',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
      'auth/cancelled-popup-request': 'Sign-in popup was cancelled.',
      'auth/operation-not-supported-in-this-environment': 'Popup sign-in is not supported here; redirect sign-in will be used.',
      'auth/invalid-app-credential': 'App credential / reCAPTCHA failed. For Phone OTP, enable Phone sign-in and authorize this domain in Firebase Console.',
      'auth/invalid-phone-number': 'Invalid phone number. Use E.164 format, e.g. +919876543210.',
      'auth/missing-phone-number': 'Enter a phone number in E.164 format (+country code…).',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed. Refresh and try again.',
      'auth/invalid-verification-code': 'Invalid OTP code. Check the SMS and try again.',
      'auth/code-expired': 'OTP expired. Request a new code.',
      'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method for this email/phone.'
    };
    return map[code] || (err && err.message ? err.message : 'Authentication failed');
  }

  var authRedirectHandled = false;
  function initAuthRedirect() {
    if (authRedirectHandled) return Promise.resolve(null);
    authRedirectHandled = true;
    return auth.getRedirectResult().then(function (result) {
      if (result && result.user) return result;
      return null;
    }).catch(function (err) {
      toast(friendlyAuthError(err), 'error');
      return null;
    });
  }

  function googleLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider).catch(function (err) {
      var code = err && err.code ? err.code : '';
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' ||
          code === 'auth/operation-not-supported-in-this-environment') {
        try { sessionStorage.setItem('tAuthReturn', location.href); } catch (e) { /* ignore */ }
        return auth.signInWithRedirect(provider);
      }
      return Promise.reject(new Error(friendlyAuthError(err)));
    });
  }

  function startPhoneLogin(phoneE164, containerOrBtnId) {
    var el = (typeof containerOrBtnId === 'string')
      ? document.getElementById(containerOrBtnId)
      : containerOrBtnId;
    if (!el) return Promise.reject(new Error('reCAPTCHA container not found'));
    if (root.__tRecaptcha) {
      try { root.__tRecaptcha.clear(); } catch (e) { /* ignore */ }
      root.__tRecaptcha = null;
    }
    root.__tRecaptcha = new firebase.auth.RecaptchaVerifier(el, {
      size: 'normal',
      callback: function () { /* solved */ },
      'expired-callback': function () { toast('reCAPTCHA expired — try again', 'warn'); }
    });
    return root.__tRecaptcha.render().then(function () {
      return auth.signInWithPhoneNumber(phoneE164, root.__tRecaptcha);
    }).then(function (confirm) {
      root.__tPhoneConfirm = confirm;
      return confirm;
    }).catch(function (err) {
      return Promise.reject(new Error(friendlyAuthError(err)));
    });
  }
  function confirmPhoneLogin(code) {
    if (!root.__tPhoneConfirm) return Promise.reject(new Error('No phone confirmation pending — send OTP first'));
    return root.__tPhoneConfirm.confirm(code).catch(function (err) {
      return Promise.reject(new Error(friendlyAuthError(err)));
    });
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
  function coachIdFromUid(uidStr) {
    return 'ACC-' + new Date().getFullYear() + '-' + uidStr.slice(0, 6).toUpperCase();
  }
  function getCoach(uidStr) {
    return db.collection(C.coaches).doc(uidStr).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
  }
  function normalizeCoachStatus(st) {
    st = String(st || 'pending').toLowerCase();
    /* Legacy coaches used status "active" — treat as approved. */
    if (st === 'active') return 'approved';
    if (st === 'approved' || st === 'rejected' || st === 'pending') return st;
    return 'pending';
  }
  function saveCoach(uidStr, data) {
    data.updatedAt = Date.now();
    if (!data.coachId) data.coachId = coachIdFromUid(uidStr);
    return getCoach(uidStr).then(function (existing) {
      if (!existing) {
        data.createdAt = data.createdAt || Date.now();
        data.status = normalizeCoachStatus(data.status || 'pending');
      } else {
        if (!data.createdAt) data.createdAt = existing.createdAt || Date.now();
        if (!data.coachId) data.coachId = existing.coachId || coachIdFromUid(uidStr);
        /* Do not let profile edits silently clear admin approval status. */
        if (!data.status) data.status = existing.status || 'pending';
        else data.status = normalizeCoachStatus(data.status);
      }
      return db.collection(C.coaches).doc(uidStr).set(data, { merge: true }).then(function () { return data; });
    });
  }
  function setCoachStatus(ids, status) {
    var batch = db.batch();
    ids.forEach(function (i) {
      batch.update(db.collection(C.coaches).doc(i), { status: status, updatedAt: Date.now() });
    });
    return batch.commit();
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

  function filterPlayers(players, filters) {
    filters = filters || {};
    var q = String(filters.q || '').trim().toLowerCase();
    return players.filter(function (p) {
      if (filters.tournamentId && p.tournamentId !== filters.tournamentId) return false;
      if (filters.coachUid && p.coachUid !== filters.coachUid) return false;
      if (filters.coach && String(p.coachName || '').toLowerCase().indexOf(String(filters.coach).toLowerCase()) === -1) return false;
      if (filters.academy && String(p.academy || '').toLowerCase().indexOf(String(filters.academy).toLowerCase()) === -1) return false;
      if (filters.school && String(p.school || '').toLowerCase().indexOf(String(filters.school).toLowerCase()) === -1) return false;
      if (filters.district && String(p.district || '').toLowerCase().indexOf(String(filters.district).toLowerCase()) === -1) return false;
      if (filters.state && String(p.state || '').toLowerCase().indexOf(String(filters.state).toLowerCase()) === -1) return false;
      if (filters.gender && normGender(p.gender) !== normGender(filters.gender)) return false;
      if (filters.ageKey && p.ageKey !== filters.ageKey) return false;
      if (filters.weightCategory && String(p.weightCategory) !== String(filters.weightCategory)) return false;
      if (filters.status && (p.status || 'pending') !== filters.status) return false;
      if (q) {
        var hay = [p.name, p.regNo, p.academy, p.school, p.district, p.state, p.coachName, p.phone, p.fatherName]
          .map(function (v) { return String(v || '').toLowerCase(); }).join(' ');
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function groupCounts(players, field) {
    var map = {};
    players.forEach(function (p) {
      var k = String(p[field] || 'Unknown').trim() || 'Unknown';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map).map(function (k) { return { name: k, count: map[k] }; })
      .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
  }

  function computeStats(players, results) {
    players = players || [];
    results = results || [];
    var stats = {
      total: players.length,
      boys: 0,
      girls: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      academies: 0,
      districts: 0,
      schools: 0,
      states: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      completedCategories: results.length,
      pendingCategories: 0
    };
    var acad = {}, dist = {}, school = {}, state = {};
    players.forEach(function (p) {
      var g = normGender(p.gender);
      if (g === 'male') stats.boys++; else stats.girls++;
      var st = p.status || 'pending';
      if (st === 'approved') stats.approved++;
      else if (st === 'rejected') stats.rejected++;
      else stats.pending++;
      if (p.academy) acad[p.academy] = 1;
      if (p.district) dist[p.district] = 1;
      if (p.school) school[p.school] = 1;
      if (p.state) state[p.state] = 1;
    });
    stats.academies = Object.keys(acad).length;
    stats.districts = Object.keys(dist).length;
    stats.schools = Object.keys(school).length;
    stats.states = Object.keys(state).length;
    results.forEach(function (r) {
      if (r.gold) stats.gold++;
      if (r.silver) stats.silver++;
      if (r.bronze1) stats.bronze++;
      if (r.bronze2) stats.bronze++;
    });
    return stats;
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

  function publishCategoryFromDraw(tournament, cat, drawData) {
    var medals = deriveMedalsFromDraw(drawData);
    var payload = {
      tournamentId: tournament.id || tournament,
      categoryId: cat.id,
      categoryLabel: cat.label || '',
      ageKey: cat.ageKey || '',
      gender: cat.gender || '',
      weightCategory: cat.weight || '',
      gold: medals.gold || '',
      silver: medals.silver || '',
      bronze1: medals.bronze1 || '',
      bronze2: medals.bronze2 || '',
      published: true,
      updatedAt: Date.now()
    };
    return saveResult(cat.id, payload).then(function () {
      var batch = db.batch();
      var medalFields = { gold: 'gold', silver: 'silver', bronze1: 'bronze', bronze2: 'bronze' };
      Object.keys(medalFields).forEach(function (k) {
        var pid = medals[k];
        if (!pid) return;
        batch.update(db.collection(C.players).doc(pid), {
          medal: medalFields[k],
          medalCategory: cat.label || '',
          updatedAt: Date.now()
        });
      });
      return batch.commit().catch(function () { /* player medal update is best-effort */ })
        .then(function () { return payload; });
    });
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
        school: holder.school || '',
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
      if (m) put('player', { id: p.id, name: p.name, academy: p.academy, school: p.school, district: p.district, state: p.state },
        'Merit Certificate', m.indexOf('bronze') === 0 ? 'bronze' : m);
      else put('player', { id: p.id, name: p.name, academy: p.academy, school: p.school, district: p.district, state: p.state },
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
      school: holder.school || '',
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

  /* ------------------------------------------------------- draw / fixture */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function slimPlayer(p) {
    if (!p) return null;
    return {
      id: p.id,
      name: p.name || '',
      regNo: p.regNo || '',
      academy: p.academy || '',
      school: p.school || '',
      district: p.district || '',
      coachName: p.coachName || '',
      coachId: p.coachId || '',
      ageCategory: p.ageCategory || '',
      weightCategory: p.weightCategory || '',
      gender: p.gender || '',
      photo: p.photo || ''
    };
  }

  function newMatch(roundIndex, matchIndex, a, b) {
    return {
      matchNo: 0,
      roundIndex: roundIndex,
      matchIndex: matchIndex,
      a: a || null,
      b: b || null,
      winner: null,
      score: '',
      locked: false,
      status: 'pending'
    };
  }

  function assignMatchNumbers(drawData) {
    var n = 1;
    (drawData.rounds || []).forEach(function (round) {
      round.forEach(function (m) { m.matchNo = n++; });
    });
    return drawData;
  }

  function advanceWinner(drawData, roundIndex, matchIndex, side) {
    var rounds = drawData.rounds;
    if (!rounds || roundIndex >= rounds.length - 1) return;
    var match = rounds[roundIndex][matchIndex];
    var player = side === 'a' ? match.a : match.b;
    var nextRound = rounds[roundIndex + 1];
    var nextMatchIndex = Math.floor(matchIndex / 2);
    var nextSide = (matchIndex % 2 === 0) ? 'a' : 'b';
    if (!nextRound || !nextRound[nextMatchIndex]) return;
    nextRound[nextMatchIndex][nextSide] = player ? slimPlayer(player) : null;
  }

  function clearForwardFrom(drawData, roundIndex, matchIndex) {
    var rounds = drawData.rounds;
    if (!rounds || roundIndex >= rounds.length - 1) return;
    var nextRound = rounds[roundIndex + 1];
    var nextMatchIndex = Math.floor(matchIndex / 2);
    var nextSide = (matchIndex % 2 === 0) ? 'a' : 'b';
    if (!nextRound || !nextRound[nextMatchIndex]) return;
    nextRound[nextMatchIndex][nextSide] = null;
    nextRound[nextMatchIndex].winner = null;
    nextRound[nextMatchIndex].score = '';
    nextRound[nextMatchIndex].locked = false;
    nextRound[nextMatchIndex].status = 'pending';
    clearForwardFrom(drawData, roundIndex + 1, nextMatchIndex);
  }

  function matchPlayerId(p) { return p && (p.id || p.playerId) || null; }

  function applyByes(drawData) {
    var rounds = drawData.rounds || [];
    var changed = true;
    while (changed) {
      changed = false;
      for (var ri = 0; ri < rounds.length; ri++) {
        for (var mi = 0; mi < rounds[ri].length; mi++) {
          var m = rounds[ri][mi];
          if (m.status === 'complete' || m.status === 'bye') continue;
          var hasA = !!m.a;
          var hasB = !!m.b;
          if (hasA && hasB) continue;
          if (!hasA && !hasB) continue;
          var side = hasA ? 'a' : 'b';
          m.winner = side;
          m.score = 'BYE';
          m.locked = true;
          m.status = 'bye';
          advanceWinner(drawData, ri, mi, side);
          changed = true;
        }
      }
    }
    return drawData;
  }

  function generateDraw(players, mode) {
    var list = (mode === 'seeded')
      ? players.slice().sort(function (x, y) {
        return String(x.academy || '').localeCompare(String(y.academy || '')) ||
          String(x.district || '').localeCompare(String(y.district || ''));
      })
      : shuffle(players);

    var n = list.length;
    if (!n) {
      return {
        rounds: [],
        byes: 0,
        size: 0,
        placements: { first: null, second: null, bronze1: null, bronze2: null }
      };
    }
    var size = 1; while (size < n) size *= 2;
    var byesCount = size - n;

    var slots = list.slice();
    for (var i = 0; i < byesCount; i++) slots.push(null);
    if (mode !== 'seeded') slots = shuffle(slots);

    var round1 = [];
    for (var k = 0; k < size; k += 2) {
      round1.push(newMatch(0, k / 2, slots[k] ? slimPlayer(slots[k]) : null, slots[k + 1] ? slimPlayer(slots[k + 1]) : null));
    }

    var rounds = [round1];
    var count = size / 2;
    while (count > 1) {
      count = count / 2;
      var r = [];
      for (var q = 0; q < count; q++) r.push(newMatch(rounds.length, q, null, null));
      rounds.push(r);
    }

    var drawData = {
      rounds: rounds,
      byes: byesCount,
      size: size,
      placements: { first: null, second: null, bronze1: null, bronze2: null }
    };
    assignMatchNumbers(drawData);
    applyByes(drawData);
    return drawData;
  }

  function roundTitle(roundsLen, roundIndex) {
    var fromEnd = roundsLen - 1 - roundIndex;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semi Final';
    if (fromEnd === 2) return 'Quarter Final';
    return 'Round ' + (roundIndex + 1);
  }

  function setMatchWinner(drawData, roundIndex, matchIndex, side, score, opts) {
    opts = opts || {};
    var rounds = drawData.rounds;
    if (!rounds || !rounds[roundIndex] || !rounds[roundIndex][matchIndex]) return drawData;
    var m = rounds[roundIndex][matchIndex];
    if (m.locked && !opts.unlock) return drawData;
    clearForwardFrom(drawData, roundIndex, matchIndex);
    m.winner = side;
    m.score = score || '';
    m.status = 'complete';
    m.locked = !opts.unlock;
    advanceWinner(drawData, roundIndex, matchIndex, side);
    recomputePlacements(drawData);
    applyByes(drawData);
    return drawData;
  }

  function recomputePlacements(drawData) {
    var rounds = drawData.rounds || [];
    var placements = { first: null, second: null, bronze1: null, bronze2: null };
    if (!rounds.length) {
      drawData.placements = placements;
      return drawData;
    }
    var finalRound = rounds[rounds.length - 1];
    var finalMatch = finalRound && finalRound[0];
    if (finalMatch && finalMatch.winner) {
      var w = finalMatch.winner === 'a' ? finalMatch.a : finalMatch.b;
      var l = finalMatch.winner === 'a' ? finalMatch.b : finalMatch.a;
      placements.first = matchPlayerId(w);
      placements.second = matchPlayerId(l);
    }
    if (rounds.length >= 2) {
      var semis = rounds[rounds.length - 2] || [];
      var bronzes = [];
      semis.forEach(function (sm) {
        if (!sm || !sm.winner) return;
        var loser = sm.winner === 'a' ? sm.b : sm.a;
        var lid = matchPlayerId(loser);
        if (lid && bronzes.indexOf(lid) === -1) bronzes.push(lid);
      });
      placements.bronze1 = bronzes[0] || null;
      placements.bronze2 = bronzes[1] || null;
    }
    drawData.placements = placements;
    return drawData;
  }

  function unlockMatch(drawData, roundIndex, matchIndex) {
    var rounds = drawData.rounds;
    if (!rounds || !rounds[roundIndex] || !rounds[roundIndex][matchIndex]) return drawData;
    var m = rounds[roundIndex][matchIndex];
    clearForwardFrom(drawData, roundIndex, matchIndex);
    m.winner = null;
    m.score = '';
    m.locked = false;
    m.status = (m.a && m.b) ? 'pending' : ((m.a || m.b) ? 'bye' : 'pending');
    recomputePlacements(drawData);
    return drawData;
  }

  function swapMatchSides(drawData, roundIndex, matchIndex) {
    var rounds = drawData.rounds;
    if (!rounds || !rounds[roundIndex] || !rounds[roundIndex][matchIndex]) return drawData;
    var m = rounds[roundIndex][matchIndex];
    if (m.locked) return drawData;
    var t = m.a; m.a = m.b; m.b = t;
    if (m.winner === 'a') m.winner = 'b';
    else if (m.winner === 'b') m.winner = 'a';
    return drawData;
  }

  function movePlayerInDraw(drawData, fromRound, fromMatch, fromSide, toRound, toMatch, toSide) {
    var rounds = drawData.rounds;
    if (!rounds) return drawData;
    var src = rounds[fromRound] && rounds[fromRound][fromMatch];
    var dst = rounds[toRound] && rounds[toMatch][toMatch];
    if (!src || !dst) return drawData;
    if (src.locked || dst.locked) return drawData;
    var player = fromSide === 'a' ? src.a : src.b;
    if (toSide === 'a') dst.a = player; else dst.b = player;
    if (fromSide === 'a') src.a = null; else src.b = null;
    src.winner = null;
    src.score = '';
    src.status = 'pending';
    dst.winner = null;
    dst.score = '';
    dst.status = 'pending';
    applyByes(drawData);
    return drawData;
  }

  function flattenMatches(drawData) {
    var out = [];
    (drawData.rounds || []).forEach(function (round, ri) {
      round.forEach(function (m, mi) {
        out.push(Object.assign({}, m, { roundIndex: ri, matchIndex: mi }));
      });
    });
    return out;
  }

  function deriveMedalsFromDraw(drawData) {
    var p = drawData.placements || {};
    return {
      gold: p.first || null,
      silver: p.second || null,
      bronze1: p.bronze1 || null,
      bronze2: p.bronze2 || null
    };
  }

  function serializeDrawRounds(rounds) {
    return (rounds || []).map(function (r) {
      return r.map(function (m) {
        return {
          matchNo: m.matchNo,
          roundIndex: m.roundIndex,
          matchIndex: m.matchIndex,
          a: slimPlayer(m.a),
          b: slimPlayer(m.b),
          winner: m.winner || null,
          score: m.score || '',
          locked: !!m.locked,
          status: m.status || 'pending'
        };
      });
    });
  }

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
      rounds: serializeDrawRounds(drawData.rounds),
      placements: drawData.placements || { first: null, second: null, bronze1: null, bronze2: null },
      published: true,
      updatedAt: Date.now()
    };
    return db.collection(C.draws).doc(cat.id).set(rec, { merge: true }).then(function () { return rec; });
  }
  function getDraw(catId) {
    return db.collection(C.draws).doc(catId).get()
      .then(function (d) { return d.exists ? Object.assign({ id: d.id }, d.data()) : null; });
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

  /* ---------------------------------------------------------- match docs */
  function saveMatchDoc(catId, match) {
    var docId = catId + '__' + match.roundIndex + '__' + match.matchIndex;
    var rec = Object.assign({}, match, {
      categoryId: catId,
      updatedAt: Date.now()
    });
    return db.collection(C.matches).doc(docId).set(rec, { merge: true }).then(function () { return docId; });
  }
  function listMatchDocs(catId) {
    var q = db.collection(C.matches);
    if (catId) q = q.where('categoryId', '==', catId);
    return q.get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

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
        var key;
        if (groupBy === 'district') key = p.district;
        else if (groupBy === 'state') key = p.state;
        else if (groupBy === 'school') key = p.school;
        else key = p.academy;
        bump(key, m.indexOf('bronze') === 0 ? 'bronze' : m);
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) {
        return b.points - a.points || b.gold - a.gold || b.silver - a.silver || a.name.localeCompare(b.name);
      });
  }

  function publishMedalTable(tournamentId, groupBy, rows) {
    return db.collection(C.medalTable).doc(tournamentId + '__' + (groupBy || 'academy'))
      .set({ tournamentId: tournamentId, groupBy: groupBy || 'academy', rows: rows, updatedAt: Date.now() }, { merge: true });
  }
  function listMedalTable(tournamentId) {
    return db.collection(C.medalTable).where('tournamentId', '==', tournamentId).get().then(function (s) {
      return s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  /* ----------------------------------------------------------- categories */
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

  function printHTML(title, innerHTML, extraCSS, landscape) {
    var w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) { toast('Allow pop-ups to print / download PDF', 'error'); return; }
    var pageRule = landscape ? '@page{size:A4 landscape;margin:8mm}' : '@page{size:A4;margin:10mm}';
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' +
      '*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:#fff;color:#0a1633;padding:16px}' +
      pageRule + (extraCSS || '') + '</style></head><body>' + innerHTML + '</body></html>');
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 700);
  }

  /* ------------------------------------------------------------- exports */
  root.TCore = {
    db: db, auth: auth, C: C, D: D,
    esc: esc, pad: pad, uid: uid, todayISO: todayISO, fmtDate: fmtDate, toast: toast, truncate: truncate,
    loadCategoryRules: loadCategoryRules, saveCategoryRules: saveCategoryRules, getRules: getRules,
    calcAge: calcAge, ageCategory: ageCategory, weightCategory: weightCategory,
    normGender: normGender, categoryLabel: categoryLabel, categoryId: categoryId,
    buildPlayerCategories: buildPlayerCategories,
    uploadImage: uploadImage, qrUrl: qrUrl, verifyUrl: verifyUrl,
    friendlyAuthError: friendlyAuthError, initAuthRedirect: initAuthRedirect,
    googleLogin: googleLogin, startPhoneLogin: startPhoneLogin, confirmPhoneLogin: confirmPhoneLogin,
    logout: logout, onAuth: onAuth, currentUser: currentUser, isAdmin: isAdmin,
    listTournaments: listTournaments, getTournament: getTournament, saveTournament: saveTournament,
    deleteTournament: deleteTournament, watchTournaments: watchTournaments,
    getCoach: getCoach, saveCoach: saveCoach, setCoachStatus: setCoachStatus,
    normalizeCoachStatus: normalizeCoachStatus,
    listCoaches: listCoaches, watchCoaches: watchCoaches,
    nextRegNo: nextRegNo, savePlayer: savePlayer, deletePlayer: deletePlayer, getPlayer: getPlayer,
    setPlayerStatus: setPlayerStatus, watchPlayers: watchPlayers, listPlayers: listPlayers,
    filterPlayers: filterPlayers, groupCounts: groupCounts, computeStats: computeStats,
    saveReferee: saveReferee, listReferees: listReferees, deleteReferee: deleteReferee, getReferee: getReferee,
    saveResult: saveResult, listResults: listResults, watchResults: watchResults,
    publishCategoryFromDraw: publishCategoryFromDraw,
    listCertificates: listCertificates, getCertificate: getCertificate, certNumber: certNumber,
    generateCertificatesForCategory: generateCertificatesForCategory,
    generateStaffCertificate: generateStaffCertificate,
    generateDraw: generateDraw, applyByes: applyByes, slimPlayer: slimPlayer,
    setMatchWinner: setMatchWinner, unlockMatch: unlockMatch, swapMatchSides: swapMatchSides,
    movePlayerInDraw: movePlayerInDraw, flattenMatches: flattenMatches,
    deriveMedalsFromDraw: deriveMedalsFromDraw, roundTitle: roundTitle,
    recomputePlacements: recomputePlacements,
    saveDraw: saveDraw, getDraw: getDraw, listDraws: listDraws, watchDraws: watchDraws, deleteDraw: deleteDraw,
    saveMatchDoc: saveMatchDoc, listMatchDocs: listMatchDocs,
    medalTable: medalTable, publishMedalTable: publishMedalTable, listMedalTable: listMedalTable,
    saveCategory: saveCategory, listCategories: listCategories,
    exportCSV: exportCSV, exportExcel: exportExcel, exportJSON: exportJSON,
    toCSV: toCSV, download: download, printHTML: printHTML
  };
})(window);
