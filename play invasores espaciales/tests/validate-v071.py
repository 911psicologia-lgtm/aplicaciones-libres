from pathlib import Path
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
EXPECTED_ASSET_AUDIO='5cb8226fbc528eb670a41d8846a714538076c293c77af2c139cf81b78c189847'
EXPECTED_ECONOMY='cbca517e6d3a5ddddad8693fc7920bea6f9083c75c1db7a1fba013f3031e28dd'
def tree_hash():
    h=hashlib.sha256()
    for base in ('assets','audio'):
        for p in sorted((ROOT/base).rglob('*')):
            if p.is_file():
                h.update(p.relative_to(ROOT).as_posix().encode()+b'\0')
                h.update(hashlib.sha256(p.read_bytes()).digest())
    return h.hexdigest()
def check(cond,msg):
    if not cond: raise AssertionError(msg)
for p in sorted((ROOT/'js').glob('*.js'))+[ROOT/'sw.js']:
    subprocess.run(['node','--check',str(p)],check=True,stdout=subprocess.DEVNULL)
html=(ROOT/'index.html').read_text(encoding='utf-8')
for ref in re.findall(r'(?:src|href)="([^"]+)"',html):
    if ref.startswith(('http:','https:','#','data:')): continue
    check((ROOT/ref).exists(),f'missing index reference: {ref}')
manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
check(manifest.get('display')=='fullscreen','manifest display must be fullscreen')
for icon in manifest.get('icons',[]): check((ROOT/icon['src'].lstrip('./')).exists(),f'missing PWA icon {icon["src"]}')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
check('starfall-shell-v0.7.5' in sw,'wrong service worker cache version')
check('js/reactive_matrix.js' in sw,'reactive matrix missing from PWA shell')
check(tree_hash()==EXPECTED_ASSET_AUDIO,'assets/audio tree changed from stable trunk')
check(hashlib.sha256((ROOT/'js/economy.js').read_bytes()).hexdigest()==EXPECTED_ECONOMY,'economy.js changed from stable trunk')
cfg=(ROOT/'js/config.js').read_text(encoding='utf-8')
check("VERSION: '0.7.5'" in cfg,'wrong app version')
check("mode: 'assist'" in cfg,'Reactive Matrix assist mode lost')
check('battleRhythm:' in cfg and 'subbossRhythm:' in cfg and 'desperation:' in cfg,'new encounter configs missing')
check('id="tacticalBelt"' in html,'tactical belt missing')
game=(ROOT/'js/game.js').read_text(encoding='utf-8')
for token in ('updateBossCounterWindow','mutateBossSignature','shootSubbossBasic','updateFormationDesperation','triggerKamikazeChain'):
    check(token in game,f'missing runtime: {token}')
check('signaturePending' in game and 'signatureWindupUntil' in game,'boss signature telegraph missing')
check('const primaryRealistic=!!(wbg && C.worldFamilies?.realisticPrimary)' in game,'realistic backgrounds still restricted')
check('normalizedFamilyWorldId(G.sector)' in game,'normalized family visual mapping missing')
print('VALIDATION v0.7.5 PASS')
print('asset_audio_tree_sha256',tree_hash())
print('economy_js_sha256',hashlib.sha256((ROOT/'js/economy.js').read_bytes()).hexdigest())
print('pwa_manifest',manifest['name'],manifest['display'])
