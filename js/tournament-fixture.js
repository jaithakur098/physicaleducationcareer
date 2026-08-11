/* ============================================================================
 6th ALWAR CUP TAEKWONDO CHAMPIONSHIP — Tournament Fixture / Bracket Renderer
 Khiapp-style horizontal draw sheet. Attaches window.TFixture (ES5 IIFE).
 ============================================================================ */
(function (root) {
  'use strict';

  var NAVY = '#0a1633';
  var GOLD = '#d4af37';
  var BLUE = '#1a4fd6';
  var RED = '#d62828';
  var STYLE_ID = 'tournament-fixture-styles';
  var BASE_UNIT = 92;
  var CARD_MIN_W = 280;
  /* Compact print slot: never stretch R1 across the full page height. */
  var PRINT_SLOT_MM = 20;
  var PRINT_TRACK_MM = 168;

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

  function brandLinePrint(brand) {
    var line = brandLine(brand);
    if (brand && brand.eventYear && line.indexOf(brand.eventYear) === -1) {
      return line + ' ' + brand.eventYear;
    }
    if (root.TOURNAMENT_DEFAULTS && root.TOURNAMENT_DEFAULTS.eventYear &&
        line.indexOf(root.TOURNAMENT_DEFAULTS.eventYear) === -1) {
      return line + ' ' + root.TOURNAMENT_DEFAULTS.eventYear;
    }
    return line;
  }

  function roundTitle(totalRounds, index) {
    var fromEnd = totalRounds - 1 - index;
    if (fromEnd === 0) return 'Final';
    if (fromEnd === 1) return 'Semi Final';
    if (fromEnd === 2) return 'Quarter Final';
    return 'Round ' + (index + 1);
  }

  function roundShort(totalRounds, roundIndex) {
    var fromEnd = totalRounds - 1 - roundIndex;
    if (fromEnd === 0) return 'F';
    if (fromEnd === 1) return 'SF';
    if (fromEnd === 2) return 'QF';
    return 'R' + (roundIndex + 1);
  }

  function feederMatchRef(roundIndex, matchIndex, side) {
    if (root.TCore && root.TCore.feederMatchRef) {
      return root.TCore.feederMatchRef(roundIndex, matchIndex, side);
    }
    if (roundIndex <= 0) return null;
    return {
      roundIndex: roundIndex - 1,
      matchIndex: side === 'a' ? matchIndex * 2 : matchIndex * 2 + 1
    };
  }

  function resolveSlot(drawData, roundIndex, matchIndex, side) {
    var rounds = drawData && drawData.rounds ? drawData.rounds : [];
    var match = rounds[roundIndex] && rounds[roundIndex][matchIndex];
    if (!match) return { type: 'empty' };
    var player = side === 'a' ? match.a : match.b;
    if (player && player.name) return { type: 'player', player: player };
    if (roundIndex === 0) return { type: 'bye' };
    var ref = feederMatchRef(roundIndex, matchIndex, side);
    if (ref) {
      var feeder = rounds[ref.roundIndex] && rounds[ref.roundIndex][ref.matchIndex];
      if (feeder && feeder.status === 'bye' && feeder.winner) {
        var w = feeder.winner === 'a' ? feeder.a : feeder.b;
        if (w && w.name) return { type: 'player', player: w };
      }
      if (feeder) {
        return { type: 'placeholder', label: 'Winner M' + (feeder.matchNo || (ref.matchIndex + 1)) };
      }
    }
    return { type: 'placeholder', label: 'TBD' };
  }

  function slotClass(match, side, editable, slotType) {
    var cls = 'tf-corner-block tf-' + (side === 'a' ? 'blue' : 'red');
    if (slotType === 'bye') cls = 'tf-corner-block tf-bye';
    else if (slotType === 'placeholder') cls += ' tf-pending-block';
    if (match && match.winner === side) cls += ' tf-slot-winner';
    if (match && match.status === 'complete' && match.winner && match.winner !== side) {
      cls += ' tf-slot-loser';
    }
    if (editable) cls += ' tf-slot-editable';
    return cls;
  }

  function renderCornerBlock(drawData, match, side, editable, compact) {
    var r = match ? match.roundIndex : 0;
    var m = match ? match.matchIndex : 0;
    var attrs = '';
    if (editable) {
      attrs = ' data-r="' + r + '" data-m="' + m + '" data-side="' + side + '" tabindex="0"';
    }
    var slot = resolveSlot(drawData, r, m, side);
    var cornerIcon = side === 'a' ? '🔵' : '🔴';
    var editBtn = '';
    if (editable && !compact && r === 0) {
      editBtn = '<button type="button" class="tf-edit-btn" data-edit-r="' + r + '" data-edit-m="' + m +
        '" data-edit-side="' + side + '" title="Edit player">EDIT</button>';
    }

    if (slot.type === 'bye') {
      return '<div class="tf-corner-block tf-bye tf-slot-bye"' + attrs + '>' +
        '<span class="tf-bye-text">BYE</span>' + editBtn +
      '</div>';
    }
    if (slot.type === 'placeholder') {
      if (compact) {
        return '<div class="' + slotClass(match, side, editable, 'placeholder') + '"' + attrs + '>' +
          '<div class="tf-print-icon">' + cornerIcon + '</div>' +
          '<div class="tf-player-name tf-pending-name">' + esc(slot.label) + '</div>' +
        '</div>';
      }
      return '<div class="' + slotClass(match, side, editable, 'placeholder') + '"' + attrs + '>' +
        '<div class="tf-corner-tag">' + cornerIcon + ' ' + (side === 'a' ? 'BLUE' : 'RED') + '</div>' +
        '<div class="tf-player-name tf-pending-name">' + esc(slot.label) + '</div>' +
        editBtn +
      '</div>';
    }

    var player = slot.player;
    var academy = player.academy || player.school || '';
    if (compact) {
      return '<div class="' + slotClass(match, side, editable, 'player') + '"' + attrs + '>' +
        '<div class="tf-print-icon">' + cornerIcon + '</div>' +
        '<div class="tf-player-name">' + esc(player.name || '') + '</div>' +
        '<div class="tf-player-academy">' + esc(academy) + '</div>' +
        '<div class="tf-player-district">' + esc(player.district || '') + '</div>' +
      '</div>';
    }

    var country = player.country || '';
    var scoreHtml = '';
    if (match && match.score && match.winner === side && match.status !== 'bye') {
      scoreHtml = '<span class="tf-player-score">' + esc(match.score) + '</span>';
    }
    return '<div class="' + slotClass(match, side, editable, 'player') + '"' + attrs + '>' +
      '<div class="tf-corner-row">' +
        '<span class="tf-corner-tag">' + cornerIcon + ' ' + (side === 'a' ? 'BLUE' : 'RED') + '</span>' +
        scoreHtml +
        editBtn +
      '</div>' +
      '<div class="tf-player-name">' + esc(player.name || '') + '</div>' +
      '<div class="tf-player-id">' + esc(player.regNo || '—') + '</div>' +
      '<div class="tf-player-academy">' + esc(academy) + '</div>' +
      '<div class="tf-player-district">' + esc(player.district || '') + '</div>' +
      (country ? '<div class="tf-player-country">' + esc(country) + '</div>' : '') +
    '</div>';
  }

  function printSlotMm(r1Count) {
    var fit = PRINT_TRACK_MM / Math.max(r1Count, 1);
    return Math.min(PRINT_SLOT_MM, fit);
  }

  function printUnitMm(roundIndex, r1Count) {
    return (printSlotMm(r1Count) * Math.pow(2, roundIndex)).toFixed(2);
  }

  function renderMatchCard(drawData, match, roundIndex, totalRounds, editable, isLastRound, compact, r1Count) {
    if (match.roundIndex == null) match.roundIndex = roundIndex;
    var rs = roundShort(totalRounds, roundIndex);
    var unitStyle = '';
    if (compact) {
      unitStyle = ' style="height:' + printUnitMm(roundIndex, r1Count) + 'mm"';
    } else {
      unitStyle = ' style="min-height:' + (BASE_UNIT * Math.pow(2, roundIndex)) + 'px"';
    }

    var headHtml = compact
      ? '<div class="tf-match-head"><span class="tf-match-no">M' + esc(match.matchNo) + '</span></div>'
      : '<div class="tf-match-head">' +
          '<span class="tf-match-no">M' + esc(match.matchNo) + '</span>' +
          '<span class="tf-match-tag">' + esc(rs) + '</span>' +
        '</div>';

    return '<div class="tf-match-unit"' + unitStyle + ' data-mi="' + match.matchIndex + '">' +
      '<div class="tf-match-card">' +
        headHtml +
        renderCornerBlock(drawData, match, 'a', editable, compact) +
        renderCornerBlock(drawData, match, 'b', editable, compact) +
      '</div>' +
      (isLastRound ? '' : '<div class="tf-connector" aria-hidden="true">' +
        '<div class="tf-conn-arm"></div>' +
        '<div class="tf-conn-vert ' + (match.matchIndex % 2 === 0 ? 'tf-conn-even' : 'tf-conn-odd') + '"></div>' +
      '</div>') +
    '</div>';
  }

  function renderRound(drawData, round, roundIndex, totalRounds, editable, compact, r1Count) {
    var isLastRound = roundIndex === totalRounds - 1;
    var matchesHtml = '';
    for (var i = 0; i < round.length; i++) {
      matchesHtml += renderMatchCard(drawData, round[i], roundIndex, totalRounds, editable, isLastRound, compact, r1Count);
    }
    var trackStyle = '';
    if (compact) {
      trackStyle = ' style="height:' + (printSlotMm(r1Count) * r1Count).toFixed(2) + 'mm"';
    } else {
      var firstCount = drawData.rounds[0] ? drawData.rounds[0].length : round.length;
      trackStyle = ' style="min-height:' + (firstCount * BASE_UNIT) + 'px"';
    }
    return '<div class="tf-round" data-round="' + roundIndex + '">' +
      '<div class="tf-round-label">' + esc(roundTitle(totalRounds, roundIndex)) + '</div>' +
      '<div class="tf-round-track"' + trackStyle + '>' + matchesHtml + '</div>' +
    '</div>';
  }

  function renderPodiumSlot(label, player, cls, compact) {
    var inner = '<div class="tf-podium-empty">—</div>';
    if (player) {
      if (compact) {
        inner = '<div class="tf-podium-name">' + esc(player.name || '') + '</div>' +
          '<div class="tf-podium-academy">' + esc(player.academy || player.school || '') + '</div>' +
          '<div class="tf-podium-district">' + esc(player.district || '') + '</div>';
      } else {
        inner = '<div class="tf-podium-id">' + esc(player.regNo || '') + '</div>' +
          '<div class="tf-podium-name">' + esc(player.name || '') + '</div>' +
          '<div class="tf-podium-academy">' + esc(player.academy || player.school || '') + '</div>' +
          '<div class="tf-podium-district">' + esc(player.district || '') + '</div>';
      }
    }
    return '<div class="tf-podium-box ' + cls + '">' +
      '<div class="tf-podium-medal">' + esc(label) + '</div>' + inner +
    '</div>';
  }

  function renderPodium(drawData, entries, compact) {
    var pl = drawData && drawData.placements ? drawData.placements : {};
    return '<div class="tf-podium">' +
      '<div class="tf-podium-heading">Results</div>' +
      '<div class="tf-podium-grid">' +
        renderPodiumSlot('1st', pl.first, 'tf-podium-1st', compact) +
        renderPodiumSlot('2nd', pl.second, 'tf-podium-2nd', compact) +
        renderPodiumSlot('3rd', pl.bronze1, 'tf-podium-3rd', compact) +
        renderPodiumSlot('3rd', pl.bronze2, 'tf-podium-3rd', compact) +
      '</div>' +
      (compact ? '' : '<div class="tf-podium-meta">Entries: ' + esc(entries || 0) + '</div>') +
    '</div>';
  }

  function categoryHeading(opts) {
    var parts = [];
    if (opts.ageCategory) parts.push(String(opts.ageCategory).toUpperCase());
    if (opts.gender) parts.push(String(opts.gender).toUpperCase());
    if (opts.weight) {
      var w = String(opts.weight);
      parts.push((w.charAt(0) === '+' || w.charAt(0) === '-') ? w + ' KG' : w + ' KG');
    }
    if (opts.categoryLabel && !parts.length) return String(opts.categoryLabel).toUpperCase();
    return parts.join(' ') || String(opts.categoryLabel || '').toUpperCase();
  }

  function renderHeader(opts, compact) {
    var brand = opts.brand || {};
    var tournament = opts.tournament || {};
    if (compact) {
      return '<div class="tf-header tf-header-print">' +
        '<div class="tf-header-name">' + esc(brandLinePrint(brand)) + '</div>' +
        '<div class="tf-header-venue">' + esc(tournament.venue || tournament.location || brand.eventLocation || '') + '</div>' +
        '<div class="tf-header-category">' + esc(categoryHeading(opts)) + '</div>' +
        '<div class="tf-header-stats">' +
          '<span>Entries: <strong>' + esc(opts.entries || 0) + '</strong></span>' +
          '<span>Byes: <strong>' + esc(opts.byes || 0) + '</strong></span>' +
        '</div>' +
      '</div>';
    }
    var dateStr = tournament.startDate || tournament.date || '';
    if (root.TCore && root.TCore.fmtDate && dateStr) dateStr = root.TCore.fmtDate(dateStr);
    var logoHtml = '<div class="tf-header-logo">🥋</div>';
    if (brand.logoImage) {
      logoHtml = '<img class="tf-header-logo-img" src="' + esc(brand.logoImage) + '" alt="">';
    }
    return '<div class="tf-header">' +
      '<div class="tf-header-top">' +
        '<div class="tf-header-brand">' + logoHtml +
          '<div class="tf-header-titles">' +
            '<h1 class="tf-header-name">' + esc(brandLine(brand)) + '</h1>' +
            '<div class="tf-header-venue">' + esc(tournament.venue || tournament.location || brand.eventLocation || '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tf-header-date">' + esc(dateStr) + '</div>' +
      '</div>' +
      '<div class="tf-header-category">' + esc(categoryHeading(opts)) + '</div>' +
      '<div class="tf-header-stats">' +
        '<span>Entries: <strong>' + esc(opts.entries || 0) + '</strong></span>' +
        '<span>Byes (R1): <strong>' + esc(opts.byes || 0) + '</strong></span>' +
      '</div>' +
    '</div>';
  }

  function renderBracket(drawData, editable, compact) {
    if (!drawData || !drawData.rounds || !drawData.rounds.length) {
      return '<div class="tf-empty">No draw data available.</div>';
    }
    var rounds = drawData.rounds;
    var totalRounds = rounds.length;
    var r1Count = rounds[0] ? rounds[0].length : 1;
    var cols = [];
    var minW = compact ? 52 : CARD_MIN_W;
    for (var c = 0; c < totalRounds; c++) {
      cols.push('minmax(' + minW + (compact ? 'mm' : 'px') + ', 1fr)');
    }
    var gap = compact ? '8mm' : '48px';
    var html = '<div class="tf-bracket" data-r1="' + r1Count + '" style="grid-template-columns:' + cols.join(' ') + ';gap:' + gap + '">';
    for (var r = 0; r < totalRounds; r++) {
      html += renderRound(drawData, rounds[r], r, totalRounds, editable, compact, r1Count);
    }
    html += '</div>';
    return html;
  }

  function fixtureCSS() {
    return '' +
      '.tf-sheet, .tf-sheet * { box-sizing: border-box; }' +
      '.tf-sheet { width: 100%; background: #fff; color: ' + NAVY + '; font-family: "Segoe UI", Arial, Helvetica, sans-serif; }' +
      '.tf-header { border-bottom: 2px solid ' + NAVY + '; padding: 8px 12px 10px; background: #fff; }' +
      '.tf-header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }' +
      '.tf-header-brand { display: flex; align-items: center; gap: 10px; }' +
      '.tf-header-logo { font-size: 32px; line-height: 1; }' +
      '.tf-header-logo-img { height: 44px; width: auto; object-fit: contain; display: block; }' +
      '.tf-header-name { margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.03em; color: ' + NAVY + '; text-transform: uppercase; }' +
      '.tf-header-venue { font-size: 10px; color: #4a5568; margin-top: 2px; text-transform: uppercase; }' +
      '.tf-header-date { font-size: 10px; font-weight: 600; color: #4a5568; white-space: nowrap; }' +
      '.tf-header-category { text-align: center; font-size: 14px; font-weight: 800; letter-spacing: 0.04em; color: ' + NAVY + '; text-transform: uppercase; margin-top: 8px; padding: 5px 10px; border: 2px solid ' + NAVY + '; background: #f8fafc; }' +
      '.tf-header-stats { display: flex; justify-content: center; gap: 24px; font-size: 10px; color: #4a5568; margin-top: 6px; }' +
      '.tf-body { display: flex; gap: 16px; padding: 12px; align-items: flex-start; overflow-x: auto; }' +
      '.tf-bracket { display: grid; align-items: stretch; flex: 1; min-width: 0; }' +
      '.tf-round { display: flex; flex-direction: column; min-width: ' + CARD_MIN_W + 'px; }' +
      '.tf-round-label { text-align: center; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #fff; background: ' + NAVY + '; padding: 5px 8px; margin-bottom: 8px; border-radius: 2px; flex-shrink: 0; }' +
      '.tf-round-track { display: flex; flex-direction: column; flex: 1; position: relative; overflow: visible; }' +
      '.tf-match-unit { display: flex; align-items: center; position: relative; width: 100%; flex-shrink: 0; overflow: visible; }' +
      '.tf-match-card { width: 100%; min-width: ' + CARD_MIN_W + 'px; max-width: 340px; border: 1.5px solid #b8c4d4; border-radius: 4px; background: #fff; overflow: hidden; flex-shrink: 0; display: block; box-shadow: 0 1px 3px rgba(10,22,51,0.06); }' +
      '.tf-match-head { display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; background: #eef2f8; border-bottom: 1px solid #d5dde8; }' +
      '.tf-match-no { font-size: 11px; font-weight: 800; color: ' + NAVY + '; }' +
      '.tf-match-tag { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #4a5568; background: #fff; border: 1px solid #c5cdd9; padding: 1px 6px; border-radius: 2px; }' +
      '.tf-corner-block { display: block; padding: 7px 10px; border-bottom: 1px solid #e2e8f0; min-height: 52px; overflow: hidden; word-wrap: break-word; overflow-wrap: break-word; }' +
      '.tf-corner-block:last-child { border-bottom: none; }' +
      '.tf-blue { border-left: 5px solid ' + BLUE + '; background: #f7f9ff; }' +
      '.tf-red { border-left: 5px solid ' + RED + '; background: #fff7f7; }' +
      '.tf-bye { background: #f4f6fa; border-left: none; text-align: center; display: flex; align-items: center; justify-content: center; min-height: 44px; }' +
      '.tf-bye-text { font-weight: 700; font-size: 11px; color: #a0aec0; letter-spacing: 0.14em; }' +
      '.tf-pending-block { background: #fafbfc; }' +
      '.tf-corner-row { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 3px; }' +
      '.tf-corner-tag { font-size: 8px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #4a5568; flex-shrink: 0; }' +
      '.tf-player-score { font-size: 9px; font-weight: 700; color: ' + NAVY + '; flex-shrink: 0; }' +
      '.tf-player-name { font-weight: 700; font-size: 11px; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; margin-bottom: 2px; }' +
      '.tf-pending-name { font-style: italic; font-weight: 600; color: #718096; }' +
      '.tf-player-id { font-size: 9px; font-weight: 700; color: ' + BLUE + '; margin-bottom: 1px; }' +
      '.tf-red .tf-player-id { color: ' + RED + '; }' +
      '.tf-player-academy { font-size: 9px; color: #4a5568; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; }' +
      '.tf-player-district { font-size: 9px; color: #718096; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; }' +
      '.tf-player-country { font-size: 9px; color: #718096; font-weight: 600; }' +
      '.tf-slot-winner { background: linear-gradient(90deg, rgba(212,175,55,0.15) 0%, transparent 100%) !important; }' +
      '.tf-slot-loser { opacity: 0.5; }' +
      '.tf-connector { position: absolute; right: -48px; top: 0; bottom: 0; width: 48px; pointer-events: none; }' +
      '.tf-conn-arm { position: absolute; top: 50%; left: 0; width: 24px; height: 2px; background: ' + NAVY + '; transform: translateY(-50%); }' +
      '.tf-conn-vert { position: absolute; left: 23px; width: 2px; background: ' + NAVY + '; }' +
      '.tf-conn-even { top: 50%; bottom: -50%; }' +
      '.tf-conn-odd { top: -50%; bottom: 50%; }' +
      '.tf-round:last-child .tf-connector { display: none; }' +
      '.tf-podium { width: 140px; flex-shrink: 0; border: 1.5px solid ' + NAVY + '; border-radius: 4px; background: #fff; }' +
      '.tf-podium-heading { text-align: center; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; background: ' + NAVY + '; color: #fff; padding: 5px; }' +
      '.tf-podium-grid { padding: 6px; display: grid; gap: 6px; }' +
      '.tf-podium-box { border: 1px solid #c5cdd9; border-radius: 3px; padding: 5px 6px; background: #fff; font-size: 8px; line-height: 1.35; word-wrap: break-word; }' +
      '.tf-podium-1st { border-color: ' + GOLD + '; border-width: 2px; }' +
      '.tf-podium-2nd { border-color: #9aa5b4; }' +
      '.tf-podium-3rd { border-color: #cd7f32; }' +
      '.tf-podium-medal { font-weight: 800; font-size: 9px; color: ' + NAVY + '; margin-bottom: 3px; }' +
      '.tf-podium-1st .tf-podium-medal { color: #9a7b0a; }' +
      '.tf-podium-id { font-weight: 700; font-size: 8px; }' +
      '.tf-podium-name { font-weight: 600; font-size: 9px; word-wrap: break-word; }' +
      '.tf-podium-academy { font-size: 8px; color: #4a5568; word-wrap: break-word; }' +
      '.tf-podium-district { font-size: 8px; color: #718096; }' +
      '.tf-podium-empty { color: #a0aec0; text-align: center; padding: 6px 0; }' +
      '.tf-podium-meta { text-align: center; font-size: 8px; padding: 4px; border-top: 1px solid #dde3ef; color: #718096; }' +
      '.tf-empty { padding: 40px; text-align: center; color: #718096; }' +
      '.tf-sheet-editable .tf-slot-editable { cursor: pointer; }' +
      '.tf-sheet-editable .tf-slot-editable:hover { outline: 2px solid ' + GOLD + '; outline-offset: -2px; }' +
      '.tf-edit-btn { margin-left: auto; border: 1px solid ' + NAVY + '; background: #fff; color: ' + NAVY + '; font-size: 8px; font-weight: 800; letter-spacing: 0.04em; padding: 1px 6px; border-radius: 2px; cursor: pointer; flex-shrink: 0; }' +
      '.tf-edit-btn:hover { background: ' + GOLD + '; border-color: ' + GOLD + '; }' +
      '.tf-bye .tf-edit-btn { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); }' +
      '.tf-bye { position: relative; }';
  }

  function printLayoutCSS() {
    return '' +
      '.draw-sheet, .draw-sheet * { box-sizing: border-box; }' +
      '.draw-sheet { width: 287mm; height: 200mm; max-height: 200mm; overflow: hidden; background: #fff; color: ' + NAVY + '; font-family: "Segoe UI", Arial, Helvetica, sans-serif; display: flex; flex-direction: column; }' +
      '.draw-sheet .tf-header-print { flex-shrink: 0; text-align: center; padding: 0 0 1.5mm; border-bottom: 1px solid ' + NAVY + '; margin-bottom: 2mm; }' +
      '.draw-sheet .tf-header-print .tf-header-name { font-size: 10pt; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; color: ' + NAVY + '; line-height: 1.15; }' +
      '.draw-sheet .tf-header-print .tf-header-venue { font-size: 7pt; color: #4a5568; text-transform: uppercase; margin-top: 0.6mm; }' +
      '.draw-sheet .tf-header-print .tf-header-category { font-size: 8.5pt; font-weight: 800; text-transform: uppercase; color: ' + NAVY + '; margin-top: 1mm; padding: 0.8mm 2mm; border: 1px solid ' + NAVY + '; display: inline-block; }' +
      '.draw-sheet .tf-header-print .tf-header-stats { font-size: 7pt; color: #4a5568; margin-top: 0.8mm; display: flex; justify-content: center; gap: 6mm; }' +
      '.draw-sheet .tf-body { display: flex; gap: 3mm; padding: 0; align-items: flex-start; flex: 1; min-height: 0; overflow: hidden; }' +
      '.draw-sheet .tf-bracket { display: grid; align-items: start; flex: 1; min-width: 0; min-height: 0; overflow: visible; }' +
      '.draw-sheet .tf-round { display: flex; flex-direction: column; min-width: 0; align-items: stretch; }' +
      '.draw-sheet .tf-round-label { text-align: center; font-size: 6.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #fff; background: ' + NAVY + '; padding: 0.8mm 1.5mm; margin-bottom: 1.5mm; flex-shrink: 0; }' +
      '.draw-sheet .tf-round-track { display: flex; flex-direction: column; position: relative; overflow: visible; flex: none; justify-content: flex-start; gap: 0; }' +
      '.draw-sheet .tf-match-unit { display: flex; align-items: center; position: relative; width: 100%; flex: none; overflow: visible; }' +
      '.draw-sheet .tf-match-card { width: calc(100% - 1mm); border: 1px solid #b8c4d4; border-radius: 2px; background: #fff; overflow: hidden; flex-shrink: 0; display: block; page-break-inside: avoid; break-inside: avoid; }' +
      '.draw-sheet .tf-match-head { padding: 0.3mm 1.5mm; background: #eef2f8; border-bottom: 1px solid #d5dde8; line-height: 1; }' +
      '.draw-sheet .tf-match-no { font-size: 6.5pt; font-weight: 800; color: ' + NAVY + '; }' +
      '.draw-sheet .tf-corner-block { display: block; padding: 0.5mm 1.5mm 0.5mm 2mm; border-bottom: 1px solid #e8ecf2; overflow: hidden; word-wrap: break-word; overflow-wrap: break-word; min-height: 0; line-height: 1.1; }' +
      '.draw-sheet .tf-corner-block:last-child { border-bottom: none; }' +
      '.draw-sheet .tf-blue { border-left: 2.5px solid ' + BLUE + '; background: #f7f9ff; }' +
      '.draw-sheet .tf-red { border-left: 2.5px solid ' + RED + '; background: #fff7f7; }' +
      '.draw-sheet .tf-bye { background: #f4f6fa; border-left: none; text-align: center; display: flex; align-items: center; justify-content: center; padding: 1mm; min-height: 5mm; }' +
      '.draw-sheet .tf-bye-text { font-weight: 700; font-size: 7pt; color: #a0aec0; letter-spacing: 0.1em; }' +
      '.draw-sheet .tf-print-icon { font-size: 6.5pt; line-height: 1; margin-bottom: 0.2mm; }' +
      '.draw-sheet .tf-player-name { font-weight: 800; font-size: 8pt; line-height: 1.1; word-wrap: break-word; overflow-wrap: break-word; margin-bottom: 0.2mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-pending-name { font-style: italic; font-weight: 600; color: #718096; font-size: 7pt; }' +
      '.draw-sheet .tf-player-academy { font-size: 6pt; font-weight: 400; color: #4a5568; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-player-district { font-size: 6pt; font-weight: 400; color: #718096; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-connector { position: absolute; right: -4mm; top: 0; bottom: 0; width: 4mm; pointer-events: none; }' +
      '.draw-sheet .tf-conn-arm { position: absolute; top: 50%; left: 0; width: 2mm; height: 1px; background: ' + NAVY + '; transform: translateY(-50%); }' +
      '.draw-sheet .tf-conn-vert { position: absolute; left: 1.9mm; width: 1px; background: ' + NAVY + '; }' +
      '.draw-sheet .tf-conn-even { top: 50%; bottom: -50%; }' +
      '.draw-sheet .tf-conn-odd { top: -50%; bottom: 50%; }' +
      '.draw-sheet .tf-round:last-child .tf-connector { display: none; }' +
      '.draw-sheet .tf-podium { width: 26mm; flex-shrink: 0; border: 1px solid ' + NAVY + '; border-radius: 2px; background: #fff; display: flex; flex-direction: column; align-self: flex-end; margin-top: 28mm; margin-left: 2mm; }' +
      '.draw-sheet .tf-podium-heading { text-align: center; font-size: 6pt; font-weight: 800; text-transform: uppercase; background: ' + NAVY + '; color: #fff; padding: 0.6mm; flex-shrink: 0; }' +
      '.draw-sheet .tf-podium-grid { padding: 1mm; display: grid; gap: 1mm; }' +
      '.draw-sheet .tf-podium-box { border: 1px solid #c5cdd9; border-radius: 1px; padding: 0.8mm 1mm; background: #fff; font-size: 5.5pt; line-height: 1.15; word-wrap: break-word; min-height: 7mm; max-height: 12mm; overflow: hidden; }' +
      '.draw-sheet .tf-podium-1st { border-color: ' + GOLD + '; }' +
      '.draw-sheet .tf-podium-2nd { border-color: #9aa5b4; }' +
      '.draw-sheet .tf-podium-3rd { border-color: #cd7f32; }' +
      '.draw-sheet .tf-podium-medal { font-weight: 800; font-size: 6pt; color: ' + NAVY + '; margin-bottom: 0.3mm; }' +
      '.draw-sheet .tf-podium-name { font-weight: 700; font-size: 5.5pt; word-wrap: break-word; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-podium-academy { font-size: 5pt; color: #4a5568; word-wrap: break-word; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-podium-district { font-size: 5pt; color: #718096; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
      '.draw-sheet .tf-podium-empty { color: #a0aec0; text-align: center; padding: 0.5mm 0; font-size: 5.5pt; }' +
      '.draw-sheet .tf-slot-winner { background: linear-gradient(90deg, rgba(212,175,55,0.12) 0%, transparent 100%) !important; }' +
      '.draw-sheet .tf-slot-loser { opacity: 0.55; }';
  }

  function ensureStyles(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || doc.getElementById(STYLE_ID)) return;
    var s = doc.createElement('style');
    s.id = STYLE_ID;
    s.textContent = fixtureCSS();
    doc.head.appendChild(s);
  }

  function renderSheet(opts) {
    opts = opts || {};
    ensureStyles();
    var drawData = opts.drawData || {};
    return '<div class="tf-sheet">' +
      renderHeader(opts, false) +
      '<div class="tf-body">' +
        renderBracket(drawData, false, false) +
        renderPodium(drawData, opts.entries, false) +
      '</div>' +
    '</div>';
  }

  function renderPrintSheet(opts) {
    opts = opts || {};
    var drawData = opts.drawData || {};
    var r1 = drawData.rounds && drawData.rounds[0] ? drawData.rounds[0].length : 1;
    return '<div class="draw-sheet tf-sheet-print" data-r1="' + r1 + '">' +
      renderHeader(opts, true) +
      '<div class="tf-body">' +
        renderBracket(drawData, false, true) +
        renderPodium(drawData, opts.entries, true) +
      '</div>' +
    '</div>';
  }

  function renderEditable(opts) {
    opts = opts || {};
    ensureStyles();
    var drawData = opts.drawData || {};
    return '<div class="tf-sheet tf-sheet-editable">' +
      renderHeader(opts, false) +
      '<div class="tf-body">' +
        renderBracket(drawData, true, false) +
        renderPodium(drawData, opts.entries, false) +
      '</div>' +
    '</div>';
  }

  function printCSS() {
    return '@page { size: A4 landscape; margin: 5mm; }' +
      'html, body { margin: 0 !important; padding: 0 !important; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
      printLayoutCSS() +
      '@media print {' +
        'html, body { width: 297mm; height: 210mm; overflow: hidden; }' +
        '.draw-sheet { width: 287mm; height: 200mm; max-height: 200mm; overflow: hidden; page-break-after: avoid; page-break-inside: avoid; }' +
        '.draw-sheet .tf-match-card { break-inside: avoid; page-break-inside: avoid; }' +
        '.draw-sheet .tf-corner-block { break-inside: avoid; page-break-inside: avoid; }' +
        '.no-print { display: none !important; }' +
      '}';
  }

  function slotLabel(drawData, roundIndex, matchIndex, side) {
    if (root.TCore && root.TCore.slotDisplayLabel) {
      return root.TCore.slotDisplayLabel(drawData, roundIndex, matchIndex, side);
    }
    var slot = resolveSlot(drawData, roundIndex, matchIndex, side);
    if (slot.type === 'player') return slot.player.name;
    if (slot.type === 'bye') return 'BYE';
    if (slot.type === 'placeholder') return slot.label;
    return '—';
  }

  root.TFixture = {
    roundTitle: roundTitle,
    slotLabel: slotLabel,
    fixtureCSS: fixtureCSS,
    printLayoutCSS: printLayoutCSS,
    ensureStyles: ensureStyles,
    renderSheet: renderSheet,
    renderPrintSheet: renderPrintSheet,
    renderEditable: renderEditable,
    printCSS: printCSS
  };
})(window);
