from pathlib import Path
import hashlib,json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
EXPECTED_ASSET_AUDIO='5cb8226fbc528eb670a41d8846a714538076c293c77af2c139cf81b78c189847'
EXPECTED_ECONOMY='f6af1f548aa105f21b7544092dd73bf189bb442226a26d327b1e18f7db217441'

def tree_hash():
    h=hashlib.sha256()
    for base in ('assets','audio'):
        for p in sorted((ROOT/base).rglob('*')):
            if p.is_file():
                h.update(p.relative_to(ROOT).as_posix().encode()+b'\0')
                h.update(hashlib.sha256(p.read_bytes()).digest())
    return h.hexdigest()

def assert_(cond,msg):
    if not cond: raise AssertionError(msg)

# JS syntax
for p in sorted((ROOT/'js').glob('*.js'))+[ROOT/'sw.js']:
    subprocess.run(['node','--check',str(p)],check=True,stdout=subprocess.DEVNULL)

# Index references
html=(ROOT/'index.html').read_text(encoding='utf-8')
refs=re.findall(r'(?:src|href)="([^"]+)"',html)
for ref in refs:
    if ref.startswith(('http:','https:','#','data:')): continue
    assert_((ROOT/ref).exists(),f'missing index reference: {ref}')
assert_('js/reactive_matrix.js' in html,'reactive matrix script not loaded')
assert_('manifest.webmanifest' in html,'PWA manifest not linked')

# PWA manifest + SW shell
manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
assert_(manifest.get('display')=='fullscreen','manifest display must be fullscreen')
for icon in manifest.get('icons',[]): assert_((ROOT/icon['src'].lstrip('./')).exists(),f'missing PWA icon {icon["src"]}')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
assert_('starfall-shell-v0.6.1' in sw,'wrong service worker cache version')
assert_('js/reactive_matrix.js' in sw,'reactive matrix missing from PWA shell')

# Runtime asset references
for jsname in ('js/assets.js','js/world_content.js'):
    txt=(ROOT/jsname).read_text(encoding='utf-8')
    paths=set(re.findall(r"['\"]((?:assets|audio)/[^'\"]+?)['\"]",txt))
    missing=[x for x in paths if not (ROOT/x).exists()]
    assert_(not missing,f'{jsname} missing refs: {missing[:5]}')

# Critical no-regression hashes
assert_(tree_hash()==EXPECTED_ASSET_AUDIO,'assets/audio tree changed from stable v0.6.0')
assert_(hashlib.sha256((ROOT/'js/economy.js').read_bytes()).hexdigest()==EXPECTED_ECONOMY,'economy.js changed from stable v0.6.0')

# Shadow semantics
cfg=(ROOT/'js/config.js').read_text(encoding='utf-8')
mx=(ROOT/'js/reactive_matrix.js').read_text(encoding='utf-8')
assert_("mode: 'shadow'" in cfg,'Reactive Matrix not in shadow mode')
assert_('matrixMitigationApplied=0' in mx and 'matrixJamActivated=false' in mx and 'matrixRebootActivated=false' in mx,'Shadow no-intervention guarantees missing')

print('VALIDATION v0.6.1 PASS')
print('asset_audio_tree_sha256',tree_hash())
print('economy_js_sha256',hashlib.sha256((ROOT/'js/economy.js').read_bytes()).hexdigest())
print('pwa_manifest',manifest['name'],manifest['display'])
