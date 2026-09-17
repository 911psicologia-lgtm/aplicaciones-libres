from pathlib import Path
root=Path(__file__).resolve().parents[1]
def read(p): return (root/p).read_text(encoding='utf-8')
def check(v,msg):
    if not v: raise AssertionError(msg)
cfg=read('js/config.js'); game=read('js/game.js'); sw=read('sw.js'); main=read('js/main.js'); idx=read('index.html')
check("VERSION: '0.7.6'" in cfg,'wrong app version')
check('phaseConsequences' in cfg and 'supportSynergy' in cfg,'v0.7.6 config missing')
for token in ['bossScarState','armBossScarResponse','resolveBossScarResponse','COLAPSO SISTÉMICO','CAMPO DE ANCLAJE','REACTOR INESTABLE','supportSynergyState','REANIMACIÓN PROTEGIDA','CRÍA EN RED']:
    check(token in game,f'missing runtime token: {token}')
check('starfall-shell-v0.7.6' in sw,'wrong service worker cache version')
check('build=0760' in main,'wrong service worker registration build')
check('v0.7.6 · COMBAT DOCTRINE' in idx,'wrong home version label')
print('VALIDATION v0.7.6 PASS')
