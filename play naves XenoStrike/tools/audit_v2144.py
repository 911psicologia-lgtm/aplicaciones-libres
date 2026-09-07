#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
game=(root/'js/game.js').read_text(encoding='utf-8')
sw=(root/'sw.js').read_text(encoding='utf-8')
idx=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def ck(name,ok,detail=''):
    checks.append({'name':name,'ok':bool(ok),'detail':detail})
# Version/cache/migration
ck('VERSION 2.14.4',"const VERSION='2.14.4'" in game)
ck('META key v2144',"swarm_rift_meta_v2144" in game)
ck('RUN key v2144',"swarm_rift_run_v2144" in game)
ck('META migration v2143',"loadJSON('swarm_rift_meta_v2143'" in game)
ck('RUN migration v2143',"loadJSON('swarm_rift_run_v2143'" in game)
ck('hasSave v2143',"localStorage.getItem('swarm_rift_run_v2143')" in game)
ck('index JS bust 2144','js/game.js?v=2144' in idx)
ck('index CSS bust 2144','css/game.css?v=2144' in idx)
ck('SW cache v2.14.4',"swarm-rift-v2.14.4" in sw)
ck('SW JS bust 2144','./js/game.js?v=2144' in sw)
ck('SW CSS bust 2144','./css/game.css?v=2144' in sw)
# Chapter I and bosses
for n,name in enumerate(['IMPERATRIX VESPA','ATLAS VERDE','CORTEX RAZOR','VELA NOCTIS','REGINA FERRUM','COLOSSUS HOP','SANGUINA PRIME','ARCHITECT ZERO','AURALIS','RESONATOR OMEGA'],1):
    ck(f'Boss {n} {name}',name in game)
for fam,key in [('LANGOSTAS','colossus'),('MOSQUITOS','sanguina'),('TERMITAS','architect'),("'LIBÉLULAS'",'auralis'),('CIGARRAS','resonator')]:
    ck(f'Boss final asset {key}',f"boss_{'colossus_hop' if key=='colossus' else 'sanguina_prime' if key=='sanguina' else 'architect_zero' if key=='architect' else 'auralis' if key=='auralis' else 'resonator_omega'}_final.png?av=2137" in game)
    for state in ['idle','attack','hurt','phase','death']:
        ck(f'{key} anim {state}',re.search(rf"{key}:\{{.*?{state}:new Image\(\)",game,re.S) is not None)
for sig in ['IMPACTO COLOSSUS','SIFÓN HEMÁTICO','JAULA DE RESINA','CRUZ PRISMÁTICA','ONDA OMEGA']:
    ck(f'Signature {sig}',sig in game)
# Power/hangar preserved + new 2144
for key in ['ionweb','orbitblade','phase','nanites','riftmine','echo','nova']:
    ck(f'Power {key}',f"{key}:{{" in game or f"'{key}'" in game)
