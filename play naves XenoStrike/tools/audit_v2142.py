from pathlib import Path
import re, json, subprocess, threading, http.server, socketserver, urllib.request, os, time
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
S=(ROOT/'js/game.js').read_text(encoding='utf-8')
SW=(ROOT/'sw.js').read_text(encoding='utf-8')
IDX=(ROOT/'index.html').read_text(encoding='utf-8')
MAN=(ROOT/'manifest.json').read_text(encoding='utf-8')
checks=[]
details={}
limitations=[]
def add(name,ok,detail=''):
    checks.append({'name':name,'pass':bool(ok),'detail':str(detail)})

# Syntax
for f in ['js/game.js','sw.js']:
    p=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
    add(f'node --check {f}',p.returncode==0,(p.stderr or p.stdout).strip() or 'PASS')

# Version and cache
add('VERSION 2.14.2',"const VERSION='2.14.2';" in S,'2.14.2')
add('META key v2142',"KEY_META='swarm_rift_meta_v2142'" in S,'swarm_rift_meta_v2142')
add('RUN key v2142',"KEY_RUN='swarm_rift_run_v2142'" in S,'swarm_rift_run_v2142')
add('META migration v2141',"loadJSON('swarm_rift_meta_v2141',null)" in S,'immediate prior meta')
add('RUN migration v2141',"loadJSON('swarm_rift_run_v2141',null)" in S and "localStorage.getItem('swarm_rift_run_v2141')" in S,'load + hasSave')
add('Service Worker v2.14.2',"const CACHE='swarm-rift-v2.14.2';" in SW,'swarm-rift-v2.14.2')
add('index cache bust 2142','js/game.js?v=2142' in IDX and 'css/game.css?v=2142' in IDX,'JS/CSS 2142')
add('power asset bust 2142',"assets/powers_hangar/${file}?av=2142" in S and 'powers_hangar/phase_lance.png?av=2142' in SW,'powers_hangar av=2142')

# Chapter I content
m=re.search(r'const SECTORS=\[(.*?)\n\];',S,re.S)
sector_count=len(re.findall(r"^\s*\{code:'",m.group(1),re.M)) if m else 0
add('10 worlds active',sector_count==10,sector_count)
add('Chapter II not started','chapterIIStarted:false' in S and sector_count==10,'diagnostic false + 10 SECTORS')

# Powers / branches
m=re.search(r'const POWERS=\{(.*?)\n\};\nconst POWER_KEYS',S,re.S)
power_keys=re.findall(r'^\s*([A-Za-z_]\w*)\s*:\s*\{name:',m.group(1),re.M) if m else []
add('24 powers',len(power_keys)==24,len(power_keys))
m=re.search(r'const POWER_BRANCHES=\{(.*?)\n\};\nfunction powerBranch',S,re.S)
branch_keys=re.findall(r'^\s*([A-Za-z_]\w*)\s*:\s*\{A:',m.group(1),re.M) if m else []
add('18 A/B branch powers',len(branch_keys)==18,len(branch_keys))
add('4 active powers base','const POWER_SLOT_LIMIT=4;' in S,'4')
add('5 active powers max','POWER_SLOT_LIMIT+Math.min(1,up(\'powerbay\'))' in S,'4+1')
add('5 queue base','const POWER_QUEUE_LIMIT=5;' in S,'5')
add('7 queue max','POWER_QUEUE_LIMIT+Math.min(2,up(\'reservebay\'))' in S,'5+2')
add('drop budget 7/8',"return runDifficultyKey()==='hard'?8:7" in S,'Normal 7 / Hard 8')
add('adaptive drop director','function smartDropScore(key)' in S and 'function pickPowerDrop()' in S,'context-weighted')
add('world-focus drop weighting','POWER_WORLD_FOCUS' in S and 'smartDropScore' in S,'world focus')
add('combo completion weighting','Object.keys(COMBOS)' in S[S.find('function smartDropScore'):S.find('function pickPowerDrop')] and 'score+=30' in S[S.find('function smartDropScore'):S.find('function pickPowerDrop')],'combo-aware')
add('visual DNA helper','function powerVisual(key' in S and 'function stampPowerProjectile' in S,'branch/rank visual metadata')
add('visual rank tags','function powerVisualTag' in S and "omega?'Ω'" in S,'A/B + VI/VII')
add('Ascended/Omega VFX','function powerActivationVfx' in S and 'if(v.ascended)' in S and 'if(v.omega)' in S,'VI/VII visual escalation')
add('synergy upgrade',"id:'synergy'" in S and 'function synergyDamageMult()' in S,'Núcleo de sinergia Σ')
add('recycler upgrade',"id:'recycler'" in S and 'function recycleOverflowPower' in S,'Reciclador de exceso ♻')
add('overflow pickup recycle','recycleOverflowPower(key,rank)' in S,'active+queue overflow conversion')
add('Hangar diagnostic v2142','__SWARM_V2142_HANGAR_STATUS' in S,'runtime status hook')

