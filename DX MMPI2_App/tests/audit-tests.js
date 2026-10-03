const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const context = {
  console,
  window: {
    __BAREMOS_US__: JSON.parse(fs.readFileSync('data/baremo_us.json','utf8')),
    __BAREMOS_ES__: JSON.parse(fs.readFileSync('data/baremos.json','utf8')),
    __CRITERIOS__: JSON.parse(fs.readFileSync('data/criterios.json','utf8')),
  },
  fetch: async () => { throw new Error('fetch not used in tests'); },
  setTimeout, clearTimeout,
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/lib/mmpi2.js','utf8'), context, {filename:'mmpi2.js'});
const M = context.window.MMPI2;
M.SCALE_ITEMS = JSON.parse(fs.readFileSync('data/scale_items.json','utf8'));
M.SCALE_REGISTRY = JSON.parse(fs.readFileSync('data/scale_registry.json','utf8')).scales;

function ok(name, fn) {
  try { fn(); console.log('PASS', name); }
  catch(e) { console.error('FAIL', name, e.message); process.exitCode = 1; }
}

ok('Scale A missing key fails closed', () => {
  const r = M.computePD('A', Array(567).fill(1));
  assert.strictEqual(r.pd, null);
  assert.strictEqual(r.status, 'CLAVE_NO_DISPONIBLE');
});

ok('F 58/60 is incomplete and never scores PD=0', () => {
  const c = M.validateScaleKey('F');
  assert.strictEqual(c.status, 'CLAVE_INCOMPLETA');
  assert.strictEqual(c.actualCount, 58);
  assert.strictEqual(c.expectedCount, 60);
  const r = M.computePD('F', Array(567).fill(1));
  assert.strictEqual(r.pd, null);
});

ok('Hs 32/32 is structurally accepted', () => {
  const c = M.validateScaleKey('Hs');
  assert.strictEqual(c.actualCount, 32);
  assert.strictEqual(c.expectedCount, 32);
  assert.strictEqual(c.calculable, true);
});

ok('VRIN/TRIN are special and blocked locally', () => {
  const v = M.validateScaleKey('VRIN');
  const t = M.validateScaleKey('TRIN');
  assert.strictEqual(v.expectedPairs, 49);
  assert.strictEqual(t.expectedPairs, 20);
  assert.strictEqual(v.calculable, false);
  assert.strictEqual(t.calculable, false);
});

ok('Spanish local T is deliberately blocked', () => {
  const r = M.lookupT('L', 5, 'M', 'ES');
  assert.strictEqual(r.t, null);
  assert.strictEqual(r.status, 'BAREMO_ES_NO_VALIDADO_LOCALMENTE');
});

ok('US lookup requires exact PD, never lower-neighbor approximation', () => {
  const table = context.window.__BAREMOS_US__.L?.M || {};
  const keys = Object.keys(table).map(Number).sort((a,b)=>a-b);
  if (keys.length < 2) return;
  const max = keys[keys.length-1];
  const r = M.lookupT('L', max + 1000, 'M', 'US');
  assert.strictEqual(r.t, null);
  assert.strictEqual(r.status, 'PD_FUERA_DE_TABLA');
});

ok('Official scores override local results and preserve TRIN direction', () => {
  const results = { Hs:{}, TRIN:{} };
  M.applyOfficialTScores(results, 'Hs=68, TRIN=57F', 'M', 'Pearson');
  assert.strictEqual(results.Hs.t, 68);
  assert.strictEqual(results.Hs.status, 'T_OFICIAL_IMPORTADA');
  assert.strictEqual(results.TRIN.t, 57);
  assert.strictEqual(results.TRIN.tDirection, 'F');
  assert.strictEqual(results.TRIN.tDisplay, '57F');
});

ok('Active key file contains no spurious formula identifiers', () => {
  const a = M.auditKeys();
  assert.strictEqual(a.spuriousKeys.length, 0);
});

if (process.exitCode) process.exit(process.exitCode);
