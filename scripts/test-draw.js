/* Node validation for draw generator — run: node scripts/test-draw.js */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var root = path.join(__dirname, '..');

function makeCtx() {
  var w = {};
  w.window = w;
  return w;
}

var ctx = makeCtx();
vm.runInNewContext(fs.readFileSync(path.join(root, 'config/tournament-config.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/tournament-core-stub.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/tournament-core.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/tournament-fixture.js'), 'utf8'), ctx);

var T = ctx.TCore;
var TF = ctx.TFixture;

function makePlayers(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    out.push({ id: 'p' + (i + 1), name: 'Player ' + String.fromCharCode(65 + i), regNo: 'R' + i, academy: 'Academy', district: 'Alwar' });
  }
  return out;
}

function nextPow2(n) { var s = 1; while (s < n) s *= 2; return s; }

function countByesInRound(round) {
  var c = 0;
  (round || []).forEach(function (m) {
    if (!m.a) c++;
    if (!m.b) c++;
  });
  return c;
}

function validate(n, drawData, html) {
  var issues = [];
  var expectedByes = nextPow2(n) - n;
  if ((drawData.byes || 0) !== expectedByes) issues.push('bye count metadata');
  if (countByesInRound(drawData.rounds[0]) !== expectedByes) issues.push('R1 bye slots');
  for (var ri = 1; ri < drawData.rounds.length; ri++) {
    var round = drawData.rounds[ri];
    for (var mi = 0; mi < round.length; mi++) {
      var m = round[mi];
      if (m.status === 'bye') issues.push('R' + (ri + 1) + ' match M' + m.matchNo + ' has bye status');
      if (!m.a && !m.b && m.status !== 'pending') issues.push('R' + (ri + 1) + ' empty match');
    }
    if (html.indexOf('tf-bye-text') >= 0 && ri > 0) {
      // check rendered labels in later rounds via slotLabel
      round.forEach(function (m, mi) {
        ['a', 'b'].forEach(function (side) {
          var label = TF.slotLabel({ rounds: drawData.rounds }, ri, mi, side);
          if (label === 'BYE') issues.push('R' + (ri + 1) + ' displays BYE');
        });
      });
    }
  }
  var ids = [];
  (drawData.rounds[0] || []).forEach(function (m) {
    if (m.a && m.a.id) ids.push(m.a.id);
    if (m.b && m.b.id) ids.push(m.b.id);
  });
  if (ids.length !== n) issues.push('player count in R1');
  if (ids.filter(function (v, i, a) { return a.indexOf(v) === i; }).length !== ids.length) issues.push('duplicates');

  (drawData.rounds[0] || []).filter(function (m) { return m.status === 'bye'; }).forEach(function (m) {
    var winner = m.winner === 'a' ? m.a : m.b;
    var ri = 1, mi = m.matchIndex;
    var nextMi = Math.floor(mi / 2);
    var nextSide = (mi % 2 === 0) ? 'a' : 'b';
    var nextMatch = drawData.rounds[ri][nextMi];
    var advanced = nextSide === 'a' ? nextMatch.a : nextMatch.b;
    if (!advanced || advanced.id !== winner.id) issues.push('M' + m.matchNo + ' advancement');
  });

  var byeLabels = (html.match(/tf-bye-text/g) || []).length;
  if (byeLabels !== expectedByes) issues.push('HTML bye labels=' + byeLabels);

  var final = drawData.rounds[drawData.rounds.length - 1][0];
  if (T.slotDisplayLabel(drawData, drawData.rounds.length - 1, 0, 'a') === 'BYE') issues.push('final shows BYE');
  if (T.slotDisplayLabel(drawData, drawData.rounds.length - 1, 0, 'b') === 'BYE') issues.push('final shows BYE');

  return issues;
}

var counts = [2, 3, 4, 5, 6, 7, 8, 9, 10, 16];
var failed = false;

counts.forEach(function (n) {
  var drawData = T.generateDraw(makePlayers(n), 'random');
  var html = TF.renderSheet({ drawData: drawData, entries: n, byes: drawData.byes, brand: ctx.window.TOURNAMENT_DEFAULTS, ageCategory: 'Junior', gender: 'Girls', weight: '+68' });
  var issues = validate(n, drawData, html);
  var status = issues.length ? 'FAIL' : 'PASS';
  if (issues.length) failed = true;
  console.log(n + ' players: ' + status + (issues.length ? ' — ' + issues.join(', ') : ' (byes=' + drawData.byes + ')'));
});

// 6-player detail
var d6 = T.generateDraw(makePlayers(6), 'random');
console.log('\n--- 6-player bracket detail ---');
d6.rounds.forEach(function (round, ri) {
  round.forEach(function (m) {
    var a = T.slotDisplayLabel(d6, ri, m.matchIndex, 'a');
    var b = T.slotDisplayLabel(d6, ri, m.matchIndex, 'b');
    console.log('R' + (ri + 1) + ' M' + m.matchNo + ' [' + m.status + ']: ' + a + ' vs ' + b);
  });
});

process.exit(failed ? 1 : 0);