# Bosses
m=re.search(r'const BOSS_ANIMATIONS=\{(.*?)\n\};\nfunction bossAnimConfig',S,re.S)
boss_keys=re.findall(r"(?:^\s*([A-ZÁÉÍÓÚÜÑ]+)|^\s*'([^']+)')\s*:\{key:'([^']+)'",m.group(1),re.M) if m else []
boss_dirs=[x[2] for x in boss_keys]
add('10 boss animation definitions',len(boss_dirs)==10,len(boss_dirs))
state_names=['idle','attack','hurt','phase','death']
missing_states=[]
for key in boss_dirs:
    for st in state_names:
        if not (ROOT/f'assets/boss_anim/{key}/{st}.png').exists(): missing_states.append(f'{key}/{st}')
add('10 bosses x 5 state sprite files',len(missing_states)==0,f'{len(boss_dirs)*5-len(missing_states)}/{len(boss_dirs)*5}' if boss_dirs else '0')
for name,key in [('M6 Colossus','colossus'),('M7 Sanguina','sanguina'),('M8 Architect','architect'),('M9 Auralis','auralis'),('M10 Resonator','resonator')]:
    ok=all((ROOT/f'assets/boss_anim/{key}/{st}.png').exists() for st in state_names)
    add(f'{name} 5 animation states',ok,','.join(state_names))
final_assets={
 'Colossus':'assets/boss_final_v2137/boss_colossus_hop_final.png',
 'Sanguina':'assets/boss_final_v2137/boss_sanguina_prime_final.png',
 'Architect':'assets/boss_final_v2137/boss_architect_zero_final.png',
 'Auralis':'assets/boss_final_v2137/boss_auralis_final.png',
 'Resonator':'assets/boss_final_v2137/boss_resonator_omega_final.png'}
add('bosses 6–10 final assets present',all((ROOT/p).exists() and p in S for p in final_assets.values()),'5/5 final assets referenced')
for sig in ['IMPACTO COLOSSUS','SIFÓN HEMÁTICO','JAULA DE RESINA','CRUZ PRISMÁTICA','ONDA OMEGA']:
    add(f'signature {sig}',sig in S,sig)
add('boss three-phase logic','phase===3' in S and 'b.phase>=2' in S,'phase 1/2/3 paths present')
add('boss asset fallback visible','bossAssetFault' in S and 'console.error(`[SWARM//RIFT] Boss asset fallback' in S,'non-silent fallback')

