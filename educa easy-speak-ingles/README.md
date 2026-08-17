# Easy Speak v0.4.4 — Bilingual Meaning Support

Mobile-first, multi-file CEFR A1–B2 English speaking practice app for GitHub + Cloudflare Pages. Plain HTML/CSS/JS; no build command, account, Firebase or cloud progress sync.


## v0.4.4
- Adds optional **English–Spanish meaning support** without turning Easy Speak into a translation app.
- One discreet capsule cycles through **EN → EN+ES → EN·ES**.
  - **EN**: English only.
  - **EN+ES**: contextual Spanish meaning is shown below the English.
  - **EN·ES**: Spanish stays hidden and is revealed by tapping the English line.
- English remains visually dominant; Spanish appears smaller, muted and italic.
- Text-to-speech always reads **English only**. Spanish never enters microphone recognition or Training Score.
- The same support is available in prompts, the 3 model answers + Everyday English, and Pronunciation Boost.
- Pronunciation fragments use contextual equivalents; when a single word has no safe one-word equivalent, Easy Speak shows the meaning in its source sentence rather than fabricating a literal translation.
- Language preference is stored locally and included in backup/restore.
- All 470 conversation turns have local/offline Spanish support; no translation API or cloud synchronisation is required.
- PWA cache updated to `easy-speak-v0.4.4` and includes the four Spanish data files plus `js/spanish.js`.

## v0.4.3
- Adds **Pronunciation Boost** as a contextual reinforcement layer rather than another large home-screen mode.
- Difficult spoken turns can generate short practice units: **Word → Chunk → Phrase**.
- Candidates are based on extra repetitions and browser recognition difficulty; Easy Speak does **not** claim phoneme-level diagnosis.
- Pronunciation practice flow: **Model → Repeat → recognition estimate → retry/slow model → automatic next item**.
- Up to 3 attempts; the best reviewed result is stored without trapping the learner.
- **My Voice** is available where browser recording is supported and remains temporary only.
- **Shadow** rehearsal lets the learner speak along with the model without scoring, then try the phrase alone.
- Pronunciation uses the same discreet voice-speed control: **0.5× · 0.8× · 1× · 1.2× · 1.5×**.
- Reinforcements now have two compact tabs: **Conversation** and **Pronunciation**.
- Session summaries show a short **Pronunciation Boost · about 2 min** card only when relevant.
- Pronunciation items progress through **New → Practising → Improving → Strong**.
- In mobile/browser modes without reliable automatic recognition, Pronunciation Boost falls back to **listen · record · My Voice · compare · repeat**, without fabricating an automatic score.
- Pronunciation history is included in local JSON backup/restore.
- Service worker cache updated to `easy-speak-v0.4.3` and includes `js/pronunciation.js`.

## Preserved from v0.4.2
- 40 conversations / 470 turns across A1, A2, B1 and B2.
- 3 model answers + 1 Everyday English option per turn.
- Learn and continuous Flow.
- CEFR Can-Do metadata, branching conversations and local personalisation.
- Training score, points, flow streaks, My Progress and conversation reinforcements.
- Mobile microphone compatibility architecture.
- Temporary My Voice playback where supported.
- Voice-speed selector and compact mobile home/practice layouts.
- `MORE ›` / swipe cue for additional route buttons on mobile.
- Optional PWA installation and user-controlled `↻•` update indicator.
- Local-first progress, JSON backup/restore, CSV export and Print/PDF.

## Deploy
Upload the contents of this folder as the Cloudflare Pages site root or replace the current app folder in GitHub. HTTPS is required for microphone access.

Replace the **whole previous app folder**, not only `index.html`, because v0.4.4 changes `index.html`, `styles.css`, `app.js`, `storage.js`, `service-worker.js`, `manifest.json` and adds the Spanish support files (`data/es-*.js` and `js/spanish.js`).
