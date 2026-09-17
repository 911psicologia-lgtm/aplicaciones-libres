from pathlib import Path
root=Path(__file__).resolve().parents[1]
def check(v,msg):
    if not v: raise SystemExit('FAIL: '+msg)
cfg=(root/'js/config.js').read_text(); game=(root/'js/game.js').read_text(); sw=(root/'sw.js').read_text(); main=(root/'js/main.js').read_text(); idx=(root/'index.html').read_text()
check("VERSION: '0.7.6'" in cfg,'wrong app version')
check('bossDoctrine' in cfg and 'subbossFatigue' in cfg,'v0.7.6 config missing')
for cue in ['CADENA DE MANDO ROTA · ESCOLTAS DESCOORDINADAS','SUBJEFE FATIGADO · DEFENSA DEGRADADA','DOCTRINA ·']:
    check(cue in game,'missing cue: '+cue)
for fn in ['bossDoctrineProfile','bossDoctrineMoveMul','bossDoctrineSignatureCdMul','bossMajorThreatReady','setBossMajorThreatCooldown','announceBossDoctrine']:
    check(('function '+fn) in game,'missing function: '+fn)
check('starfall-shell-v0.7.6' in sw,'wrong service worker cache version')
check('build=0760' in main,'wrong service worker registration build')
check('v0.7.6 · COMBAT DOCTRINE' in idx,'wrong home version label')
print('VALIDATION v0.7.6 PASS')
