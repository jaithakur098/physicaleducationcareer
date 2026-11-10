var fs = require('fs');
var path = require('path');
var vm = require('vm');

function makeCtx() {
  var w = {};
  w.window = w;
  return w;
}

var root = path.join(__dirname, '..');
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
    out.push({
      id: 'p' + i,
      name: 'Player ' + String.fromCharCode(65 + i),
      regNo: 'REG-' + i,
      academy: 'Ultimate TKD Academy ' + (i % 3),
      district: ['Alwar', 'Jaipur', 'Delhi'][i % 3],
      country: 'INDIA'
    });
  }
  return out;
}

var counts = [2, 4, 6, 8, 16];
var failed = false;

counts.forEach(function (n) {
  var draw = T.generateDraw(makePlayers(n), 'random');
  var html = TF.renderPrintSheet({
    drawData: draw,
    entries: n,
    byes: draw.byes,
    brand: ctx.TOURNAMENT_DEFAULTS,
    tournament: { venue: 'Alwar, Rajasthan' },
    ageCategory: 'Junior',
    gender: 'Girls',
    weight: '+68'
  });
  var issues = [];
  if (html.indexOf('draw-sheet') < 0) issues.push('missing draw-sheet class');
  if (html.indexOf('tf-player-id') >= 0) issues.push('print contains player ID');
  if (html.indexOf('tf-player-country') >= 0) issues.push('print contains country');
  if (html.indexOf('tf-corner-tag') >= 0) issues.push('print contains corner tag');
  if (html.indexOf('tf-match-tag') >= 0) issues.push('print contains match tag');
  if ((html.match(/tf-match-card/g) || []).length !== (draw.rounds[0].length * 2 - 1)) {
    // total matches = 2^n - 1
    var expected = 1;
    var size = 1; while (size < n) size *= 2;
    expected = size - 1;
    if ((html.match(/tf-match-card/g) || []).length !== expected) {
      issues.push('match card count');
    }
  }
  var cards = (html.match(/tf-match-card/g) || []).length;
  var size2 = 1; while (size2 < n) size2 *= 2;
  if (cards !== size2 - 1) issues.push('expected ' + (size2 - 1) + ' cards got ' + cards);
  if (!html.match(/tf-player-name/g)) issues.push('missing player names');
  if (!html.match(/tf-player-academy/g)) issues.push('missing academy');
  if (!html.match(/tf-player-district/g)) issues.push('missing district');
  console.log(n + ' players print: ' + (issues.length ? 'FAIL — ' + issues.join(', ') : 'PASS (' + cards + ' cards)'));
  if (issues.length) failed = true;
});

var css = TF.printCSS();
if (css.indexOf('A4 landscape') < 0) { console.log('CSS missing A4 landscape'); failed = true; }
if (css.indexOf('200mm') < 0) { console.log('CSS missing 200mm height'); failed = true; }
else console.log('Print CSS: A4 landscape + 200mm height OK');

// Compact spacing check: 6-player R1 match units must be ~20mm (not page-stretched)
var d6 = T.generateDraw(makePlayers(6), 'random');
var h6 = TF.renderPrintSheet({ drawData: d6, entries: 6, byes: d6.byes, brand: ctx.TOURNAMENT_DEFAULTS, tournament: { venue: 'Alwar' }, ageCategory: 'Junior', gender: 'Girls', weight: '+68' });
var r1Units = (h6.match(/tf-match-unit" style="height:([\d.]+)mm"/g) || []);
var r1Heights = r1Units.map(function (s) {
  var m = s.match(/height:([\d.]+)mm/);
  return m ? parseFloat(m[1]) : 0;
}).filter(function (h, i) { return i < 4; });
console.log('6-player R1 unit heights:', r1Heights.join(', '));
var stretched = r1Heights.some(function (h) { return h > 25; });
if (stretched) {
  console.log('FAIL: R1 still stretched');
  failed = true;
} else if (r1Heights.length === 4 && r1Heights.every(function (h) { return h <= 21; })) {
  console.log('Compact R1 slot OK');
} else {
  console.log('WARN: unexpected R1 heights');
}

process.exit(failed ? 1 : 0);
