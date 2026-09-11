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
    out.push({ id: 'p' + i, name: 'Player ' + String.fromCharCode(65 + i), regNo: 'R' + i, academy: 'Academy', district: 'Alwar' });
  }
  return out;
}

[6, 16].forEach(function (n) {
  var draw = T.generateDraw(makePlayers(n), 'random');
  var html = TF.renderSheet({ drawData: draw, entries: n, byes: draw.byes, brand: ctx.TOURNAMENT_DEFAULTS, ageCategory: 'Junior', gender: 'Girls', weight: '+68' });
  console.log('\n=== ' + n + ' players ===');
  console.log('match cards:', (html.match(/tf-match-card/g) || []).length);
  console.log('round columns:', (html.match(/tf-round-label/g) || []).length);
  console.log('corner blocks:', (html.match(/tf-corner-block/g) || []).length);
  console.log('connectors:', (html.match(/tf-connector/g) || []).length);
  console.log('bracket grid:', html.indexOf('grid-template-columns') > -1);
  draw.rounds.forEach(function (round, ri) {
    console.log('  R' + (ri + 1) + ': ' + round.length + ' matches');
  });
});
