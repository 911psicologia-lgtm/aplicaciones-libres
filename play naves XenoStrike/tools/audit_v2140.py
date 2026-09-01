from pathlib import Path
import re, json, subprocess, hashlib

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'js/game.js'; SW=ROOT/'sw.js'; INDEX=ROOT/'index.html'
s=GAME.read_text(encoding='utf-8'); sw=SW.read_text(encoding='utf-8'); html=INDEX.read_text(encoding='utf-8')
report={'version':'2.14.0','checks':{},'details':{},'limitations':[]}

def add(name,ok,detail=''):
    report['checks'][name]={'ok':bool(ok),'detail':str(detail)}

def nodecheck(path):
    r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
    return r.returncode==0,(r.stderr or r.stdout).strip() or 'PASS'

ok,detail=nodecheck(GAME); add('node_check_game',ok,detail)
ok,detail=nodecheck(SW); add('node_check_sw',ok,detail)
add('VERSION',"const VERSION='2.14.0';" in s,'2.14.0')
add('save_migration_v2137',"swarm_rift_meta_v2137" in s and "swarm_rift_run_v2137" in s,'META/RUN v2.13.7 fallback')
add('cache_v2140',"const CACHE='swarm-rift-v2.14.0';" in sw,'swarm-rift-v2.14.0')
add('index_cache_bust','css/game.css?v=2140' in html and 'js/game.js?v=2140' in html,'?v=2140')

# data blocks
pblock=s[s.index('const POWERS={'):s.index('const POWER_KEYS=')]
power_count=pblock.count(':{name:')
add('powers_24',power_count==24,power_count)
newpowers=['phase','nanites','riftmine','echo','nova']
add('five_new_powers',all(f"{k}:{{name:" in pblock for k in newpowers),','.join(newpowers))
add('new_power_mechanics',all(('function '+f) in s for f in ['phaseLance','nanitePulse','deployRiftMine','detonateRiftMine','updatePowerMines','temporalEchoVolley','entomicNova']), '7 mechanics')
add('physical_rift_mines','drawPowerMines();' in s and 'G.powerMines' in s,'persistent arena mines')
add('active_slots_base_3','const POWER_SLOT_LIMIT=3;' in s,'3')
add('active_slots_max_4',"POWER_SLOT_LIMIT+Math.min(1,up('powerbay'))" in s,'4 via powerbay')
add('queue_base_4','const POWER_QUEUE_LIMIT=4;' in s,'4')
add('queue_max_6',"POWER_QUEUE_LIMIT+Math.min(2,up('reservebay'))" in s,'6 via reservebay')
add('ranks_I_VII',"['I','II','III','IV','V','VI','VII']" in s,'I–VII')
add('evolution_labels',"'OMEGA':rank>=6?'ASCENDIDO'" in s,'VI ASCENDIDO / VII OMEGA')
add('evolution_traits','function powerEvolutionTrait' in s and 'PENTA-RIEL' in s and 'NONA SALVA' in s,'mechanical/visual traits')
add('hangar_evolution_tab',"['evolution','◇ EVOL.']" in s,'EVOL.')
for upg in ['powerbay','reservebay','evolution','reactor']:
    add('upgrade_'+upg, f"id:'{upg}'" in s, upg)
add('reactor_duration',"(1+up('reactor')*.05)" in s,'up to +25% duration')
new_combo_names=['LANZA HIPERLINEAL','PLAGA AUTÓNOMA','POZO DE MINAS','ECO TRIDENTE','CATEDRAL NOVA','SIMBIOSIS REPARADORA']
add('six_new_combos',all(x in s for x in new_combo_names),','.join(new_combo_names))
add('drop_budget_increased',"return runDifficultyKey()==='hard'?7:6;" in s,'6 normal / 7 hard')
add('hud_all_active',"slice(0,G.maxActivePowers||activePowerSlotLimit())" in s,'dynamic active slots')
add('hud_queue_six',"slice(0,G.maxQueuePowers||queuedPowerSlotLimit())" in s,'dynamic queue slots')

