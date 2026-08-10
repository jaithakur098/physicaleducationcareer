/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP — Tournament Printables
 ID cards, participation & merit certificates. Attaches window.TPrint (ES5).
 ============================================================================ */
(function (root) {
  'use strict';

  var NAVY = '#0a1633';
  var GOLD = '#d4af37';
  var DEFAULT_SIG = 'jai-thakur.PNG';

  function esc(s) {
    if (root.TCore && root.TCore.esc) return root.TCore.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function brandLine(brand) {
    if (brand && brand.brandLine) return brand.brandLine;
    if (brand && brand.moduleName) return brand.moduleName;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.brandLine) {
      return root.TOURNAMENT_DEFAULTS.brandLine;
    }
    return '6th ALWAR CUP TAEKWONDO CHAMPIONSHIP';
  }

  function sigImage(brand) {
    if (brand && brand.signatureImage) return brand.signatureImage;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.signatureImage) {
      return root.TOURNAMENT_DEFAULTS.signatureImage;
    }
    return DEFAULT_SIG;
  }

  function organizerName(brand) {
    if (brand && brand.organizerName) return brand.organizerName;
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.organizerName) {
      return root.TOURNAMENT_DEFAULTS.organizerName;
    }
    return 'Jai Thakur';
  }

  function fmtDate(d) {
    if (!d) return '';
    if (root.TCore && root.TCore.fmtDate) return root.TCore.fmtDate(d);
    try {
      var dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch (e) { /* ignore */ }
    return String(d);
  }

  function qrImg(verifyUrl, cls) {
    var url = verifyUrl;
    if (root.TCore && root.TCore.qrUrl) {
      url = root.TCore.qrUrl(verifyUrl);
    }
    return '<img src="' + esc(url) + '" alt="QR" class="' + cls + '" />';
  }

  function verifyPlayerUrl(player) {
    if (root.TCore && root.TCore.verifyUrl) {
      return root.TCore.verifyUrl('player', player.id);
    }
    return String(player.id || '');
  }

  function verifyCertUrl(cert) {
    if (root.TCore && root.TCore.verifyUrl) {
      return root.TCore.verifyUrl('certificate', cert.id || cert.certId || cert.certNumber);
    }
    return String(cert.id || cert.certId || cert.certNumber || '');
  }

  function photoHtml(player, cls) {
    var src = player.photo || player.photoUrl || '';
    if (src) {
      return '<img src="' + esc(src) + '" alt="" class="' + cls + '" />';
    }
    return '<div class="' + cls + ' tp-photo-placeholder">🥋</div>';
  }

  function genderLabel(g) {
    if (!g) return '';
    var s = String(g).toLowerCase();
    if (s === 'male' || s === 'm') return 'Male';
    if (s === 'female' || s === 'f') return 'Female';
    return String(g);
  }

  /* ── ID CARD ─────────────────────────────────────────────────────────── */

  function idCardHTML(player, tournament, brand) {
    player = player || {};
    tournament = tournament || {};
    brand = brand || {};
    var verifyUrl = verifyPlayerUrl(player);
    var tourDate = fmtDate(tournament.startDate || tournament.date);
    var venue = tournament.venue || tournament.location || '';

    return '<div class="tp-idcard">' +
      '<div class="tp-idcard-header">' +
        '<div class="tp-idcard-brand">' + esc(brandLine(brand)) + '</div>' +
        '<div class="tp-idcard-type">ACCREDITATION CARD</div>' +
      '</div>' +
      '<div class="tp-idcard-body">' +
        '<div class="tp-idcard-photo-wrap">' +
          photoHtml(player, 'tp-idcard-photo') +
        '</div>' +
        '<div class="tp-idcard-info">' +
          '<div class="tp-idcard-name">' + esc(player.name || '') + '</div>' +
          '<div class="tp-idcard-reg">ID: <strong>' + esc(player.regNo || '') + '</strong></div>' +
          '<div class="tp-idcard-row"><span>Academy</span><span>' + esc(player.academy || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>School</span><span>' + esc(player.school || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>District</span><span>' + esc(player.district || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>Gender</span><span>' + esc(genderLabel(player.gender)) + '</span></div>' +
          '<div class="tp-idcard-row"><span>Age Cat.</span><span>' + esc(player.ageCategory || player.ageName || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>Weight</span><span>' + esc(player.weightCategory || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>Coach</span><span>' + esc(player.coachName || '') + '</span></div>' +
          '<div class="tp-idcard-row"><span>Coach ID</span><span>' + esc(player.coachId || '') + '</span></div>' +
        '</div>' +
        '<div class="tp-idcard-qr-wrap">' +
          qrImg(verifyUrl, 'tp-idcard-qr') +
        '</div>' +
      '</div>' +
      '<div class="tp-idcard-footer">' +
        '<div class="tp-idcard-tournament">' +
          esc(tournament.name || brandLine(brand)) +
          (tourDate ? ' · ' + esc(tourDate) : '') +
          (venue ? ' · ' + esc(venue) : '') +
        '</div>' +
        '<div class="tp-idcard-sig">' +
          '<img src="' + esc(sigImage(brand)) + '" alt="" class="tp-idcard-sig-img" />' +
          '<div class="tp-idcard-sig-name">' + esc(organizerName(brand)) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function idCardsSheetHTML(players, tournament, brand) {
    players = players || [];
    var html = '<div class="tp-idcards-sheet">';
    for (var i = 0; i < players.length; i++) {
      html += idCardHTML(players[i], tournament, brand);
    }
    html += '</div>';
    return html;
  }

  /* ── PARTICIPATION CERTIFICATE (Design A — navy geometric) ─────────────── */

  function participationCertHTML(cert, tournament, brand) {
    cert = cert || {};
    tournament = tournament || {};
    brand = brand || {};
    var verifyUrl = verifyCertUrl(cert);
    var certId = cert.certNumber || cert.certId || cert.id || '';
    var dateStr = fmtDate(cert.date || tournament.startDate || tournament.date);
    var venue = cert.venue || tournament.venue || tournament.location || '';

    return '<div class="tp-cert tp-cert-participation">' +
      '<div class="tp-cert-geo tp-cert-geo-1"></div>' +
      '<div class="tp-cert-geo tp-cert-geo-2"></div>' +
      '<div class="tp-cert-geo tp-cert-geo-3"></div>' +
      '<div class="tp-cert-inner">' +
        '<div class="tp-cert-brand">' + esc(brandLine(brand)) + '</div>' +
        '<div class="tp-cert-title">PARTICIPATION CERTIFICATE</div>' +
        '<div class="tp-cert-subtitle">This is to certify that</div>' +
        '<div class="tp-cert-student">' + esc(cert.studentName || cert.name || '') + '</div>' +
        '<div class="tp-cert-body-text">has participated in the above championship</div>' +
        '<div class="tp-cert-details">' +
          '<div class="tp-cert-detail"><span>Academy</span><strong>' + esc(cert.academy || '') + '</strong></div>' +
          '<div class="tp-cert-detail"><span>School</span><strong>' + esc(cert.school || '') + '</strong></div>' +
          '<div class="tp-cert-detail"><span>District</span><strong>' + esc(cert.district || '') + '</strong></div>' +
          '<div class="tp-cert-detail"><span>Category</span><strong>' + esc(cert.category || cert.ageCategory || '') + '</strong></div>' +
          '<div class="tp-cert-detail"><span>Weight</span><strong>' + esc(cert.weight || cert.weightCategory || '') + '</strong></div>' +
        '</div>' +
        '<div class="tp-cert-footer">' +
          '<div class="tp-cert-footer-left">' +
            '<div class="tp-cert-date"><span>Date</span> ' + esc(dateStr) + '</div>' +
            '<div class="tp-cert-venue"><span>Venue</span> ' + esc(venue) + '</div>' +
            '<div class="tp-cert-id">Cert ID: <strong>' + esc(certId) + '</strong></div>' +
          '</div>' +
          '<div class="tp-cert-footer-center">' +
            '<img src="' + esc(sigImage(brand)) + '" alt="" class="tp-cert-sig" />' +
            '<div class="tp-cert-sig-name">' + esc(organizerName(brand)) + '</div>' +
            '<div class="tp-cert-sig-role">Organizer</div>' +
          '</div>' +
          '<div class="tp-cert-footer-right">' +
            qrImg(verifyUrl, 'tp-cert-qr') +
            '<div class="tp-cert-qr-label">Scan to Verify</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── MERIT CERTIFICATE (Design B — gold ornate medal) ────────────────── */

  function meritCertHTML(cert, tournament, brand) {
    cert = cert || {};
    tournament = tournament || {};
    brand = brand || {};
    var verifyUrl = verifyCertUrl(cert);
    var certId = cert.certNumber || cert.certId || cert.id || '';
    var medalName = cert.medalName || cert.medal || cert.meritType || 'Merit';
    var dateStr = fmtDate(cert.date || tournament.startDate || tournament.date);
    var venue = cert.venue || tournament.venue || tournament.location || '';

    return '<div class="tp-cert tp-cert-merit">' +
      '<div class="tp-merit-frame-outer"></div>' +
      '<div class="tp-merit-frame-inner"></div>' +
      '<div class="tp-merit-corner tp-merit-corner-tl"></div>' +
      '<div class="tp-merit-corner tp-merit-corner-tr"></div>' +
      '<div class="tp-merit-corner tp-merit-corner-bl"></div>' +
      '<div class="tp-merit-corner tp-merit-corner-br"></div>' +
      '<div class="tp-merit-medal-icon">🏅</div>' +
      '<div class="tp-cert-inner tp-merit-inner">' +
        '<div class="tp-merit-brand">' + esc(brandLine(brand)) + '</div>' +
        '<div class="tp-merit-title">MERIT CERTIFICATE</div>' +
        '<div class="tp-merit-medal-name">' + esc(medalName) + '</div>' +
        '<div class="tp-merit-subtitle">Awarded to</div>' +
        '<div class="tp-merit-student">' + esc(cert.studentName || cert.name || '') + '</div>' +
        '<div class="tp-merit-body-text">for outstanding performance in the championship</div>' +
        '<div class="tp-merit-details">' +
          '<span>' + esc(cert.academy || '') + '</span>' +
          '<span class="tp-merit-sep">|</span>' +
          '<span>' + esc(cert.school || '') + '</span>' +
          '<span class="tp-merit-sep">|</span>' +
          '<span>' + esc(cert.district || '') + '</span>' +
        '</div>' +
        '<div class="tp-merit-cat">' +
          esc(cert.category || cert.ageCategory || '') +
          (cert.weight || cert.weightCategory ? ' · ' + esc(cert.weight || cert.weightCategory) : '') +
        '</div>' +
        '<div class="tp-merit-footer">' +
          '<div class="tp-merit-footer-left">' +
            '<div class="tp-merit-date">' + esc(dateStr) + '</div>' +
            '<div class="tp-merit-venue">' + esc(venue) + '</div>' +
            '<div class="tp-merit-cert-id">ID: ' + esc(certId) + '</div>' +
          '</div>' +
          '<div class="tp-merit-footer-center">' +
            '<img src="' + esc(sigImage(brand)) + '" alt="" class="tp-merit-sig" />' +
            '<div class="tp-merit-sig-name">' + esc(organizerName(brand)) + '</div>' +
          '</div>' +
          '<div class="tp-merit-footer-right">' +
            qrImg(verifyUrl, 'tp-merit-qr') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── PRINT CSS ───────────────────────────────────────────────────────── */

  function idCardCSS() {
    return '@page { size: A4; margin: 10mm; }' +
      '* { box-sizing: border-box; }' +
      'body { margin: 0; padding: 0; font-family: "Segoe UI", Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.tp-idcards-sheet { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; padding: 4mm; }' +
      '.tp-idcard { width: 100%; border: 2px solid ' + NAVY + '; border-radius: 6px; overflow: hidden; background: #fff; page-break-inside: avoid; break-inside: avoid; }' +
      '.tp-idcard-header { background: linear-gradient(135deg, ' + NAVY + ' 0%, #152a55 100%); color: #fff; padding: 6px 10px; text-align: center; }' +
      '.tp-idcard-brand { font-size: 9px; font-weight: 700; letter-spacing: 0.04em; color: ' + GOLD + '; text-transform: uppercase; line-height: 1.3; }' +
      '.tp-idcard-type { font-size: 8px; opacity: 0.85; margin-top: 2px; }' +
      '.tp-idcard-body { display: flex; padding: 8px; gap: 8px; align-items: flex-start; }' +
      '.tp-idcard-photo-wrap { flex-shrink: 0; }' +
      '.tp-idcard-photo { width: 60px; height: 72px; object-fit: cover; border: 2px solid ' + GOLD + '; border-radius: 3px; display: block; }' +
      '.tp-photo-placeholder { width: 60px; height: 72px; border: 2px solid ' + GOLD + '; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: #f0f2f7; }' +
      '.tp-idcard-info { flex: 1; min-width: 0; font-size: 8px; line-height: 1.5; }' +
      '.tp-idcard-name { font-size: 12px; font-weight: 700; color: ' + NAVY + '; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.tp-idcard-reg { font-size: 9px; margin-bottom: 4px; color: ' + GOLD + '; }' +
      '.tp-idcard-row { display: flex; gap: 4px; }' +
      '.tp-idcard-row span:first-child { color: #718096; min-width: 52px; flex-shrink: 0; }' +
      '.tp-idcard-row span:last-child { font-weight: 600; color: ' + NAVY + '; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.tp-idcard-qr-wrap { flex-shrink: 0; }' +
      '.tp-idcard-qr { width: 52px; height: 52px; display: block; }' +
      '.tp-idcard-footer { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-top: 1px solid #dde3ef; background: #f8f9fc; font-size: 7px; }' +
      '.tp-idcard-tournament { color: #4a5568; flex: 1; line-height: 1.3; }' +
      '.tp-idcard-sig { text-align: center; flex-shrink: 0; }' +
      '.tp-idcard-sig-img { height: 24px; display: block; margin: 0 auto; }' +
      '.tp-idcard-sig-name { font-size: 7px; font-weight: 600; color: ' + NAVY + '; }' +
      '@media print { .tp-idcard { break-inside: avoid; } }';
  }

  function certCSS() {
    return '@page { size: A4 portrait; margin: 0; }' +
      '* { box-sizing: border-box; }' +
      'body { margin: 0; padding: 0; font-family: "Georgia", "Times New Roman", serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.tp-cert { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; }' +
      '.tp-cert:last-child { page-break-after: auto; break-after: auto; }' +
      '.tp-cert-inner { position: relative; z-index: 2; padding: 28mm 22mm 20mm; height: 100%; display: flex; flex-direction: column; align-items: center; }' +

      /* Design A — Participation */
      '.tp-cert-participation { background: #fff; border: 8px solid ' + NAVY + '; }' +
      '.tp-cert-geo { position: absolute; z-index: 1; opacity: 0.06; }' +
      '.tp-cert-geo-1 { top: 15%; left: 5%; width: 120px; height: 120px; border: 3px solid ' + NAVY + '; transform: rotate(45deg); }' +
      '.tp-cert-geo-2 { top: 40%; right: 8%; width: 80px; height: 80px; border: 3px solid ' + GOLD + '; transform: rotate(30deg); }' +
      '.tp-cert-geo-3 { bottom: 20%; left: 12%; width: 60px; height: 60px; background: ' + NAVY + '; transform: rotate(45deg); }' +
      '.tp-cert-brand { font-family: "Segoe UI", Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ' + NAVY + '; text-align: center; margin-bottom: 6mm; }' +
      '.tp-cert-title { font-size: 28px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ' + GOLD + '; text-align: center; margin-bottom: 8mm; border-bottom: 2px solid ' + GOLD + '; padding-bottom: 4mm; }' +
      '.tp-cert-subtitle { font-size: 14px; color: #4a5568; text-align: center; margin-bottom: 3mm; }' +
      '.tp-cert-student { font-size: 32px; font-weight: 700; color: ' + NAVY + '; text-align: center; margin-bottom: 4mm; font-style: italic; }' +
      '.tp-cert-body-text { font-size: 14px; color: #4a5568; text-align: center; margin-bottom: 8mm; }' +
      '.tp-cert-details { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 10mm; width: 100%; max-width: 420px; margin-bottom: auto; font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; }' +
      '.tp-cert-detail { display: flex; gap: 6px; }' +
      '.tp-cert-detail span { color: #718096; min-width: 70px; }' +
      '.tp-cert-detail strong { color: ' + NAVY + '; font-weight: 600; }' +
      '.tp-cert-footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: 10mm; font-family: "Segoe UI", Arial, sans-serif; }' +
      '.tp-cert-footer-left { font-size: 11px; color: #4a5568; line-height: 1.6; }' +
      '.tp-cert-footer-left span { color: #718096; }' +
      '.tp-cert-footer-center { text-align: center; }' +
      '.tp-cert-sig { height: 40px; display: block; margin: 0 auto 2px; }' +
      '.tp-cert-sig-name { font-size: 12px; font-weight: 700; color: ' + NAVY + '; }' +
      '.tp-cert-sig-role { font-size: 10px; color: #718096; }' +
      '.tp-cert-footer-right { text-align: center; }' +
      '.tp-cert-qr { width: 64px; height: 64px; display: block; margin: 0 auto; }' +
      '.tp-cert-qr-label { font-size: 8px; color: #718096; margin-top: 2px; }' +

      /* Design B — Merit */
      '.tp-cert-merit { background: linear-gradient(180deg, #fffdf5 0%, #fff9e6 40%, #fff 100%); }' +
      '.tp-merit-frame-outer { position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 4px double ' + GOLD + '; z-index: 1; }' +
      '.tp-merit-frame-inner { position: absolute; top: 14mm; left: 14mm; right: 14mm; bottom: 14mm; border: 1px solid ' + GOLD + '; z-index: 1; }' +
      '.tp-merit-corner { position: absolute; width: 24px; height: 24px; z-index: 2; }' +
      '.tp-merit-corner-tl { top: 12mm; left: 12mm; border-top: 3px solid ' + GOLD + '; border-left: 3px solid ' + GOLD + '; }' +
      '.tp-merit-corner-tr { top: 12mm; right: 12mm; border-top: 3px solid ' + GOLD + '; border-right: 3px solid ' + GOLD + '; }' +
      '.tp-merit-corner-bl { bottom: 12mm; left: 12mm; border-bottom: 3px solid ' + GOLD + '; border-left: 3px solid ' + GOLD + '; }' +
      '.tp-merit-corner-br { bottom: 12mm; right: 12mm; border-bottom: 3px solid ' + GOLD + '; border-right: 3px solid ' + GOLD + '; }' +
      '.tp-merit-medal-icon { position: absolute; top: 18mm; left: 50%; transform: translateX(-50%); font-size: 36px; z-index: 3; }' +
      '.tp-merit-inner { padding-top: 32mm; }' +
      '.tp-merit-brand { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ' + NAVY + '; text-align: center; margin-bottom: 4mm; }' +
      '.tp-merit-title { font-size: 26px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ' + GOLD + '; text-align: center; margin-bottom: 3mm; text-shadow: 0 1px 0 rgba(0,0,0,0.1); }' +
      '.tp-merit-medal-name { font-size: 20px; font-weight: 700; color: ' + NAVY + '; text-align: center; margin-bottom: 6mm; padding: 3mm 12mm; border: 2px solid ' + GOLD + '; border-radius: 20px; background: linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05)); }' +
      '.tp-merit-subtitle { font-size: 13px; color: #718096; text-align: center; margin-bottom: 2mm; }' +
      '.tp-merit-student { font-size: 30px; font-weight: 700; color: ' + NAVY + '; text-align: center; margin-bottom: 4mm; }' +
      '.tp-merit-body-text { font-size: 13px; color: #4a5568; text-align: center; margin-bottom: 6mm; font-style: italic; }' +
      '.tp-merit-details { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; color: #4a5568; text-align: center; margin-bottom: 3mm; }' +
      '.tp-merit-sep { color: ' + GOLD + '; margin: 0 6px; }' +
      '.tp-merit-cat { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; font-weight: 600; color: ' + NAVY + '; text-align: center; margin-bottom: auto; }' +
      '.tp-merit-footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: 10mm; font-family: "Segoe UI", Arial, sans-serif; }' +
      '.tp-merit-footer-left { font-size: 10px; color: #718096; line-height: 1.6; }' +
      '.tp-merit-footer-center { text-align: center; }' +
      '.tp-merit-sig { height: 36px; display: block; margin: 0 auto 2px; }' +
      '.tp-merit-sig-name { font-size: 11px; font-weight: 700; color: ' + NAVY + '; }' +
      '.tp-merit-footer-right { text-align: center; }' +
      '.tp-merit-qr { width: 56px; height: 56px; display: block; }' +

      '@media print { .tp-cert { page-break-after: always; } .tp-cert:last-child { page-break-after: auto; } }';
  }

  root.TPrint = {
    idCardHTML: idCardHTML,
    idCardsSheetHTML: idCardsSheetHTML,
    participationCertHTML: participationCertHTML,
    meritCertHTML: meritCertHTML,
    certCSS: certCSS,
    idCardCSS: idCardCSS
  };
})(window);
