from pathlib import Path
root=Path(__file__).resolve().parents[1]
def check(v,msg):
    if not v: raise SystemExit('FAIL: '+msg)
cfg=(root/'js/config.js').read_text()
game=(root/'js/game.js').read_text()
sw=(root/'sw.js').read_text()
main=(root/'js/main.js').read_text()
idx=(root/'index.html').read_text()
check("VERSION: '0.7.5'" in cfg,'wrong app version')
check('combatIntent' in cfg and 'subbossInterruption' in cfg,'v0.7.5 config missing')
for cue in ['INTENCIÓN ROTA · DOMINIO TÁCTICO','ROMPE LA ESCOLTA PARA INTERRUMPIR','SUBJEFE DESEQUILIBRADO · FIRMA RETRASADA']:
    check(cue in game,'missing cue: '+cue)
for fn in ['armBossCombatIntent','updateBossCombatIntent','breakBossCombatIntent','noteBossIntentEscortKill','noteSubbossRecoveryDamage']:
    check(('function '+fn) in game,'missing function: '+fn)
check('starfall-shell-v0.7.5' in sw,'wrong service worker cache version')
check('build=0750' in main,'wrong service worker registration build')
check('v0.7.5 · TACTICAL INTENT' in idx,'wrong home version label')
print('VALIDATION v0.7.5 PASS')
