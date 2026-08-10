/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP 2026 — Tournament Printables
 Premium certificates + international accreditation passes. window.TPrint (ES5).
 ============================================================================ */
(function (root) {
  'use strict';

  var NAVY = '#061428';
  var NAVY2 = '#0c2d5e';
  var GOLD = '#b8941f';
  var GOLD2 = '#e4c65a';
  var IVORY = '#faf8f2';
  var EVENT_DATE = '22 AUGUST 2026';

  var ROLE_THEMES = {
    athlete: { key: 'athlete', label: 'ATHLETE', cls: 'tp-pass-athlete' },
    coach: { key: 'coach', label: 'COACH', cls: 'tp-pass-coach' },
    referee: { key: 'referee', label: 'REFEREE', cls: 'tp-pass-referee' },
    vip: { key: 'vip', label: 'VIP GUEST', cls: 'tp-pass-vip' }
  };

  var SIGNATORIES = {
    left: {
      name: 'G.S. CHAUHAN',
      lines: [
        'FOUNDER',
        'PHYSICALEDUCATIONCAREER.IN',
        'MASTER OF PHYSICAL EDUCATION',
        'NIS QUALIFIED COACH'
      ],
      sig: 'M8,34 C22,12 48,8 68,18 C88,28 96,42 108,28 C118,16 132,10 142,18 C128,26 110,38 88,40 C62,42 38,36 22,28 C14,24 10,30 8,34 Z M118,32 C126,24 138,20 148,26 C140,22 128,22 118,32 Z'
    },
    right: {
      name: 'TAPESH YADAV',
      lines: [
        'TOURNAMENT DIRECTOR',
        'BACHELOR OF PHYSICAL EDUCATION',
        'NATIONAL REFEREE'
      ],
      sig: 'M6,28 C18,14 34,10 52,16 C70,22 78,34 90,24 C102,14 118,8 132,14 C118,22 100,32 78,36 C54,40 30,34 16,26 C10,22 6,24 6,28 Z M104,26 C112,20 124,18 136,24 C126,20 114,20 104,26 Z'
    }
  };

  function esc(s) {
    if (root.TCore && root.TCore.esc) return root.TCore.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function eventFullName(brand) {
    if (brand && brand.eventFullName) return brand.eventFullName;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.eventFullName) {
      return root.TOURNAMENT_DEFAULTS.eventFullName;
    }
    return '6TH ALWAR CUP TAEKWONDO CHAMPIONSHIP 2026';
  }

  function eventLocation(brand) {
    if (brand && brand.eventLocation) return brand.eventLocation;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.eventLocation) {
      return root.TOURNAMENT_DEFAULTS.eventLocation;
    }
    return 'ALWAR, RAJASTHAN';
  }

  function website(brand) {
    if (brand && brand.website) return brand.website;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.website) {
      return root.TOURNAMENT_DEFAULTS.website;
    }
    return 'physicaleducationcareer.in';
  }

  function logoImage(brand) {
    if (brand && brand.logoImage) return brand.logoImage;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.logoImage) {
      return root.TOURNAMENT_DEFAULTS.logoImage;
    }
    return 'ultimate-logo.svg';
  }

  function pecLogoImage(brand) {
    if (brand && brand.pecLogoImage) return brand.pecLogoImage;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.pecLogoImage) {
      return root.TOURNAMENT_DEFAULTS.pecLogoImage;
    }
    return 'pec-logo.svg';
  }

  function meritOrdinal(medal) {
    var m = String(medal || '').toLowerCase();
    if (m === 'gold') return '1st';
    if (m === 'silver') return '2nd';
    if (m.indexOf('bronze') >= 0) return '3rd';
    return '';
  }

  function pronoun(gender) {
    var s = String(gender || '').toLowerCase();
    if (s === 'female' || s === 'f') return 'She';
    return 'He';
  }

  function pronounObj(gender) {
    return pronoun(gender) === 'She' ? 'her' : 'him';
  }

  function ageWeightLine(cert) {
    var age = cert.ageCategory || cert.ageName || '';
    var wt = weightLabel(cert.weightCategory || cert.weight);
    if (age && wt) return age.toUpperCase() + ' — ' + wt;
    return (age || wt || '').toUpperCase();
  }

  function academySchoolLine(cert) {
    var parts = [];
    if (cert.academy) parts.push(cert.academy);
    if (cert.school) parts.push(cert.school);
    if (cert.district && parts.length < 2) parts.push(cert.district);
    return parts.join(' · ');
  }

  function fmtDate(d) {
    if (!d) return EVENT_DATE;
    if (root.TCore && root.TCore.fmtDate) return root.TCore.fmtDate(d);
    try {
      var dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
      }
    } catch (e) { /* ignore */ }
    return String(d).toUpperCase();
  }

  function localVerifyUrl(type, id) {
    if (root.TCore && root.TCore.verifyUrl) {
      return root.TCore.verifyUrl(type, id);
    }
    if (typeof location !== 'undefined') {
      var base = location.origin + location.pathname.replace(/[^/]*$/, '');
      return base + 'tournament-verify.html?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
    }
    return 'https://' + website({}) + '/tournament-verify.html?type=' + encodeURIComponent(type) + '&id=' + encodeURIComponent(id);
  }

  function qrImg(verifyUrl, cls, size) {
    size = size || 180;
    var url = verifyUrl;
    if (root.TQR && root.TQR.dataUrl) {
      var data = root.TQR.dataUrl(verifyUrl, size);
      if (data) url = data;
    } else if (root.TCore && root.TCore.qrUrl) {
      url = root.TCore.qrUrl(verifyUrl, size);
    }
    return '<img src="' + url + '" alt="QR Code" class="' + cls + '" width="' + size + '" height="' + size + '" />';
  }

  function verifyPlayerUrl(holder) {
    return localVerifyUrl('player', holder.id);
  }

  function verifyCertUrl(cert) {
    return localVerifyUrl('certificate', cert.id || cert.certId || cert.certNo);
  }

  function verifyRefereeUrl(holder) {
    return localVerifyUrl('referee', holder.id);
  }

  function verifyCoachUrl(holder, tournament) {
    if (tournament && tournament.id && holder.id) {
      return localVerifyUrl('certificate', tournament.id + '__coach__' + holder.id);
    }
    return 'https://' + website({});
  }

  function isTeamUltimate(holder) {
    var a = String(holder.academy || holder.academyName || '').toLowerCase();
    return a.indexOf('ultimate') >= 0 || a.indexOf('team ultimate') >= 0;
  }

  function detectCardRole(holder, roleOverride) {
    if (roleOverride && ROLE_THEMES[roleOverride]) return roleOverride;
    if (holder.cardRole && ROLE_THEMES[holder.cardRole]) return holder.cardRole;
    if (holder.holderType === 'vip' || holder.vipId) return 'vip';
    if (holder.holderType === 'referee' || holder.refereeId) return 'referee';
    if (holder.holderType === 'coach') return 'coach';
    if (holder.coachId && !holder.regNo && !holder.weightCategory) return 'coach';
    return 'athlete';
  }

  function verifyUrlForRole(holder, role, tournament) {
    if (role === 'referee') return verifyRefereeUrl(holder);
    if (role === 'coach') return verifyCoachUrl(holder, tournament);
    if (role === 'vip') {
      return localVerifyUrl('certificate', holder.certId || holder.id);
    }
    return verifyPlayerUrl(holder);
  }

  function photoHtml(holder, cls) {
    var src = holder.photo || holder.photoUrl || '';
    if (src) {
      return '<div class="tp-photo-frame"><img src="' + esc(src) + '" alt="" class="' + cls + '" /></div>';
    }
    return '<div class="tp-photo-frame"><div class="' + cls + ' tp-photo-ph"><span>PHOTO</span></div></div>';
  }

  function genderLabel(g) {
    if (!g) return '';
    var s = String(g).toLowerCase();
    if (s === 'male' || s === 'm') return 'Male';
    if (s === 'female' || s === 'f') return 'Female';
    return String(g);
  }

  function weightLabel(w) {
    if (!w) return '';
    var s = String(w).trim();
    if (!s) return '';
    if (s.charAt(0) !== '-') s = '-' + s;
    return s + ' Kg';
  }

  function medalLabel(medal) {
    var m = String(medal || '').toLowerCase();
    if (m === 'gold') return 'GOLD MEDAL';
    if (m === 'silver') return 'SILVER MEDAL';
    if (m.indexOf('bronze') >= 0) return 'BRONZE MEDAL';
    return '';
  }

  function medalPosition(medal) {
    var m = String(medal || '').toLowerCase();
    if (m === 'gold') return '1ST PLACE — GOLD';
    if (m === 'silver') return '2ND PLACE — SILVER';
    if (m === 'bronze1' || m === 'bronze') return '3RD PLACE — BRONZE';
    if (m === 'bronze2') return '3RD PLACE — BRONZE (2)';
    return '';
  }

  function medalClass(medal) {
    var m = String(medal || '').toLowerCase();
    if (m === 'gold') return 'tp-merit-gold';
    if (m === 'silver') return 'tp-merit-silver';
    if (m.indexOf('bronze') >= 0) return 'tp-merit-bronze';
    return 'tp-merit-default';
  }

  function resultMedalText(cert) {
    return medalLabel(cert.medal || cert.medalName || cert.meritType || '');
  }

  function eventDivision(cert) {
    return cert.event || cert.division || cert.categoryLabel ||
      cert.category || cert.eventName || '';
  }

  function infoCell(label, value) {
    if (!value) return '';
    return '<div class="tp-info-cell"><span class="tp-info-lbl">' + esc(label) + '</span><span class="tp-info-val">' + esc(value) + '</span></div>';
  }

  function digSigSvg(pathD, color) {
    color = color || '#1a2a44';
    return '<svg class="tp-dig-sig" viewBox="0 0 150 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';
  }

  function sigBlockOne(sig) {
    var linesHtml = sig.lines.map(function (l) {
      return '<div class="tp-sig-detail">' + esc(l) + '</div>';
    }).join('');
    return '<div class="tp-sig-block">' +
      digSigSvg(sig.sig, '#1a2a44') +
      '<div class="tp-sig-line"></div>' +
      '<div class="tp-sig-name">' + esc(sig.name) + '</div>' +
      linesHtml +
    '</div>';
  }

  function dualSigBlocks() {
    return '<div class="tp-dual-sigs">' +
      sigBlockOne(SIGNATORIES.left) +
      sigBlockOne(SIGNATORIES.right) +
    '</div>';
  }

  function refSigBlockLarge(sig) {
    var linesHtml = sig.lines.map(function (l) {
      return '<div class="tcr-sig-line-txt">' + esc(l) + '</div>';
    }).join('');
    return '<div class="tcr-sig">' +
      digSigSvg(sig.sig, '#1a2a44') +
      '<div class="tcr-sig-name">' + esc(sig.name) + '</div>' +
      linesHtml +
    '</div>';
  }

  function refDecorLeftRibbon() {
    return '<svg class="tcr-left-ribbon" viewBox="0 0 90 800" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="tcrGold" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#8b6914"/><stop offset="35%" stop-color="#e4c65a"/><stop offset="65%" stop-color="#fff4c2"/><stop offset="100%" stop-color="#8b6914"/>' +
      '</linearGradient></defs>' +
      '<path d="M0,0 L72,0 C92,120 88,280 70,420 C58,540 36,660 0,800 L0,0 Z" fill="#061428"/>' +
      '<path d="M70,0 C86,140 82,300 64,440 C52,560 30,680 8,800" fill="none" stroke="url(#tcrGold)" stroke-width="5"/>' +
      '<path d="M0,0 L58,0 C74,100 70,240 54,380 C42,500 24,620 0,760" fill="none" stroke="rgba(228,198,90,0.35)" stroke-width="1.5"/>' +
    '</svg>';
  }

  function refDecorTrophy() {
    return '<svg class="tcr-trophy" viewBox="0 0 80 48" aria-hidden="true">' +
      '<path d="M40,4 L44,14 H52 C50,22 46,28 40,30 C34,28 30,22 28,14 H36 Z" fill="#e4c65a" stroke="#8b6914" stroke-width="1"/>' +
      '<path d="M24,14 C18,14 14,18 14,22 C14,26 18,28 22,28" fill="none" stroke="#e4c65a" stroke-width="2"/>' +
      '<path d="M56,14 C62,14 66,18 66,22 C66,26 62,28 58,28" fill="none" stroke="#e4c65a" stroke-width="2"/>' +
      '<rect x="34" y="30" width="12" height="6" fill="#b8941f"/><rect x="30" y="36" width="20" height="4" rx="1" fill="#8b6914"/>' +
      '<path d="M18,38 C22,42 30,44 40,44 C50,44 58,42 62,38" fill="none" stroke="#b8941f" stroke-width="1.5"/>' +
    '</svg>';
  }

  function refDecorMedal(medalCls) {
    var fill = '#e4c65a';
    var rim = '#8b6914';
    if (medalCls === 'tcr-medal-silver') { fill = '#d8dce4'; rim = '#7a8494'; }
    if (medalCls === 'tcr-medal-bronze') { fill = '#cd7f32'; rim = '#6b3f12'; }
    return '<div class="tcr-medal-seal ' + medalCls + '">' +
      '<svg viewBox="0 0 90 110" aria-hidden="true">' +
        '<path d="M30,8 L45,0 L60,8 L58,28 L32,28 Z" fill="#b91c3a" opacity="0.85"/>' +
        '<circle cx="45" cy="58" r="34" fill="' + fill + '" stroke="' + rim + '" stroke-width="3"/>' +
        '<circle cx="45" cy="58" r="28" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
        '<path d="M38,72 C36,58 40,44 52,40 C64,36 72,46 70,58 C68,68 58,76 48,76 C42,76 38,74 38,72 Z" fill="#061428" opacity="0.75"/>' +
        '<path d="M52,40 L58,28 L64,36 L58,48 Z" fill="#061428" opacity="0.75"/>' +
      '</svg></div>';
  }

  function refDecorWatermarks() {
    return '<div class="tcr-wm tcr-wm-kick" aria-hidden="true"></div>' +
      '<div class="tcr-wm tcr-wm-palace" aria-hidden="true"></div>' +
      '<div class="tcr-wm tcr-wm-stance" aria-hidden="true"></div>' +
      '<div class="tcr-wm tcr-wm-spar" aria-hidden="true"></div>';
  }

  function refCornerFlourish() {
    return '<div class="tcr-corner tcr-corner-tl"></div><div class="tcr-corner tcr-corner-tr"></div>' +
      '<div class="tcr-corner tcr-corner-bl"></div><div class="tcr-corner tcr-corner-br"></div>';
  }

  function refCertMetaGrid(cert, certId, dateStr) {
    var medal = resultMedalText(cert);
    var position = medalPosition(cert.medal || cert.medalName || cert.meritType || '');
    return '<div class="tcr-meta-grid">' +
      infoCell('Certificate ID', certId) +
      infoCell('Gender', genderLabel(cert.gender)) +
      infoCell('Age Category', (cert.ageCategory || cert.ageName || '').toUpperCase()) +
      infoCell('Weight Category', weightLabel(cert.weightCategory || cert.weight)) +
      infoCell('Academy / Team', cert.academy) +
      infoCell('School', cert.school) +
      infoCell('District', cert.district) +
      (position ? infoCell('Position', position) : '') +
      (medal ? infoCell('Medal', medal) : '') +
      infoCell('Date', dateStr) +
    '</div>';
  }

  function refCertHeader(brand, tourLogo, pecLogo) {
    return '<header class="tcr-head">' +
      '<div class="tcr-head-logo-l">' +
        '<img src="' + esc(tourLogo) + '" alt="Tournament" class="tcr-seal" onerror="this.style.display=\'none\'" />' +
      '</div>' +
      '<div class="tcr-head-center">' +
        refDecorTrophy() +
        '<div class="tcr-event-main">6<sup>TH</sup> ALWAR CUP</div>' +
        '<div class="tcr-event-sub">TAEKWONDO CHAMPIONSHIP 2026</div>' +
        '<div class="tcr-stars">★ ★ ★</div>' +
      '</div>' +
      '<div class="tcr-head-logo-r">' +
        '<img src="' + esc(pecLogo) + '" alt="Physical Education Career" class="tcr-pec-logo" onerror="this.style.display=\'none\'" />' +
        '<div class="tcr-pec-site">' + esc(website(brand)) + '</div>' +
      '</div>' +
    '</header>';
  }

  function refCertRibbon(subtitle) {
    return '<div class="tcr-ribbon-wrap">' +
      '<div class="tcr-ribbon"><span>CERTIFICATE</span></div>' +
      '<div class="tcr-ribbon-sub">' + esc(subtitle) + '</div>' +
    '</div>';
  }

  function refCertShell(extraCls, medalCls, inner) {
    return '<div class="tcr-cert ' + extraCls + ' ' + (medalCls || '') + '">' +
      '<div class="tcr-paper"></div>' +
      '<div class="tcr-frame-outer"></div><div class="tcr-frame-inner"></div>' +
      refCornerFlourish() +
      refDecorLeftRibbon() +
      refDecorWatermarks() +
      '<div class="tcr-content">' + inner + '</div>' +
    '</div>';
  }

  /* ── ID CARD / ACCREDITATION PASS ────────────────────────────────────── */

  function passFieldsHTML(holder, role) {
    if (role === 'coach') {
      var playerCount = holder.playerCount || holder.registeredPlayers || holder.playersCount;
      return infoCell('Name', holder.name || holder.coachName) +
        infoCell('Coach ID', holder.coachId || holder.id) +
        infoCell('Academy / Team', holder.academy || holder.academyName) +
        infoCell('District', holder.district) +
        infoCell('Mobile', holder.phone || holder.mobile) +
        (playerCount ? infoCell('Registered Players', String(playerCount)) : '') +
        infoCell('Email', holder.email);
    }
    if (role === 'referee') {
      return infoCell('Name', holder.name) +
        infoCell('Referee ID', holder.refereeId || holder.id) +
        infoCell('Designation', holder.role || holder.designation) +
        infoCell('Qualification', holder.qualification || holder.qualifications) +
        infoCell('District', holder.district);
    }
    if (role === 'vip') {
      return infoCell('Name', holder.name) +
        infoCell('VIP ID', holder.vipId || holder.regNo || holder.id) +
        infoCell('Designation', holder.designation || holder.role) +
        infoCell('Organization', holder.organization || holder.academy);
    }
    return infoCell('Name', holder.name) +
      infoCell('Player ID', holder.regNo || holder.id) +
      infoCell('Academy / Team', holder.academy || holder.academyName) +
      infoCell('School', holder.school) +
      infoCell('District', holder.district) +
      infoCell('Gender', genderLabel(holder.gender)) +
      infoCell('Age Category', holder.ageCategory || holder.ageName) +
      infoCell('Weight Category', weightLabel(holder.weightCategory)) +
      infoCell('Coach', holder.coachName);
  }

  function idCardHTML(holder, tournament, brand, roleOverride) {
    holder = holder || {};
    tournament = tournament || {};
    brand = brand || {};
    var role = detectCardRole(holder, roleOverride);
    var theme = ROLE_THEMES[role];
    var verifyUrl = verifyUrlForRole(holder, role, tournament);
    var tourDate = fmtDate(tournament.startDate || tournament.date);
    var approved = holder.status === 'approved' || holder.status === undefined;
    var logo = logoImage(brand);
    var wm = isTeamUltimate(holder)
      ? '<img src="' + esc(logo) + '" alt="" class="tp-pass-wm-img" onerror="this.style.display=\'none\'" />'
      : '';
    var displayName = holder.name || holder.coachName || '';

    return '<div class="tp-pass ' + theme.cls + '">' +
      '<div class="tp-pass-wm">' + wm + '</div>' +
      '<div class="tp-pass-topbar">' +
        '<div class="tp-pass-top-event">' + esc(eventFullName(brand)) + '</div>' +
        '<div class="tp-pass-top-site">' + esc(website(brand)) + '</div>' +
      '</div>' +
      '<div class="tp-pass-role-banner">' + esc(theme.label) + '</div>' +
      '<div class="tp-pass-body">' +
        '<div class="tp-pass-col tp-pass-col-photo">' + photoHtml(holder, 'tp-pass-photo') + '</div>' +
        '<div class="tp-pass-col tp-pass-col-info">' +
          '<div class="tp-pass-name">' + esc(displayName) + '</div>' +
          '<div class="tp-pass-fields">' + passFieldsHTML(holder, role) + '</div>' +
        '</div>' +
        '<div class="tp-pass-col tp-pass-col-qr">' +
          (approved ? '<div class="tp-pass-badge">APPROVED</div>' : '') +
          '<div class="tp-pass-qr-wrap">' + qrImg(verifyUrl, 'tp-pass-qr', 120) + '</div>' +
          '<div class="tp-pass-qr-lbl">SCAN TO VERIFY</div>' +
          '<img src="' + esc(logo) + '" alt="" class="tp-pass-mini-logo" onerror="this.style.display=\'none\'" />' +
        '</div>' +
      '</div>' +
      '<div class="tp-pass-bottom">' +
        '<div class="tp-pass-bottom-event">' + esc(eventFullName(brand)) + '</div>' +
        '<div class="tp-pass-bottom-meta">' + esc(tourDate) + ' · ' + esc(eventLocation(brand)) + '</div>' +
        '<div class="tp-pass-bottom-sig">' +
          digSigSvg(SIGNATORIES.left.sig, 'rgba(255,255,255,0.75)') +
          '<div class="tp-pass-bottom-name">' + esc(SIGNATORIES.left.name) + '</div>' +
          '<div class="tp-pass-bottom-title">Founder, physicaleducationcareer.in</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function idCardsSheetHTML(holders, tournament, brand) {
    holders = holders || [];
    var html = '<div class="tp-passes-sheet">';
    for (var i = 0; i < holders.length; i++) {
      html += idCardHTML(holders[i], tournament, brand);
    }
    html += '</div>';
    return html;
  }

  function coachIdCardHTML(coach, tournament, brand) {
    return idCardHTML(coach, tournament, brand, 'coach');
  }

  function refereeIdCardHTML(ref, tournament, brand) {
    return idCardHTML(ref, tournament, brand, 'referee');
  }

  function vipIdCardHTML(vip, tournament, brand) {
    return idCardHTML(vip, tournament, brand, 'vip');
  }

  /* ── PARTICIPATION CERTIFICATE (A4 LANDSCAPE) ────────────────────────── */

  function participationCertHTML(cert, tournament, brand) {
    cert = cert || {};
    tournament = tournament || {};
    brand = brand || {};
    var verifyUrl = verifyCertUrl(cert);
    var certId = cert.certNo || cert.certNumber || cert.certId || cert.id || '';
    var playerName = (cert.studentName || cert.name || '').toUpperCase();
    var dateStr = fmtDate(cert.date || tournament.startDate || tournament.date);
    var tourLogo = logoImage(brand);
    var pecLogo = pecLogoImage(brand);
    var academyLine = academySchoolLine(cert);
    var pro = pronoun(cert.gender);
    var proObj = pronounObj(cert.gender);
    var eventName = eventFullName(brand);

    var body =
      refCertHeader(brand, tourLogo, pecLogo) +
      refCertRibbon('OF PARTICIPATION') +
      '<section class="tcr-body">' +
        '<p class="tcr-certify">THIS IS TO CERTIFY THAT</p>' +
        '<h2 class="tcr-player">' + esc(playerName) + '</h2>' +
        (academyLine ? '<p class="tcr-of">of <strong>' + esc(academyLine) + '</strong></p>' : '') +
        '<p class="tcr-statement">has participated in the <strong class="tcr-event-red">' + esc(eventName) + '</strong></p>' +
        '<p class="tcr-held">held on <strong>' + esc(dateStr) + '</strong> at ' + esc(eventLocation(brand)) + '.</p>' +
        '<p class="tcr-wish">We wish ' + proObj + ' great success in all future endeavors.</p>' +
      '</section>' +
      refCertMetaGrid(cert, certId, dateStr) +
      '<footer class="tcr-foot">' +
        refDecorMedal('tcr-medal-part') +
        '<div class="tcr-sigs">' + refSigBlockLarge(SIGNATORIES.left) + refSigBlockLarge(SIGNATORIES.right) + '</div>' +
        '<div class="tcr-qr-wrap">' +
          qrImg(verifyUrl, 'tcr-qr', 200) +
          '<div class="tcr-qr-lbl">SCAN TO VERIFY</div>' +
        '</div>' +
      '</footer>';

    return refCertShell('tcr-part', '', body);
  }

  function meritCertHTML(cert, tournament, brand) {
    cert = cert || {};
    tournament = tournament || {};
    brand = brand || {};
    var verifyUrl = verifyCertUrl(cert);
    var certId = cert.certNo || cert.certNumber || cert.certId || cert.id || '';
    var playerName = (cert.studentName || cert.name || '').toUpperCase();
    var medal = cert.medalName || cert.medal || cert.meritType || '';
    var medalCls = medalClass(medal).replace('tp-merit-', 'tcr-medal-');
    var ordinal = meritOrdinal(medal);
    var dateStr = fmtDate(cert.date || tournament.startDate || tournament.date);
    var tourLogo = logoImage(brand);
    var pecLogo = pecLogoImage(brand);
    var academyLine = academySchoolLine(cert);
    var pro = pronoun(cert.gender);
    var proObj = pronounObj(cert.gender);
    var eventName = eventFullName(brand);
    var catLine = ageWeightLine(cert);

    var body =
      refCertHeader(brand, tourLogo, pecLogo) +
      refCertRibbon('OF MERIT') +
      '<section class="tcr-body">' +
        '<p class="tcr-certify">THIS IS TO CERTIFY THAT</p>' +
        '<h2 class="tcr-player">' + esc(playerName) + '</h2>' +
        (academyLine ? '<p class="tcr-of">of <strong>' + esc(academyLine) + '</strong></p>' : '') +
        '<p class="tcr-statement">has participated in the <strong class="tcr-event-red">' + esc(eventName) + '</strong></p>' +
        '<p class="tcr-held">held on <strong>' + esc(dateStr) + '</strong> at ' + esc(eventLocation(brand)) + '.</p>' +
        (ordinal && catLine ?
          '<p class="tcr-merit-line"><span class="tcr-merit-pro">' + pro + '</span> secured <strong class="tcr-merit-pos">' + esc(ordinal.toUpperCase()) + '</strong> position in <strong class="tcr-merit-cat">' + esc(catLine) + '</strong>.</p>' :
          '') +
        '<p class="tcr-wish">We wish ' + proObj + ' great success in all future endeavors.</p>' +
      '</section>' +
      refCertMetaGrid(cert, certId, dateStr) +
      '<footer class="tcr-foot">' +
        refDecorMedal(medalCls) +
        '<div class="tcr-sigs">' + refSigBlockLarge(SIGNATORIES.left) + refSigBlockLarge(SIGNATORIES.right) + '</div>' +
        '<div class="tcr-qr-wrap">' +
          qrImg(verifyUrl, 'tcr-qr', 200) +
          '<div class="tcr-qr-lbl">SCAN TO VERIFY</div>' +
        '</div>' +
      '</footer>';

    return refCertShell('tcr-merit', medalCls, body);
  }

  /* ── CSS ─────────────────────────────────────────────────────────────── */

  function fontImport() {
    return '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600;700;800&display=swap");';
  }

  function landscapeCertCSS() {
    return fontImport() +
      '@page { size: A4 landscape; margin: 0; }' +
      '.tcr-cert { width: 297mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.tcr-paper { position: absolute; inset: 0; background: radial-gradient(ellipse at 55% 20%, rgba(228,198,90,0.08), transparent 55%), linear-gradient(180deg, #fffefb 0%, ' + IVORY + ' 45%, #f3ede2 100%); z-index: 0; }' +
      '.tcr-frame-outer { position: absolute; top: 5mm; left: 5mm; right: 5mm; bottom: 5mm; border: 2.5px double ' + GOLD + '; z-index: 1; pointer-events: none; }' +
      '.tcr-frame-inner { position: absolute; top: 7mm; left: 7mm; right: 7mm; bottom: 7mm; border: 1px solid rgba(6,20,40,0.18); z-index: 1; pointer-events: none; }' +
      '.tcr-corner { position: absolute; width: 18mm; height: 18mm; z-index: 2; pointer-events: none; border-color: ' + GOLD + '; border-style: solid; opacity: 0.85; }' +
      '.tcr-corner-tl { top: 6mm; left: 6mm; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }' +
      '.tcr-corner-tr { top: 6mm; right: 6mm; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }' +
      '.tcr-corner-bl { bottom: 6mm; left: 6mm; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }' +
      '.tcr-corner-br { bottom: 6mm; right: 6mm; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }' +
      '.tcr-left-ribbon { position: absolute; left: 0; top: 0; width: 22mm; height: 100%; z-index: 2; pointer-events: none; }' +
      '.tcr-wm { position: absolute; z-index: 1; opacity: 0.06; pointer-events: none; background-repeat: no-repeat; background-position: center; background-size: contain; }' +
      '.tcr-wm-kick { left: 18%; top: 28%; width: 22%; height: 45%; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 200\'%3E%3Cpath d=\'M40,180 L55,120 L70,80 L95,40 L80,35 L60,70 L50,110 L35,180 Z\' fill=\'%23061428\'/%3E%3C/svg%3E"); }' +
      '.tcr-wm-palace { left: 38%; top: 22%; width: 24%; height: 38%; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 160 120\'%3E%3Cpath d=\'M20,100 L40,60 L60,75 L80,45 L100,70 L120,50 L140,100 Z\' fill=\'%23061428\'/%3E%3Crect x=\'55\' y=\'55\' width=\'50\' height=\'45\' fill=\'%23061428\'/%3E%3C/svg%3E"); }' +
      '.tcr-wm-stance { right: 12%; top: 30%; width: 18%; height: 40%; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 180\'%3E%3Cpath d=\'M45,170 L48,110 L42,70 L55,30 L65,35 L58,75 L62,170 Z\' fill=\'%23061428\'/%3E%3C/svg%3E"); }' +
      '.tcr-wm-spar { left: 42%; bottom: 16%; width: 16%; height: 22%; opacity: 0.08; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 80\'%3E%3Cpath d=\'M10,60 L35,20 L50,35 L70,15 L95,55 Z\' fill=\'%23b8941f\'/%3E%3C/svg%3E"); }' +
      '.tcr-content { position: relative; z-index: 4; height: 100%; padding: 8mm 12mm 6mm 26mm; display: grid; grid-template-rows: auto auto minmax(0,1fr) auto auto; gap: 1.5mm; min-height: 0; }' +
      '.tcr-head { display: grid; grid-template-columns: 24mm 1fr 28mm; gap: 4mm; align-items: start; }' +
      '.tcr-seal, .tcr-pec-logo { width: 22mm; height: 22mm; object-fit: contain; display: block; margin: 0 auto; filter: drop-shadow(0 1px 2px rgba(6,20,40,0.12)); }' +
      '.tcr-head-center { text-align: center; padding-top: 0.5mm; }' +
      '.tcr-trophy { width: 14mm; height: auto; display: block; margin: 0 auto 1mm; }' +
      '.tcr-event-main { font-family: Cinzel, Georgia, serif; font-size: 11mm; font-weight: 800; letter-spacing: 0.04em; color: ' + NAVY + '; line-height: 1; }' +
      '.tcr-event-main sup { font-size: 0.45em; vertical-align: super; }' +
      '.tcr-event-sub { font-family: "Source Sans 3", sans-serif; font-size: 5.2mm; font-weight: 800; letter-spacing: 0.08em; color: #b91c3a; margin-top: 1mm; }' +
      '.tcr-stars { color: ' + GOLD2 + '; font-size: 4mm; letter-spacing: 3mm; margin-top: 1mm; }' +
      '.tcr-pec-site { font-family: "Source Sans 3", sans-serif; font-size: 2.6mm; font-weight: 700; color: ' + NAVY2 + '; text-align: center; letter-spacing: 0.05em; margin-top: 1mm; text-transform: lowercase; }' +
      '.tcr-ribbon-wrap { text-align: center; margin: 1mm 0; }' +
      '.tcr-ribbon { display: inline-block; position: relative; background: linear-gradient(180deg, ' + NAVY2 + ', ' + NAVY + '); color: ' + GOLD2 + '; padding: 2mm 18mm; border: 1.5px solid ' + GOLD + '; clip-path: polygon(3% 0, 97% 0, 100% 50%, 97% 100%, 3% 100%, 0 50%); }' +
      '.tcr-ribbon span { font-family: Cinzel, Georgia, serif; font-size: 8mm; font-weight: 800; letter-spacing: 0.18em; }' +
      '.tcr-ribbon-sub { font-family: Cinzel, Georgia, serif; font-size: 4.5mm; font-weight: 700; letter-spacing: 0.28em; color: ' + NAVY + '; margin-top: 1.5mm; position: relative; }' +
      '.tcr-ribbon-sub:before, .tcr-ribbon-sub:after { content: ""; position: absolute; top: 50%; width: 22mm; height: 1px; background: linear-gradient(90deg, transparent, ' + GOLD + ', transparent); }' +
      '.tcr-ribbon-sub:before { right: calc(50% + 16mm); } .tcr-ribbon-sub:after { left: calc(50% + 16mm); }' +
      '.tcr-body { text-align: center; padding: 0 8mm; display: flex; flex-direction: column; justify-content: center; min-height: 0; }' +
      '.tcr-certify { font-family: "Source Sans 3", sans-serif; font-size: 3.8mm; font-weight: 800; letter-spacing: 0.14em; color: ' + NAVY2 + '; margin: 0 0 1.5mm; }' +
      '.tcr-player { font-family: Cinzel, Georgia, serif; font-size: 11.5mm; font-weight: 800; color: ' + NAVY + '; margin: 0; line-height: 1.05; letter-spacing: 0.04em; word-break: break-word; }' +
      '.tcr-of { font-family: "Libre Baskerville", Georgia, serif; font-size: 3.8mm; color: #3d4a5c; margin: 1.5mm 0; }' +
      '.tcr-statement, .tcr-held, .tcr-wish, .tcr-merit-line { font-family: "Libre Baskerville", Georgia, serif; font-size: 4.2mm; line-height: 1.55; color: #2d3748; margin: 1mm 0; }' +
      '.tcr-event-red { color: #b91c3a; font-weight: 700; }' +
      '.tcr-merit-pos { font-family: Cinzel, Georgia, serif; font-size: 5.5mm; color: ' + GOLD + '; letter-spacing: 0.06em; }' +
      '.tcr-merit-cat { color: ' + NAVY + '; }' +
      '.tcr-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm 5mm; padding: 2.5mm 4mm; background: rgba(6,20,40,0.04); border: 1px solid rgba(184,148,31,0.35); border-radius: 2mm; }' +
      '.tcr-foot { display: grid; grid-template-columns: 22mm 1fr 24mm; gap: 3mm; align-items: end; padding-top: 1mm; }' +
      '.tcr-medal-seal { width: 20mm; justify-self: start; } .tcr-medal-seal svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 2px 4px rgba(6,20,40,0.15)); }' +
      '.tcr-medal-gold svg circle:first-of-type { filter: drop-shadow(0 0 4px rgba(255,215,0,0.4)); }' +
      '.tcr-sigs { display: flex; justify-content: center; gap: 10mm; align-items: flex-end; }' +
      '.tcr-sig { text-align: center; min-width: 58mm; max-width: 68mm; }' +
      '.tcr-sig .tp-dig-sig { width: 54mm; height: 14mm; margin: 0 auto 1mm; }' +
      '.tcr-sig-name { font-family: Cinzel, Georgia, serif; font-size: 4.2mm; font-weight: 800; color: #b91c3a; letter-spacing: 0.05em; line-height: 1.15; }' +
      '.tcr-sig-line-txt { font-size: 2.5mm; font-weight: 700; color: #4a5568; line-height: 1.35; letter-spacing: 0.04em; margin-top: 0.4mm; }' +
      '.tcr-qr-wrap { text-align: center; justify-self: end; }' +
      '.tcr-qr { width: 22mm; height: 22mm; display: block; margin: 0 auto; background: #fff; border: 1px solid #dde4ef; padding: 1.2mm; }' +
      '.tcr-qr-lbl { font-size: 2.2mm; font-weight: 800; color: #718096; letter-spacing: 0.08em; margin-top: 0.5mm; }' +
      '.tcr-medal-silver .tcr-merit-pos { color: #7a8494; }' +
      '.tcr-medal-bronze .tcr-merit-pos { color: #8b5a2b; }' +
      '.tcr-medal-gold .tcr-ribbon { box-shadow: 0 0 12px rgba(255,215,0,0.25); }' +
      '.tcr-medal-silver .tcr-ribbon { border-color: #aab4c4; }' +
      '.tcr-medal-bronze .tcr-ribbon { border-color: #cd7f32; }';
  }

  function participationCertCSS() {
    return landscapeCertCSS();
  }

  function meritCertCSS() {
    return landscapeCertCSS();
  }

  function sharedCertCSS() {
    return '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      'body { margin: 0; padding: 0; font-family: "Source Sans 3", Segoe UI, Arial, sans-serif; background: #fff; }' +
      '@media print { body * { visibility: visible; } }' +
      '.tcr-cert:last-child { page-break-after: auto; }' +
      '.tp-info-cell { display: flex; flex-direction: column; gap: 0.6mm; min-width: 0; }' +
      '.tp-info-lbl { font-size: 2.4mm; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #718096; }' +
      '.tp-info-val { font-size: 3.2mm; font-weight: 700; color: ' + NAVY + '; line-height: 1.2; word-break: break-word; }' +
      '.tp-dig-sig { display: block; }';
  }

  function certCSS() {
    return sharedCertCSS() + participationCertCSS() + meritCertCSS();
  }

  function idCardCSS() {
    return fontImport() +
      '@page { size: A4 portrait; margin: 8mm; }' +
      '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      'body { margin: 0; padding: 0; font-family: "Source Sans 3", Segoe UI, Arial, sans-serif; background: #e8ecf4; }' +
      '.tp-passes-sheet { display: flex; flex-direction: column; gap: 6mm; padding: 4mm; align-items: center; }' +
      '@media print { .tp-passes-sheet { display: block; } .tp-pass { break-inside: avoid; page-break-inside: avoid; margin-bottom: 4mm; } body { background: #fff; } }' +
      '.tp-pass { width: 86mm; height: 54mm; position: relative; border-radius: 3mm; overflow: hidden; background: #fff; box-shadow: 0 4px 20px rgba(6,20,40,0.18); page-break-inside: avoid; display: flex; flex-direction: column; border: 1px solid rgba(6,20,40,0.15); flex-shrink: 0; }' +
      '.tp-pass-wm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; overflow: hidden; }' +
      '.tp-pass-wm-img { width: 50%; opacity: 0.04; object-fit: contain; transform: rotate(-10deg); }' +
      '.tp-pass-topbar { display: flex; justify-content: space-between; align-items: center; padding: 1.2mm 3mm; color: #fff; position: relative; z-index: 2; min-height: 7mm; }' +
      '.tp-pass-top-event { font-size: 4.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; line-height: 1.2; flex: 1; min-width: 0; }' +
      '.tp-pass-top-site { font-size: 4px; font-weight: 700; color: ' + GOLD2 + '; flex-shrink: 0; margin-left: 2mm; }' +
      '.tp-pass-role-banner { text-align: center; font-family: Cinzel, Georgia, serif; font-size: 13px; font-weight: 800; letter-spacing: 0.28em; padding: 1.5mm 3mm; position: relative; z-index: 2; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }' +
      '.tp-pass-body { display: flex; flex: 1; padding: 2mm 3mm; gap: 2.5mm; position: relative; z-index: 2; min-height: 0; align-items: stretch; }' +
      '.tp-pass-col { display: flex; flex-direction: column; }' +
      '.tp-pass-col-photo { flex-shrink: 0; }' +
      '.tp-pass-col-info { flex: 1; min-width: 0; overflow: hidden; }' +
      '.tp-pass-col-qr { flex-shrink: 0; width: 22mm; align-items: center; justify-content: center; text-align: center; }' +
      '.tp-photo-frame { width: 20mm; height: 24mm; border-radius: 1.5mm; border: 2px solid rgba(255,255,255,0.9); overflow: hidden; background: #eef1f7; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); }' +
      '.tp-pass-photo { width: 100%; height: 100%; object-fit: cover; display: block; }' +
      '.tp-photo-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 5px; font-weight: 800; color: #9aa5b4; letter-spacing: 0.08em; background: linear-gradient(180deg, #eef1f7, #dde4ef); }' +
      '.tp-pass-name { font-family: Cinzel, Georgia, serif; font-size: 8px; font-weight: 800; color: #fff; letter-spacing: 0.04em; margin-bottom: 1mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.1; }' +
      '.tp-pass-fields { display: grid; grid-template-columns: 1fr; gap: 0.5mm; }' +
      '.tp-pass-fields .tp-info-cell { flex-direction: row; gap: 1.5mm; align-items: baseline; }' +
      '.tp-pass-fields .tp-info-lbl { font-size: 4px; color: rgba(255,255,255,0.6); flex-shrink: 0; min-width: 14mm; }' +
      '.tp-pass-fields .tp-info-val { font-size: 5px; color: #fff; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }' +
      '.tp-pass-badge { font-size: 4.5px; font-weight: 800; letter-spacing: 0.12em; padding: 1px 5px; border-radius: 2px; background: ' + GOLD2 + '; color: ' + NAVY + '; margin-bottom: 1mm; }' +
      '.tp-pass-qr { width: 14mm; height: 14mm; display: block; background: #fff; border-radius: 1px; padding: 0.5mm; margin: 0 auto; }' +
      '.tp-pass-qr-lbl { font-size: 3.5px; color: rgba(255,255,255,0.75); margin-top: 0.5mm; letter-spacing: 0.08em; font-weight: 700; }' +
      '.tp-pass-mini-logo { width: 8mm; height: 8mm; object-fit: contain; margin-top: 1mm; opacity: 0.85; }' +
      '.tp-pass-bottom { padding: 1.2mm 3mm; font-size: 3.5px; color: rgba(255,255,255,0.85); position: relative; z-index: 2; border-top: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 2mm; min-height: 9mm; }' +
      '.tp-pass-bottom-event { font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; flex: 1; line-height: 1.2; font-size: 3.2px; }' +
      '.tp-pass-bottom-meta { font-size: 3.2px; opacity: 0.8; white-space: nowrap; }' +
      '.tp-pass-bottom-sig { text-align: center; flex-shrink: 0; }' +
      '.tp-pass-bottom-sig .tp-dig-sig { width: 14mm; height: 4mm; }' +
      '.tp-pass-bottom-name { font-size: 3.5px; font-weight: 800; letter-spacing: 0.04em; }' +
      '.tp-pass-bottom-title { font-size: 2.8px; opacity: 0.75; }' +
      '.tp-pass-athlete .tp-pass-topbar, .tp-pass-athlete .tp-pass-bottom { background: linear-gradient(135deg, ' + NAVY + ', ' + NAVY2 + '); }' +
      '.tp-pass-athlete .tp-pass-role-banner { background: linear-gradient(90deg, #0f2d5c, #1a56db 50%, #0f2d5c); }' +
      '.tp-pass-athlete .tp-pass-body { background: linear-gradient(135deg, #0a2248 0%, #1a4a8a 100%); }' +
      '.tp-pass-coach .tp-pass-topbar, .tp-pass-coach .tp-pass-bottom { background: linear-gradient(135deg, #064e3b, #0d6b4a); }' +
      '.tp-pass-coach .tp-pass-role-banner { background: linear-gradient(90deg, #064e3b, #10b981 50%, #064e3b); }' +
      '.tp-pass-coach .tp-pass-body { background: linear-gradient(135deg, #0a5c44 0%, #12875f 100%); }' +
      '.tp-pass-referee .tp-pass-topbar, .tp-pass-referee .tp-pass-bottom { background: linear-gradient(135deg, #450a0a, #7f1d1d); }' +
      '.tp-pass-referee .tp-pass-role-banner { background: linear-gradient(90deg, #450a0a, #b91c3a 50%, #450a0a); }' +
      '.tp-pass-referee .tp-pass-body { background: linear-gradient(135deg, #7f1d1d 0%, #b91c3a 100%); }' +
      '.tp-pass-vip .tp-pass-topbar, .tp-pass-vip .tp-pass-bottom { background: linear-gradient(135deg, #0a0a0a, #1a1a2e); }' +
      '.tp-pass-vip .tp-pass-role-banner { background: linear-gradient(90deg, #0a0a0a, ' + GOLD + ' 50%, #0a0a0a); color: ' + GOLD2 + '; }' +
      '.tp-pass-vip .tp-pass-body { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d3d 100%); border-top: 1px solid rgba(201,162,39,0.4); border-bottom: 1px solid rgba(201,162,39,0.4); }' +
      '.tp-pass-vip .tp-pass-badge { background: ' + GOLD + '; color: #0a0a0a; }';
  }

  function previewCSS() {
    return idCardCSS() + certCSS() +
      '.t-cert-preview-host, .cert-host { overflow: auto; background: #12182b; padding: 16px; border-radius: 8px; }' +
      '.t-cert-preview-host .tcr-cert, .cert-host .tcr-cert { transform: scale(0.38); transform-origin: top left; margin-bottom: -128mm; }' +
      '.t-idcard-preview-host, .id-host { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px; }' +
      '.t-idcard-preview-host .tp-pass, .id-host .tp-pass { transform: scale(1.6); transform-origin: top center; margin-bottom: 28mm; }';
  }

  root.TPrint = {
    idCardHTML: idCardHTML,
    idCardsSheetHTML: idCardsSheetHTML,
    coachIdCardHTML: coachIdCardHTML,
    refereeIdCardHTML: refereeIdCardHTML,
    vipIdCardHTML: vipIdCardHTML,
    participationCertHTML: participationCertHTML,
    meritCertHTML: meritCertHTML,
    certCSS: certCSS,
    participationCertCSS: function () { return sharedCertCSS() + participationCertCSS(); },
    meritCertCSS: function () { return sharedCertCSS() + meritCertCSS(); },
    idCardCSS: idCardCSS,
    previewCSS: previewCSS
  };
})(window);
