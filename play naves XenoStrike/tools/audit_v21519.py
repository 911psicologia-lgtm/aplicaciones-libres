import json,re,hashlib,zlib,zipfile,pathlib,sys,os
root=pathlib.Path(__file__).resolve().parent.parent
checks={}
# PWA asset list
sw=(root/'sw.js').read_text()
m=re.search(r'const ASSETS=(\[.*?\]);\s*self\.addEventListener',sw,re.S)
assets=json.loads(m.group(1)) if m else []
missing=[]
for a in assets:
    rel=a[2:] if a.startswith('./') else a
    rel=rel.split('?',1)[0]
    if rel in ('','.'):
        p=root
    else:
        p=root/rel
    if not p.exists(): missing.append(a)
checks['pwa_manifest_parsed']=bool(assets)
checks['pwa_assets_present']=len(missing)==0
# CH2 source manifest hashes
manifest=json.loads((root/'ASSET_MANIFEST_CH2_ZAI.json').read_text())
present=0;mismatch=[];omitted=[]
for a in manifest['assets']:
    p=root/a['path']
    if not p.exists(): omitted.append(a['path']);continue
    present+=1
    h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=a['sha256']: mismatch.append(a['path'])
expected_omitted=[f'assets_ch2/backgrounds/w{w}_{kind}.png' for w in range(11,21) for kind in ('antechamber','boss')]
checks['ch2_present_210']=present==210
checks['ch2_hashes_ok']=not mismatch
checks['ch2_expected_20_masters_omitted']=sorted(omitted)==sorted(expected_omitted)
# Preserve every runtime asset byte against stable v2.15.18 ZIP using CRC32/size
basezip=pathlib.Path('/mnt/data/SWARM_RIFT_Insecta_Siege_v2.15.18_MOBILE_COMBAT_ERGONOMICS.zip')
asset_diff=[];asset_count=0
with zipfile.ZipFile(basezip) as z:
    names=z.namelist();prefix=names[0].split('/')[0]+'/'
    for info in z.infolist():
        rel=info.filename[len(prefix):] if info.filename.startswith(prefix) else info.filename
        if not (rel.startswith('assets/') or rel.startswith('assets_ch2/')) or info.is_dir(): continue
        asset_count+=1;p=root/rel
        if not p.exists(): asset_diff.append((rel,'missing'));continue
        data=p.read_bytes();crc=zlib.crc32(data)&0xffffffff
        if len(data)!=info.file_size or crc!=info.CRC: asset_diff.append((rel,'changed'))
checks['all_runtime_assets_preserved']=not asset_diff
# Source markers
src=(root/'js/game.js').read_text();idx=(root/'index.html').read_text()
markers=['HIVE_DIRECTOR_MODE','hiveStartBossSession','hiveUpdateBossDirector','hiveFinalizeBossSession','__SWARM_V21519_STATUS','__SWARM_HIVE_SHADOW_STATUS','swarm_rift_hive_boss_telemetry_v1']
checks['hive_markers']=all(x in src for x in markers)
checks['shadow_only']=("const HIVE_DIRECTOR_MODE='shadow'" in src and 'gameplayInterventionsApplied:0' in src and 'noPowerSuppressionApplied:true' in src and 'noResurrectionApplied:true' in src)
checks['migration_21518']=("loadJSON('swarm_rift_meta_v21518'" in src and "loadJSON('swarm_rift_run_v21518'" in src and "localStorage.getItem('swarm_rift_run_v21518')" in src)
checks['cache_bust_21519']='game.js?v=21519' in idx and 'game.css?v=21519' in idx and "swarm-rift-v2.15.19" in sw
checks['preserve_core']=all(x in src for x in ['function startBossRush','function deployCommanderConvergence','function spawnMicroSwarm','function summonRiftAlly','function beginLastChance','function performanceGovernorTick','function streamPrepareWorld','const COMBOS=','const POWERS='])
result={'ok':all(checks.values()),'checks':checks,'pwaAssetCount':len(assets),'pwaMissing':missing,'ch2ManifestCount':len(manifest['assets']),'ch2Present':present,'ch2Mismatch':mismatch,'ch2Omitted':omitted,'runtimeAssetCountCompared':asset_count,'runtimeAssetDiff':asset_diff}
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(0 if result['ok'] else 3)