# Closed systems
add('CHASE separate mode','function startChaseBonus' in S and "newRun(1,'chase','normal')" in S and 'menu_chase' in S,'menu mode')
add('CHASE X/Y + reticle','reticleX' in S and 'reticleY' in S and 'shipX' in S and 'shipY' in S,'rear-view free movement')
add('CHASE physical shootable powers','chaseCollectPower' in S and 'powerDrops' in S,'physical pickups')
add('Boss Rush','bossRush' in S and 'BOSS RUSH' in S,'preserved')
add('Commander Convergence','prepareCommanderConvergence' in S and 'deployCommanderConvergence' in S,'preserved')
add('Lieutenants',"kind==='lieutenant'" in S and 'spawnLieutenant' in S,'preserved')
add('Wave Objectives','waveObjective' in S and 'objectivePoolForWave' in S,'preserved')
add('Combat Director','directorProfile' in S and 'directorPhase' in S,'preserved')
add('Reward Ledger','ensureRewardLedger' in S and 'rewardLedger' in S,'preserved')
add('boss checkpoint 50%','bossCheckpoint' in S and 'G.boss.hp=maxHp*.5' in S,'50%')
add('responsive profiles',all(x in S for x in ['MOBILE_PORTRAIT','MOBILE_LANDSCAPE','TABLET','DESKTOP']),'4 profiles')
add('Music Director playlists','WORLD_PLAYLISTS' in S and 'BOSS_PLAYLIST_IDS' in S and 'bossPlaylist' in S and 'currentTime' in S and 'fadeTo' in S,'world+boss playlists/fade/resume')
add('PWA manifest link','rel="manifest"' in IDX and (ROOT/'manifest.json').exists(),'manifest.json')
add('PWA service worker registration','serviceWorker' in S and "register('./sw.js')" in S,'sw.js')

# PWA resource integrity
assets=[]
try:
    am=re.search(r'const ASSETS=(\[.*?\]);',SW,re.S)
    assets=json.loads(am.group(1)) if am else []
except Exception as e:
    details['assets_parse_error']=repr(e)
missing=[]
for a in assets:
    if a=='./': continue
    path=urlsplit(a).path
    if path.startswith('./'): path=path[2:]
    if path and not (ROOT/path).exists(): missing.append(path)
add('PWA asset list parsed',len(assets)>0,len(assets))
add('PWA resources all present',len(missing)==0,f'{len(assets)} resources · {len(missing)} missing')
details['pwa_assets_count']=len(assets)
details['pwa_missing']=missing[:50]

# HTTP smoke
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass
old=os.getcwd(); os.chdir(ROOT)
server=None
smoke={}
try:
    server=socketserver.TCPServer(('127.0.0.1',0),Quiet)
    port=server.server_address[1]
    t=threading.Thread(target=server.serve_forever,daemon=True);t.start();time.sleep(.1)
    paths=['index.html','js/game.js?v=2142','sw.js','assets/powers_hangar/phase_lance.png?av=2142','assets/boss_final_v2137/boss_auralis_final.png?av=2137','assets/boss_anim/resonator/attack.png?av=2137','assets/music/boss_10_end_of_stars.mp3']
    for pth in paths:
        try:
            req=urllib.request.Request(f'http://127.0.0.1:{port}/{pth}',method='HEAD')
            with urllib.request.urlopen(req,timeout=5) as r: smoke[pth]=r.status
        except Exception as e: smoke[pth]=repr(e)
finally:
    if server: server.shutdown();server.server_close()
    os.chdir(old)
add('HTTP smoke critical resources',all(v==200 for v in smoke.values()),smoke)
details['http_smoke']=smoke

# Browser limitation documented
limitations.append('Chromium headless está instalado, pero la política administrativa del entorno bloquea la navegación tanto a localhost como a file:// (ERR_BLOCKED_BY_ADMINISTRATOR). Por ello no se marca una prueba interactiva automatizada como PASS; la validación realizada es sintáctica, estructural, de recursos y smoke HTTP.')

passed=sum(c['pass'] for c in checks); total=len(checks)
report={'version':'2.14.2','passed':passed,'total':total,'checks':checks,'details':details,'limitations':limitations}
(ROOT/'AUTOAUDIT_v2.14.2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['SWARM//RIFT — INSECTA SIEGE v2.14.2 · AUTOAUDITORÍA','='*66,f'PASS {passed}/{total}','']
for c in checks: lines.append(f"[{'PASS' if c['pass'] else 'FAIL'}] {c['name']} · {c['detail']}")
lines+=['','LIMITACIONES REALES']+[f'- {x}' for x in limitations]
(ROOT/'AUTOAUDIT_v2.14.2.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'PASS {passed}/{total}')
for c in checks:
    if not c['pass']: print('FAIL',c['name'],c['detail'])
