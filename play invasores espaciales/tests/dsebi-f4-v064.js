const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'), css=read('css/main.css'), main=read('js/main.js'), assets=read('js/assets.js'), storage=read('js/storage.js'), sw=read('sw.js');
function ok(v,m){if(!v) throw new Error(m)}
ok(!/user-scalable=no|maximum-scale=1/.test(html),'viewport still blocks zoom');
ok(/id="srLive"/.test(html)&&/aria-live="off"/.test(html),'screen-reader live regions not corrected');
ok(/role="dialog"[^>]*aria-modal="true"/.test(html),'dialog semantics missing');
ok(/id="helpOverlay"/.test(html)&&/id="helpBtn"/.test(html),'help/onboarding missing');
ok(/ship-preview-img/.test(css)&&/assets\/ships\/\$\{esc\(s.id\)\}/.test(read('js/ui.js')),'real ship preview not wired');
ok(/focus-visible/.test(css)&&/prefers-reduced-motion/.test(css),'focus/reduced-motion missing');
ok(/loadBatch/.test(assets)&&/timeoutMs/.test(assets)&&/retryFailed/.test(assets),'adaptive asset loading missing');
ok(/normalizeGame/.test(storage)&&/normalizeRanking/.test(storage),'storage normalization missing');
ok(/build=0750/.test(main)&&/starfall-shell-v0\.7\.5/.test(sw),'PWA versioning not synchronized');
ok(/visibilitychange/.test(main)&&/e\.key==='Escape'/.test(main),'pause/dialog keyboard robustness missing');
console.log('DSEBI F4 v0.7.5 PASS');
