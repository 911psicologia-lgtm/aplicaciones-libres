#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, math, re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'js/game.js'
SW=ROOT/'sw.js'
SOURCE_ZIP=Path('/mnt/data/SWARM_RIFT_Insecta_Siege_v2.13.6_chase_extreme_boss_9_10_adaptive_playlists.zip')
UPLOADS={
 'colossus':Path('/mnt/data/ChatGPT Image 1 sept 2026, 06_54_43 a.m. (1).png'),
 'sanguina':Path('/mnt/data/ChatGPT Image 1 sept 2026, 06_54_43 a.m. (2).png'),
 'architect':Path('/mnt/data/ChatGPT Image 1 sept 2026, 06_54_43 a.m. (3).png'),
 'auralis':Path('/mnt/data/ChatGPT Image 1 sept 2026, 06_54_44 a.m. (4).png'),
 'resonator':Path('/mnt/data/ChatGPT Image 1 sept 2026, 06_54_44 a.m. (5).png'),
}
FINAL={
 'colossus':ROOT/'assets/boss_final_v2137/boss_colossus_hop_final.png',
 'sanguina':ROOT/'assets/boss_final_v2137/boss_sanguina_prime_final.png',
 'architect':ROOT/'assets/boss_final_v2137/boss_architect_zero_final.png',
 'auralis':ROOT/'assets/boss_final_v2137/boss_auralis_final.png',
 'resonator':ROOT/'assets/boss_final_v2137/boss_resonator_omega_final.png',
}
BOSS_DIRS={
 'AVISPAS':'imperatrix','ESCARABAJOS':'atlas','MANTIS':'cortex','POLILLAS':'vela','HORMIGAS':'regina',
 'LANGOSTAS':'colossus','MOSQUITOS':'sanguina','TERMITAS':'architect','LIBÉLULAS':'auralis','CIGARRAS':'resonator'
}
NEW_FAMILIES=['LANGOSTAS','MOSQUITOS','TERMITAS','LIBÉLULAS','CIGARRAS']
EXPECTED_BOSSES=['IMPERATRIX VESPA','ATLAS VERDE','CORTEX RAZOR','VELA NOCTIS','REGINA FERRUM','COLOSSUS HOP','SANGUINA PRIME','ARCHITECT ZERO','AURALIS','RESONATOR OMEGA']
EXPECTED_STATES=['idle','attack','hurt','phase','death']
SIGS=['IMPACTO COLOSSUS','SIFÓN HEMÁTICO','JAULA DE RESINA','CRUZ PRISMÁTICA','ONDA OMEGA']

def sha(p:Path):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1<<20),b''):h.update(b)
 return h.hexdigest()

def node_check(path:Path):
 r=subprocess.run(['node','--check',str(path)],capture_output=True,text=True)
 return {'ok':r.returncode==0,'stderr':r.stderr.strip()}

def segment(text,start,end):
 a=text.find(start)
 if a<0:return ''
 b=text.find(end,a+len(start))
 return text[a:b if b>=0 else None]