ck('26-power status','powers:{total:POWER_KEYS.length' in game)
ck('23 combos status','fusion:{combos:Object.keys(COMBOS).length' in game)
ck('A/B branches','const POWER_BRANCHES={' in game and "powerBranches" in game)
ck('Ranks VI/VII',"'VI','VII'" in game and 'OMEGA' in game and 'ASCENDIDO' in game)
ck('5 doctrines','const HANGAR_DOCTRINES={' in game and all(x in game for x in ['adaptive:{','assault:{','control:{','sustain:{','fusion:{']))
ck('3 reserve policies','const RESERVE_POLICIES={' in game and all(x in game for x in ['smart:{','conserve:{','boss:{']))
ck('Fusion mastery','comboMasteryLevel' in game and 'COMBO_MASTERY_THRESHOLDS' in game)
ck('Overflow upgrade','Reactor de sobreflujo' in game and "id:'overclock'" in game)
ck('Overflow activation','tryActivateOverflowPower' in game and 'overflowPowerKey' in game)
ck('Overflow persistence','overflowPowerKey:G.overflowPowerKey||null' in game and 'overflowPowerKey:s.overflowPowerKey||null' in game)
ck('Overflow HUD','overflowPowerActive()?1:0' in game and "overflow?'#fff09a'" in game)
ck('Fusion tier function','fusionTierForCombos' in game)
ck('Fusion cascade tier 2',"'CASCADA Σ'" in game)
ck('Fusion apex tier 3',"'ÁPICE Σ'" in game)
ck('Fusion escalation','escalateFusionSurge' in game and 'n>=3&&n>priorN' in game)
ck('Boss counter matrix','const BOSS_COUNTERS={' in game)
for i in range(1,11): ck(f'Counter sector {i}',re.search(rf"\n\s*{i}:\{{label:",game) is not None)
ck('Boss counter damage cap 9%',"Math.min(.09,bossCounterActiveCount()*.03)" in game)
ck('Counter smart score','bossCounterKeys(sector).includes(key)' in game)
ck('Counter briefing card','bossCounterBriefingItem' in game and "kind:'briefing'" in game)
ck('Counter HUD','⌖ ${bossCounterActiveCount()}' in game)
ck('Adaptive VFX budget','function vfxBudgetScale()' in game)
ck('Particle hard cap','G.particles.length>900' in game)
ck('Responsive multirow active powers','maxPerRow=Math.max(2' in game and 'activeRows=Math.max(1' in game)
ck('Responsive queue reposition','queueMinY' in game)
# Preserved major systems
for name,needle in [
 ('Auto-fire','function firePlayer()'),('Direct touch',"cv.addEventListener('pointerdown'"),('No joystick gameplay','sin joystick'),
 ('Boss Rush','function startBossRush'),('Grand Boss Rush','function startGrandBossRush'),('CHASE','function startChaseBonus'),
 ('Commander Convergence','commanderReinforceT'),('Lieutenants','function spawnLieutenant'),('Combat Director','function updateCombatDirector'),
 ('Wave Objectives','prepareWaveObjective'),('Reward Ledger','rewardLedger'),('Boss checkpoint','bossLossCheckpoint'),
 ('Music Director','WORLD_PLAYLISTS'),('Crossfade','fadeTo(0,620'),('PWA registration',"serviceWorker.register('./sw.js')")]:
    ck(name,needle.lower() in game.lower())
# PWA resources
m=re.search(r'const ASSETS=(\[.*?\]);\s*self\.addEventListener',sw,re.S)
assets=[]
if m:
    try: assets=json.loads(m.group(1))
    except Exception: pass
ck('SW asset list parse',bool(assets),f'{len(assets)} resources')
missing=[]
for a in assets:
    path=a.split('?',1)[0].lstrip('./')
    if not path: continue
    if not (root/path).exists(): missing.append(path)
ck('PWA resources exist',len(missing)==0,f'missing={len(missing)}')
# No chapter II sectors enabled check by explicit active count expectation in status
ck('Chapter II false status','chapterIIStarted:false' in game)
# Old app cache not active
ck('No active app=2143 cache bust',"app=2143" not in game)
ck('No active SW cache 2.14.3',"swarm-rift-v2.14.3" not in sw)
passed=sum(c['ok'] for c in checks)
out={'version':'2.14.4','passed':passed,'total':len(checks),'failed':[c for c in checks if not c['ok']],'checks':checks,'pwa_assets':len(assets),'pwa_missing':missing}
(root/'AUTOAUDIT_v2.14.4.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
lines=[f"SWARM//RIFT v2.14.4 AUTOAUDIT",f"RESULTADO: {passed}/{len(checks)} PASS",f"PWA: {len(assets)} recursos / {len(missing)} faltantes",'']
for c in checks: lines.append(('PASS' if c['ok'] else 'FAIL')+f" · {c['name']}"+(f" · {c['detail']}" if c['detail'] else ''))
(root/'AUTOAUDIT_v2.14.4.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'{passed}/{len(checks)} PASS')
if passed!=len(checks):
    for c in checks:
        if not c['ok']: print('FAIL',c['name'],c['detail'])
    sys.exit(1)
