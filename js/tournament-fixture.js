/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP — Tournament Fixture / Bracket Renderer
 Premium A4 landscape draw sheet. Attaches window.TFixture (ES5 IIFE).
 ============================================================================ */
(function (root) {
  'use strict';

  var NAVY = '#0a1633';
  var GOLD = '#d4af37';
  var BASE_SLOT = 28;

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

  function roundTitle(totalRounds, index) {
    var fromEnd = totalRounds - 1 - index;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semi Final';
    if (fromEnd === 2) return 'Quarter Final';
    return 'Round ' + (index + 1);
  }

  function isByeSlot(player, match, side) {
    if (!player) return true;
    if (match && match.status === 'bye') {
      var other = side === 'a' ? match.b : match.a;
      if (player && !other) return false;
    }
    if (player && player.name === 'BYE') return true;
    return false;
  }

  function slotClass(match, side, editable) {
    var cls = 'tf-slot tf-slot-' + side;
    if (match && match.winner === side) cls += ' tf-slot-winner';
    if (match && match.status === 'complete' && match.winner && match.winner !== side) {
      cls += ' tf-slot-loser';
    }
    if (editable) cls += ' tf-slot-editable';
    return cls;
  }

  function renderParticipant(player, match, side, editable) {
    var r = match ? match.roundIndex : 0;
    var m = match ? match.matchIndex : 0;
    var attrs = '';
    if (editable) {
      attrs = ' data-r="' + r + '" data-m="' + m + '" data-side="' + side + '" tabindex="0"';
    }
    if (!player || isByeSlot(player, match, side)) {
      return '<div class="tf-slot tf-slot-bye"' + attrs + '><span class="tf-bye-text">BYE</span></div>';
    }
    var academy = player.academy || player.school || '';
    var scoreHtml = '';
    if (match && match.score && match.winner === side) {
      scoreHtml = '<span class="tf-slot-score">' + esc(match.score) + '</span>';
    }
    return '<div class="' + slotClass(match, side, editable) + '"' + attrs + '>' +
      '<div class="tf-slot-row tf-slot-row-top">' +
        '<span class="tf-slot-id">' + esc(player.regNo || '—') + '</span>' +
        scoreHtml +
      '</div>' +
      '<div class="tf-slot-name">' + esc(player.name || '') + '</div>' +
      '<div class="tf-slot-academy">' + esc(academy) + '</div>' +
      '<div class="tf-slot-district">' + esc(player.district || '') + '</div>' +
    '</div>';
  }

  function renderMatch(match, roundIndex, matchHeight, editable) {
    var connClass = 'tf-match-connector';
    if (roundIndex > 0) connClass += ' tf-match-connector-in';
    var html = '<div class="tf-match-wrap" style="height:' + matchHeight + 'px">' +
      '<div class="tf-match">' +
        '<div class="tf-match-no">M' + esc(match.matchNo) + '</div>' +
        renderParticipant(match.a, match, 'a', editable) +
        renderParticipant(match.b, match, 'b', editable) +
      '</div>';
    if (roundIndex < 99) {
      html += '<div class="' + connClass + '"></div>';
    }
    html += '</div>';
    return html;
  }

  function renderRound(round, roundIndex, totalRounds, editable) {
    var matchHeight = BASE_SLOT * 2 * Math.pow(2, roundIndex);
    var matchesHtml = '';
    for (var i = 0; i < round.length; i++) {
      var match = round[i];
      if (!match.roundIndex) match.roundIndex = roundIndex;
      if (!match.matchIndex) match.matchIndex = i;
      matchesHtml += renderMatch(match, roundIndex, matchHeight, editable);
    }
    return '<div class="tf-round" data-round="' + roundIndex + '">' +
      '<div class="tf-round-title">' + esc(roundTitle(totalRounds, roundIndex)) + '</div>' +
      '<div class="tf-round-matches">' + matchesHtml + '</div>' +
    '</div>';
  }

  function renderPodiumSlot(label, player, cls) {
    var inner = '<div class="tf-podium-empty">—</div>';
    if (player) {
      inner = '<div class="tf-podium-id">' + esc(player.regNo || '') + '</div>' +
        '<div class="tf-podium-name">' + esc(player.name || '') + '</div>' +
        '<div class="tf-podium-academy">' + esc(player.academy || player.school || '') + '</div>' +
        '<div class="tf-podium-district">' + esc(player.district || '') + '</div>';
    }
    return '<div class="tf-podium-box ' + cls + '">' +
      '<div class="tf-podium-medal">' + esc(label) + '</div>' +
      inner +
    '</div>';
  }

  function renderPodium(drawData, entries) {
    var pl = drawData && drawData.placements ? drawData.placements : {};
    var first = pl.first || null;
    var second = pl.second || null;
    var bronze1 = pl.bronze1 || null;
    var bronze2 = pl.bronze2 || null;
    return '<div class="tf-podium">' +
      '<div class="tf-podium-heading">Winners Podium</div>' +
      '<div class="tf-podium-grid">' +
        renderPodiumSlot('1st', first, 'tf-podium-1st') +
        renderPodiumSlot('2nd', second, 'tf-podium-2nd') +
        renderPodiumSlot('3rd', bronze1, 'tf-podium-3rd') +
        renderPodiumSlot('3rd', bronze2, 'tf-podium-3rd') +
      '</div>' +
      '<div class="tf-podium-meta">Entries: ' + esc(entries || 0) + '</div>' +
    '</div>';
  }

  function renderHeader(opts) {
    var brand = opts.brand || {};
    var tournament = opts.tournament || {};
    var genderLabel = opts.gender ? String(opts.gender).toUpperCase() : '';
    var weightLabel = opts.weight ? String(opts.weight) + ' kg' : '';
    var dateStr = tournament.startDate || tournament.date || '';
    if (root.TCore && root.TCore.fmtDate && dateStr) {
      dateStr = root.TCore.fmtDate(dateStr);
    }
    return '<div class="tf-header">' +
      '<div class="tf-header-brand">' +
        '<div class="tf-header-logo">🥋</div>' +
        '<div class="tf-header-titles">' +
          '<h1 class="tf-header-name">' + esc(brandLine(brand)) + '</h1>' +
          '<div class="tf-header-sub">' + esc(tournament.venue || tournament.location || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tf-header-meta">' +
        '<div class="tf-meta-row"><span class="tf-meta-label">Category</span><span class="tf-meta-value">' +
          esc(opts.categoryLabel || opts.ageName || '') + '</span></div>' +
        '<div class="tf-meta-row"><span class="tf-meta-label">Gender</span><span class="tf-meta-value">' +
          esc(genderLabel) + '</span></div>' +
        '<div class="tf-meta-row"><span class="tf-meta-label">Weight</span><span class="tf-meta-value">' +
          esc(weightLabel) + '</span></div>' +
        '<div class="tf-meta-row"><span class="tf-meta-label">Entries</span><span class="tf-meta-value">' +
          esc(opts.entries || 0) + '</span></div>' +
        '<div class="tf-meta-row"><span class="tf-meta-label">Byes</span><span class="tf-meta-value">' +
          esc(opts.byes || 0) + '</span></div>' +
        (dateStr ? '<div class="tf-meta-row"><span class="tf-meta-label">Date</span><span class="tf-meta-value">' +
          esc(dateStr) + '</span></div>' : '') +
      '</div>' +
    '</div>';
  }

  function renderBracket(drawData, editable) {
    if (!drawData || !drawData.rounds || !drawData.rounds.length) {
      return '<div class="tf-empty">No draw data available.</div>';
    }
    var rounds = drawData.rounds;
    var totalRounds = rounds.length;
    var html = '<div class="tf-bracket">';
    for (var r = 0; r < totalRounds; r++) {
      html += renderRound(rounds[r], r, totalRounds, editable);
    }
    html += '</div>';
    return html;
  }

  function renderSheet(opts) {
    opts = opts || {};
    var drawData = opts.drawData || {};
    return '<div class="tf-sheet">' +
      renderHeader(opts) +
      '<div class="tf-body">' +
        renderBracket(drawData, false) +
        renderPodium(drawData, opts.entries) +
      '</div>' +
    '</div>';
  }

  function renderEditable(opts) {
    opts = opts || {};
    var drawData = opts.drawData || {};
    return '<div class="tf-sheet tf-sheet-editable">' +
      renderHeader(opts) +
      '<div class="tf-body">' +
        renderBracket(drawData, true) +
        renderPodium(drawData, opts.entries) +
      '</div>' +
    '</div>';
  }

  function printCSS() {
    return '@page { size: A4 landscape; margin: 8mm; }' +
      '* { box-sizing: border-box; }' +
      'body { margin: 0; padding: 0; font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: ' + NAVY + '; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      '.tf-sheet { width: 100%; min-height: 100%; background: #fff; }' +
      '.tf-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 10px 8px; border-bottom: 3px solid ' + GOLD + '; background: linear-gradient(135deg, ' + NAVY + ' 0%, #152a55 100%); color: #fff; }' +
      '.tf-header-brand { display: flex; align-items: center; gap: 10px; }' +
      '.tf-header-logo { font-size: 28px; line-height: 1; }' +
      '.tf-header-name { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.04em; color: ' + GOLD + '; text-transform: uppercase; }' +
      '.tf-header-sub { font-size: 10px; opacity: 0.85; margin-top: 2px; }' +
      '.tf-header-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; font-size: 9px; min-width: 200px; }' +
      '.tf-meta-row { display: flex; gap: 6px; }' +
      '.tf-meta-label { opacity: 0.7; min-width: 52px; }' +
      '.tf-meta-value { font-weight: 600; color: #fff; }' +
      '.tf-body { display: flex; gap: 12px; padding: 8px 6px; align-items: flex-start; }' +
      '.tf-bracket { display: flex; gap: 0; flex: 1; min-width: 0; overflow: hidden; }' +
      '.tf-round { flex: 1; min-width: 0; display: flex; flex-direction: column; }' +
      '.tf-round-title { text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ' + NAVY + '; background: ' + GOLD + '; padding: 3px 4px; margin-bottom: 4px; border-radius: 2px; }' +
      '.tf-round-matches { display: flex; flex-direction: column; flex: 1; }' +
      '.tf-match-wrap { display: flex; align-items: center; position: relative; }' +
      '.tf-match { flex: 1; min-width: 0; border: 1.5px solid ' + NAVY + '; border-radius: 3px; background: #fff; position: relative; overflow: hidden; }' +
      '.tf-match-no { position: absolute; top: 0; right: 0; font-size: 7px; font-weight: 700; background: ' + NAVY + '; color: ' + GOLD + '; padding: 1px 5px; border-bottom-left-radius: 3px; z-index: 2; }' +
      '.tf-slot { padding: 2px 6px 2px 6px; border-bottom: 1px solid #dde3ef; font-size: 8px; line-height: 1.25; min-height: ' + BASE_SLOT + 'px; position: relative; }' +
      '.tf-slot:last-child { border-bottom: none; }' +
      '.tf-slot-row-top { display: flex; justify-content: space-between; align-items: center; }' +
      '.tf-slot-id { font-weight: 700; font-size: 7px; color: ' + GOLD + '; background: ' + NAVY + '; padding: 0 4px; border-radius: 2px; }' +
      '.tf-slot-score { font-size: 7px; font-weight: 700; color: ' + NAVY + '; }' +
      '.tf-slot-name { font-weight: 600; font-size: 8.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.tf-slot-academy { font-size: 7px; color: #4a5568; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }' +
      '.tf-slot-district { font-size: 7px; color: #718096; }' +
      '.tf-slot-bye { background: repeating-linear-gradient(-45deg, #f0f2f7, #f0f2f7 4px, #e8ebf2 4px, #e8ebf2 8px); display: flex; align-items: center; justify-content: center; min-height: ' + BASE_SLOT + 'px; }' +
      '.tf-bye-text { font-weight: 800; font-size: 10px; color: #a0aec0; letter-spacing: 0.15em; }' +
      '.tf-slot-winner { background: linear-gradient(90deg, rgba(212,175,55,0.18) 0%, #fff 100%); }' +
      '.tf-slot-winner .tf-slot-name { color: ' + NAVY + '; }' +
      '.tf-slot-loser { opacity: 0.55; }' +
      '.tf-match-connector { width: 14px; height: 50%; border-right: 2px solid ' + GOLD + '; border-top: 2px solid ' + GOLD + '; margin-right: -1px; flex-shrink: 0; }' +
      '.tf-match-connector-in { border-top: none; border-bottom: 2px solid ' + GOLD + '; height: 50%; align-self: flex-end; }' +
      '.tf-round:last-child .tf-match-connector { display: none; }' +
      '.tf-podium { width: 130px; flex-shrink: 0; border: 2px solid ' + NAVY + '; border-radius: 4px; background: #f8f9fc; }' +
      '.tf-podium-heading { text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: ' + NAVY + '; color: ' + GOLD + '; padding: 4px; }' +
      '.tf-podium-grid { padding: 4px; display: grid; gap: 4px; }' +
      '.tf-podium-box { border: 1px solid #c5cdd9; border-radius: 3px; padding: 4px 5px; background: #fff; font-size: 7px; line-height: 1.3; }' +
      '.tf-podium-1st { border-color: ' + GOLD + '; border-width: 2px; background: linear-gradient(180deg, #fff9e6 0%, #fff 100%); }' +
      '.tf-podium-2nd { border-color: #9aa5b4; }' +
      '.tf-podium-3rd { border-color: #cd7f32; }' +
      '.tf-podium-medal { font-weight: 800; font-size: 8px; color: ' + NAVY + '; margin-bottom: 2px; }' +
      '.tf-podium-1st .tf-podium-medal { color: ' + GOLD + '; }' +
      '.tf-podium-id { font-weight: 700; font-size: 7px; }' +
      '.tf-podium-name { font-weight: 600; font-size: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.tf-podium-academy { font-size: 7px; color: #4a5568; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.tf-podium-district { font-size: 7px; color: #718096; }' +
      '.tf-podium-empty { color: #a0aec0; text-align: center; padding: 4px 0; }' +
      '.tf-podium-meta { text-align: center; font-size: 7px; padding: 3px; border-top: 1px solid #dde3ef; color: #718096; }' +
      '.tf-empty { padding: 40px; text-align: center; color: #718096; }' +
      '.tf-sheet-editable .tf-slot-editable { cursor: pointer; }' +
      '.tf-sheet-editable .tf-slot-editable:hover { background: rgba(212,175,55,0.12); }' +
      '.tf-sheet-editable .tf-slot-bye:hover { background: rgba(212,175,55,0.08); }' +
      '@media print { body { margin: 0; } .tf-sheet { page-break-inside: avoid; } }';
  }

  root.TFixture = {
    roundTitle: roundTitle,
    renderSheet: renderSheet,
    renderEditable: renderEditable,
    printCSS: printCSS
  };
})(window);