# 10-world chapter I invariant
start=s.index('const SECTORS='); end=s.index('];',start)+2
sector_block=s[start:end]
worlds=sector_block.count('family:'); bosses=sector_block.count('boss:')
add('worlds_10',worlds==10,worlds); add('bosses_10',bosses==10,bosses)
add('chapter_II_not_started',worlds==10 and '20 sectores planificados' in (ROOT/'README.txt').read_text(encoding='utf-8'),'10 active / 20 planned')

# boss 6-10 final assets + animation states
bosses_cfg={
 'colossus':('boss_colossus_hop_final.png',['idle','attack','hurt','phase','death']),
 'sanguina':('boss_sanguina_prime_final.png',['idle','attack','hurt','phase','death']),
 'architect':('boss_architect_zero_final.png',['idle','attack','hurt','phase','death']),
 'auralis':('boss_auralis_final.png',['idle','attack','hurt','phase','death']),
 'resonator':('boss_resonator_omega_final.png',['idle','attack','hurt','phase','death']),
}
for key,(asset,states) in bosses_cfg.items():
    finalp=ROOT/'assets/boss_final_v2137'/asset
    state_ok=all((ROOT/'assets/boss_anim'/key/f'{st}.png').exists() for st in states)
    add(f'boss_{key}_final_asset',finalp.exists() and asset in s,asset)
    add(f'boss_{key}_five_states',state_ok,','.join(states))

# systems retained
for name,needles in {
 'boss_rush':['bossRush','BOSS RUSH'],
 'chase':['mode===\'chase\'','CHASE'],
 'lieutenants':['lieutenantQueue','Commander'],
 'combat_director':['updateCombatDirector','directorProfile'],
 'wave_objectives':['waveObjective','prepareWaveObjective'],
 'reward_ledger':['rewardLedger','grantRewardXp'],
 'adaptive_audio':['PlaylistX','MusicX','currentTime'],
 'responsive':['compactUI','mobileUI','portraitUI'],
}.items(): add('retained_'+name,all(n in s for n in needles),'/'.join(needles))

# PWA precache integrity
m=re.search(r'const ASSETS=(\[.*?\]);\n',sw,re.S)
assets=json.loads(m.group(1)) if m else []
missing=[]
for a in assets:
    if a.startswith('http'): continue
    path=a.split('?',1)[0]
    if path in ('.','./'): path='./index.html'
    if path.startswith('./'): path=path[2:]
    if not (ROOT/path).exists(): missing.append(a)
add('pwa_asset_manifest',bool(assets),len(assets))
add('pwa_resources_exist',len(missing)==0,f'{len(assets)} assets / {len(missing)} missing')
newicons=[f'./assets/powers_hangar/{n}?av=2140' for n in ['phase_lance.png','nanite_swarm.png','rift_mine.png','temporal_echo.png','entomic_nova.png']]
add('new_icons_precached',all(x in assets for x in newicons),'5/5')

# status hook
add('diagnostic_hook','window.__SWARM_V2140_HANGAR_STATUS' in s,'available')

# headless browser note from environment
report['limitations'].append('Chromium headless did not complete startup within the controlled timeout in this container, so full interactive browser gameplay was not falsely marked as passed. Static syntax, resource, HTTP and structural checks were used instead; device/browser playtest remains recommended.')

passed=sum(1 for v in report['checks'].values() if v['ok']); total=len(report['checks'])
report['summary']={'passed':passed,'total':total,'all_passed':passed==total}
(ROOT/'AUTOAUDIT_v2.14.0.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['SWARM//RIFT — INSECTA SIEGE v2.14.0 · AUTOAUDITORÍA','='*62,f'PASS {passed}/{total}','']
for k,v in report['checks'].items(): lines.append(f"[{'PASS' if v['ok'] else 'FAIL'}] {k}: {v['detail']}")
lines+=['','LIMITACIONES']+[f'- {x}' for x in report['limitations']]
(ROOT/'AUTOAUDIT_v2.14.0.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(report['summary']))
if passed!=total: raise SystemExit(2)