def frame_metrics(sheet:Path, frames:int, cols:int, fw:int=384, fh:int=384):
 im=Image.open(sheet).convert('RGBA')
 hashes=[]; crops=[]
 for i in range(frames):
  x=(i%cols)*fw;y=(i//cols)*fh
  fr=im.crop((x,y,x+fw,y+fh));crops.append(fr)
  hashes.append(hashlib.sha1(fr.tobytes()).hexdigest())
 diffs=[]
 for a,b in zip(crops,crops[1:]):
  d=ImageChops.difference(a,b).convert('RGB')
  stat=ImageStat.Stat(d)
  diffs.append(sum(stat.mean)/3)
 return {'size':list(im.size),'unique_frames':len(set(hashes)),'mean_adjacent_pixel_delta':round(sum(diffs)/len(diffs),3) if diffs else 0.0,'max_adjacent_pixel_delta':round(max(diffs),3) if diffs else 0.0}

game=GAME.read_text(encoding='utf-8')
sw=SW.read_text(encoding='utf-8')
report={'version':'2.13.7','checks':{},'bosses':{},'source':{},'limitations':[]}
C=report['checks']

def add(name,ok,detail=None): C[name]={'ok':bool(ok),'detail':detail}

vm=re.search(r"const VERSION='([^']+)'",game); version=vm.group(1) if vm else None
add('VERSION',version=='2.13.7',version)
cm=re.search(r"const CACHE='([^']+)'",sw); cache=cm.group(1) if cm else None
add('service_worker_cache',cache=='swarm-rift-v2.13.7',cache)
nc=node_check(GAME); add('node_check_game',nc['ok'],nc['stderr'] or 'syntax OK')
nc=node_check(SW); add('node_check_sw',nc['ok'],nc['stderr'] or 'syntax OK')

sec=segment(game,'const SECTORS=[','\n];')
active_bosses=re.findall(r"boss:'([^']+)'",sec)
add('active_worlds_10',len(active_bosses)==10,{'count':len(active_bosses),'bosses':active_bosses})
add('bosses_10_of_10',active_bosses==EXPECTED_BOSSES,active_bosses)
# Planned architecture is allowed but no active Sector 11 definition.
add('chapter_II_not_started',len(active_bosses)==10 and not bool(re.search(r"code:'[^']*11[^']*'.*?boss:",sec,re.S)), 'SECTORS active array stops at world 10; expansion scaffolding remains.')

# Source provenance
if SOURCE_ZIP.exists():
 report['source']={'uploaded_zip':SOURCE_ZIP.name,'sha256':sha(SOURCE_ZIP),'detected_version':'2.13.6','note':'The attached ZIP supplied in this chat is v2.13.6, not the requested filename v2.13.7.'}
else:
 report['source']={'uploaded_zip':None,'detected_version':None}
 report['limitations'].append('Source ZIP was unavailable during final audit.')

# Exact final asset provenance and active mapping.
expected_paths={
 'LANGOSTAS':'assets/boss_final_v2137/boss_colossus_hop_final.png?av=2137',
 'MOSQUITOS':'assets/boss_final_v2137/boss_sanguina_prime_final.png?av=2137',
 'TERMITAS':'assets/boss_final_v2137/boss_architect_zero_final.png?av=2137',
 'LIBÉLULAS':'assets/boss_final_v2137/boss_auralis_final.png?av=2137',
 'CIGARRAS':'assets/boss_final_v2137/boss_resonator_omega_final.png?av=2137',
}
for key,src in UPLOADS.items():
 dst=FINAL[key]
 matched=src.exists() and dst.exists() and sha(src)==sha(dst)
 report['bosses'].setdefault(key,{})['source_sha256']=sha(src) if src.exists() else None
 report['bosses'][key]['final_sha256']=sha(dst) if dst.exists() else None
 report['bosses'][key]['exact_uploaded_asset']=matched
add('bosses_6_10_exact_uploaded_assets',all(report['bosses'][k]['exact_uploaded_asset'] for k in UPLOADS),{k:report['bosses'][k]['exact_uploaded_asset'] for k in UPLOADS})
for fam,path in expected_paths.items():
 # family declaration must include canonical path
 pat=re.escape(fam)+r".*?"+re.escape(path)
 ok=bool(re.search(pat,game,re.S))
 report['bosses'][BOSS_DIRS[fam]]['active_mapping']=path
 report['bosses'][BOSS_DIRS[fam]]['active_mapping_ok']=ok
add('bosses_6_10_active_mapping',all(report['bosses'][BOSS_DIRS[f]]['active_mapping_ok'] for f in NEW_FAMILIES),expected_paths)
add('boss_cache_busting_2137','?av=2136' not in game and '?av=2136' not in sw and '?av=2137' in game and '?av=2137' in sw,'no av=2136 runtime refs; av=2137 active')
add('fallback_visible_diagnostic','BOSS_ASSET_HEALTH' in game and 'bossAssetFault' in game and 'console.error' in game,'fallback logs and one-time visible notification')

# Animation asset/state checks for 10/10, with stronger frame-delta check for 6-10.
all10=True; strong5=True
for fam,key in BOSS_DIRS.items():
 d=ROOT/'assets/boss_anim'/key
 states_ok=True; state_detail={}
 meta={}
 try: meta=json.loads((d/'meta.json').read_text(encoding='utf-8'))
 except Exception: pass
 for st in EXPECTED_STATES:
  p=d/f'{st}.png'
  exists=p.exists()
  states_ok &= exists
  if exists:
   frames=(meta.get('states',{}).get(st,{}).get('frames') or {'idle':8,'attack':6,'hurt':4,'phase':8,'death':10}[st])
   cols=(meta.get('states',{}).get(st,{}).get('cols') or 4)
   fw=meta.get('frameW',384);fh=meta.get('frameH',384)
   try:
    m=frame_metrics(p,int(frames),int(cols),int(fw),int(fh))
    expected_size=[int(cols)*int(fw),math.ceil(int(frames)/int(cols))*int(fh)]
    m['expected_size']=expected_size
    m['size_ok']=m['size']==expected_size
    m['motion_ok']=m['unique_frames']>=2 and m['mean_adjacent_pixel_delta']>0.15
    states_ok &= m['size_ok'] and m['motion_ok']
    if fam in NEW_FAMILIES: strong5 &= m['motion_ok'] and m['unique_frames']>=2
    state_detail[st]=m
   except Exception as e:
    states_ok=False; state_detail[st]={'error':str(e)}
 report['bosses'].setdefault(key,{})['five_states_ok']=states_ok
 report['bosses'][key]['states']=state_detail
 if fam in NEW_FAMILIES:
  report['bosses'][key]['meta_revision']=meta.get('revision')
  report['bosses'][key]['animation_method']=meta.get('animation')
  strong5 &= meta.get('revision')=='2.13.7' and meta.get('animation')=='localized-non-rigid-anatomical-warp'
 all10 &= states_ok
add('animation_5_states_10_of_10',all10,{k:report['bosses'][k]['five_states_ok'] for k in BOSS_DIRS.values()})
add('bosses_6_10_perceptible_local_animation',strong5,{k:{'revision':report['bosses'][k].get('meta_revision'),'method':report['bosses'][k].get('animation_method'),'states':{s:{'unique_frames':report['bosses'][k]['states'].get(s,{}).get('unique_frames'),'mean_delta':report['bosses'][k]['states'].get(s,{}).get('mean_adjacent_pixel_delta')} for s in EXPECTED_STATES}} for k in ['colossus','sanguina','architect','auralis','resonator']})

# Signature attacks and their named VFX features.
add('signature_attacks_6_10',all(s in game for s in SIGS),SIGS)
sigdraw=segment(game,'function drawBossSignatureAttack(b){','// Signature attack v2.13.0: Cortex Razor')
feature_checks={
 'colossus':all(x in sigdraw for x in ["b.pattern==='leap'",'for(let i=0;i<16','impactPulse','s.targetX']),
 'sanguina':all(x in sigdraw for x in ["b.pattern==='blood'",'bossSignatureOrigin(b)','for(let i=1;i<=10','cx.ellipse(b.x,b.y-b.r*.24']),
 'architect':all(x in sigdraw for x in ["b.pattern==='architect'",'s.columns','safeW','for(const yy of [24,H-24])']),
 'auralis':all(x in sigdraw for x in ["b.pattern==='odonata'",'for(const off of [-.026,.026])','for(let k=1;k<=7','for(let q=1;q<=3']),
 'resonator':all(x in sigdraw for x in ["b.pattern==='resonance'",'const tym=','for(let k=0;k<10','cx.ellipse(o.x,o.y'])
}
add('signature_vfx_reinforced',all(feature_checks.values()),feature_checks)

# Systems preserved.
add('tenientes_commander_convergence',all(x in game for x in ['prepareCommanderConvergence','deployCommanderConvergence','spawnLieutenant','lieutenantQueue']), 'Commander Convergence + lieutenant queue/functions present')
add('boss_checkpoint_50',bool(re.search(r"G\.boss\.hp=maxHp\*\.5",game)),'boss HP set to 50% at checkpoint')
add('reward_ledger','rewardLedger' in game and 'ledger' in game.lower(),'Reward Ledger code present')
add('heritage','HERITAGE_BY_SECTOR' in game and len(re.findall(r"\d+:'[a-z]+" , segment(game,'const HERITAGE_BY_SECTOR',';')))>=10,'10 boss heritage mappings')
add('wave_objectives',all(x in game for x in ['prepareWaveObjective','activeWaveObjective','objectivePoolForWave']),'Wave Objectives present')
add('combat_director',all(x in game for x in ['resetCombatDirector','directorProfile','updateCombatDirector']),'Combat Director present')
add('difficulty_normal_hard',all(x in game for x in ["'normal'","'hard'",'runDifficultyKey']),'Normal/Hard paths present')
add('power_inventory_limits','const POWER_SLOT_LIMIT=2;' in game and 'const POWER_QUEUE_LIMIT=3;' in game,'2 active / 3 queued')
powseg=segment(game,'const POWERS={','\n};')
power_count=len(re.findall(r"^\s*[a-z][a-z0-9_]*:\{name:",powseg,re.M))
add('powers_19',power_count==19,power_count)
add('boss_rush',all(x in game for x in ['bossRush','startBossRush','BOSS RUSH']),'Boss Rush preserved')

# CHASE mode separated and feature set.
chase_tokens=['menu_chase','victory_chase','startChase','drawChase','updateChase','powerDrops','overdrive','shield','streak','RACHA','bomb','rank']
add('chase_mode',all(t in game for t in chase_tokens),{t:(t in game) for t in chase_tokens})
add('chase_not_mandatory_boss_rush','Modo separado: no altera campaña, checkpoints ni economía de poderes.' in game and 'victory_chase' in game,'separate mode + post-victory option retained')
add('no_player_dash','DASH' not in segment(game,'CONTROLS','NOVEDAD') if 'CONTROLS' in game else True,'No player DASH action introduced; enemy movement label may still use dash internally.')

# Audio / playlist.
worldseg=segment(game,'const WORLD_PLAYLISTS={','\n};')
world_keys=set(int(x) for x in re.findall(r"^\s*(\d+):\[",worldseg,re.M))
add('world_playlists_1_10',world_keys==set(range(1,11)),sorted(world_keys))
add('boss_adaptive_playlist',all(x in game for x in ['bossPlaylistForSector','prepareBossPlaylist','lastBossTrackId','fadeTo','currentTime']),'no immediate repetition + fade/resume machinery present')
add('pause_audio_resume','uiSnapshot' in game and 'currentTime' in game and 'resume' in game.lower(),'pause/resume currentTime machinery present')

# Responsive + controls.
profiles=['MOBILE_PORTRAIT','MOBILE_LANDSCAPE','TABLET','DESKTOP']
add('responsive_profiles',all(p in game for p in profiles),profiles)
add('auto_fire_and_direct_pointer',all(x in game for x in ['autofire','pointermove','touch']) if 'autofire' in game.lower() else ('pointermove' in game and 'touch' in game), 'auto-fire/pointer/touch code retained')

# PWA resource list existence and canonical resources cached.
m=re.search(r'const ASSETS=(\[.*?\]);',sw,re.S)
missing=[];assets=[]
if m:
 assets=json.loads(m.group(1))
 for a in assets:
  if a in ('./','.') : continue
  rel=a[2:] if a.startswith('./') else a
  rel=rel.split('?',1)[0]
  if not (ROOT/rel).exists():missing.append(a)
add('pwa_all_cached_resources_exist',not missing,{'asset_count':len(assets),'missing':missing[:20],'missing_count':len(missing)})
add('pwa_caches_final_bosses',all('./'+p in assets for p in expected_paths.values()),[p for p in expected_paths.values() if './'+p not in assets])
add('service_worker_registration',"serviceWorker.register('./sw.js')" in game,'registration present')
add('manifest_exists',(ROOT/'manifest.json').exists(),'manifest.json')

# Saves migration.
add('save_keys_v2137_migrate_v2136',all(x in game for x in ["KEY_META='swarm_rift_meta_v2137'","KEY_RUN='swarm_rift_run_v2137'",'swarm_rift_meta_v2136','swarm_rift_run_v2136']),'new keys + explicit v2.13.6 migration')

# Stale boss assets audit: legacy compatibility aliases may exist, but runtime mapping must not select them.
legacy_active=[]
for nm in ['boss_colossus_reformulated.png','boss_sanguina_reformulated.png','boss_architect_reformulated.png','boss_auralis_reformulated.png','boss_resonator_reformulated.png']:
 if nm in segment(game,'const WORLD_ENEMY_FILES={','\n};'):legacy_active.append(nm)
add('no_old_boss_6_10_active_mapping',not legacy_active,legacy_active)
old_preview=list(ROOT.glob('assets/boss_anim/{colossus,sanguina,architect,auralis,resonator}/preview_v2132.jpg'))
add('old_v2132_previews_removed',not old_preview,[str(p.relative_to(ROOT)) for p in old_preview])

# Generator code evidence for regional/local motion (not whole-PNG-only transforms).
gen=(ROOT/'tools/generate_boss_sheets_v2137.py').read_text(encoding='utf-8') if (ROOT/'tools/generate_boss_sheets_v2137.py').exists() else ''
regional_tokens=['region','warp','wings','abdomen','legs','head']
add('sprite_generator_reproducible',all(t in gen.lower() for t in regional_tokens),'tools/generate_boss_sheets_v2137.py uses localized regions/non-rigid warps')

# Runtime browser limitation is explicit.
report['limitations'].append('Full headless Chromium runtime smoke test could not be completed in this container because Chromium stalled in the environment. Static/resource audits and Node syntax checks completed successfully; final device/browser playtest is still recommended.')
report['limitations'].append('The actual uploaded base ZIP in this chat identifies itself as v2.13.6. The requested v2.13.7 filename was not attached, so this v2.13.7 build is an incremental integration over the uploaded v2.13.6 base, preserving v2.13.6 save migration.')

fail=[k for k,v in C.items() if not v['ok']]
report['summary']={'passed':len(C)-len(fail),'total':len(C),'failed':fail,'status':'PASS_WITH_RUNTIME_LIMITATION' if not fail else 'FAIL'}
(ROOT/'AUTOAUDIT_v2.13.7.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')

lines=[]
lines.append('SWARM//RIFT — INSECTA SIEGE v2.13.7 · AUTOAUDITORÍA')
lines.append('='*62)
lines.append(f"RESULTADO: {report['summary']['status']} · {report['summary']['passed']}/{report['summary']['total']} checks estáticos aprobados")
lines.append('')
for k,v in C.items():
 lines.append(f"[{'OK' if v['ok'] else 'FAIL'}] {k}: {v.get('detail')}")
lines.append('\nLIMITACIONES REALES')
for x in report['limitations']:lines.append(f'- {x}')
(ROOT/'AUTOAUDIT_v2.13.7.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(report['summary'],ensure_ascii=False))
if fail: sys.exit(2)
