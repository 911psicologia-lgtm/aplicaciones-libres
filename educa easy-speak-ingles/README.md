# Easy Speak v0.4.8 — Single Mic Session + Expanded Content (audited)

This build preserves the v0.4.5 bilingual UI and revises the v0.4.6 microphone stability design after a DSEBI audit found that its central claim — automatic recognition safely reusing one authorized track everywhere — could not actually be guaranteed on most real mobile browsers.

## Why v0.4.6's approach needed correction

`SpeechRecognition.start(audioTrack)` is a real but **experimental, non-Baseline** overload (see the Web Speech API spec and MDN). Browsers that do not implement it do not throw when called with an extra argument — JavaScript silently ignores arguments a function doesn't declare — so v0.4.6 had no way to know, after the fact, whether a given call actually reused the authorized track or quietly opened its own internal capture instead. On the mobile browsers most Easy Speak users will actually have (mainstream Chrome for Android, Safari on iOS), that second path is exactly the repeated-permission behaviour the whole design exists to avoid.

## v0.4.7 change

- On mobile, Easy Speak now only attempts `start(audioTrack)` when the browser also exposes the correlated on-device speech capability (`SpeechRecognition.available` + `processLocally`), which is the closest verifiable signal that the track-reuse overload is genuinely implemented.
- Everywhere else on mobile, Easy Speak degrades directly to record / My Voice / guided self-check mode from the first turn — instead of gambling on a call it cannot verify — consistent with the product's own principle of preferring mobile stability over sophistication.
- This is an honest trade-off: some mobile sessions that v0.4.6 optimistically labelled "automatic recognition" will now correctly show as "listen-and-compare mode" from turn one. That label was already true in practice for many devices; v0.4.7 just stops claiming otherwise.

## Still true from v0.4.6

- `getUserMedia()` is acquired once and its live audio track is reused for the whole page/session.
- `listen()` no longer calls a fresh microphone acquisition for every exercise.
- Speech recognition is no longer auto-restarted from `onend`.
- TTS never starts speech recognition; recognition is opened only inside the learner's response window, so the parrot is less likely to be transcribed.
- `pause()` stops processing but deliberately keeps the granted microphone stream available between app screens and exercises.
- The stream is fully released when the page is actually closed/unloaded.
- A brief “Microphone ready for this session · one permission only” confirmation appears after the first successful acquisition.

## New in v0.4.7: recovering from an accidental "Block"

Previously, if a user denied the microphone prompt by mistake, there was no way to try again without closing and reopening the page. A "🎙 Try microphone again" button now appears in both Learn and Pronunciation Boost whenever permission was denied. It only runs from a real tap (browsers require a fresh user gesture to reissue the permission prompt) and calls a new `Speech.retryPermission()`; if the origin is genuinely hard-blocked at the browser level it will simply fail again with guidance to check site settings.

## New in v0.4.7: accessibility of live feedback

Practice and Pronunciation Boost feedback (status text, transcript, scores) is announced to screen readers via `aria-live="polite"` regions, and Spanish translation text now carries `lang="es"` so assistive technology pronounces it correctly instead of reading it with English phonetics.

## Bilingual support retained

- `EN`: English only.
- `EN+ES`: Spanish meaning visible under English.
- `EN·ES`: Spanish appears on tap.
- The parrot always speaks English only.
- Spanish remains offline and does not enter microphone recognition or Training Score.

## Deployment

Replace the whole previous app folder in GitHub / Cloudflare Pages. The service-worker cache is versioned as `easy-speak-v0.4.8`.

Direct `file://` testing is browser-dependent. The app now avoids repeated permission requests inside one open page, but a browser may still ask again after the local file is closed/reopened because permission persistence belongs to the browser, not to Easy Speak.

## v0.4.8: content expansion (4 new conversations per CEFR level)

Added 16 new conversations (4 per level, A1–B2) targeting domain gaps found in a content audit: the original set leaned heavily on the personal domain at A1 and on public/argumentative discourse at B2, with almost no situational coverage of the educational or occupational domains at any level, and no B2 conversation grounded in personal or hypothetical-ethical reasoning.

New conversations by level:
- **A1** (+4, 5 turns each): asking for help in a shop (public domain), an English class (educational), a day at work (occupational), talking about a friend (personal/relationships).
- **A2** (+4, 10 turns each): joining a class (educational), calling in sick to work (occupational), a mix-up with a booking (repair scenario — explicit A2 can-do), talking about a film or book (opinion, bridging toward B1).
- **B1** (+4, 14 turns each): job interviews (occupational), everyday disagreements (personal/conflict), dreams and ambitions (personal, explicit B1 can-do), feedback and mentoring (educational).
- **B2** (+4, 18 turns each): a difficult personal decision (personal domain, previously absent at B2), negotiating a pay rise (occupational negotiation), defending an academic argument (educational), a whistleblowing dilemma (hypothetical/ethical reasoning).

B1 and B2 conversations were generated from the same recipe-based template already used for the original ten conversations per level (visible in `es-b1.js`/`es-b2.js`), so English and Spanish stay structurally consistent with the existing dataset. A1 and A2 conversations were hand-authored to match the situational, non-templated style of the original content in those levels.

Verified before release: EN/ES turn-id parity (658/658, zero gaps), zero duplicate turn or conversation ids, valid JS syntax across all 8 data files, and a live run of `Engine.queueFor`, `Scoring.evaluate`, `Pronunciation.deriveItems` and the auto-translated branch logic in `spanish.js` against the new content — all completed without errors.

### Fix: the "Everyday" option was silently disabled on the first draft

A follow-up quality pass found that the first draft of the 16 new conversations set `turn.everyday` to text identical to one of the three scripted options in 60 of 60 new A1/A2 turns and 8 of 128 new B1/B2 turns. `modelOptions()` in `app.js` deduplicates by normalized text before rendering the "Ways to say it" cards, so an `everyday` value identical to an existing option is silently dropped — the turn quietly loses its fourth, "EVERYDAY"-tagged card instead of erroring.

Measured against the original ten conversations per level: English duplication was 2% in A1 and 0% in A2/B1/B2 — meaning the first draft was a real, measurable regression from the dataset's own established convention, not a stylistic nitpick. (Spanish is different: the original translations already reuse an option verbatim as `e` in 78% of A1/A2 turns, so that duplication is the existing norm there, not a defect — Spanish was improved opportunistically but not treated as broken.)

All 60 new English `everyday` fields were rewritten as genuinely distinct casual variants (contractions, dropped openers, interjections — e.g. "Just looking for the bags, please." instead of repeating "Yes, please. Where are the bags?"), and the 8 templated B1/B2 duplicates were fixed by reapplying the exact prefix pattern the original template already used for those turn positions ("Personally, ..." for T09/T14, "For instance, ..." for T04). Re-verified after the fix: 0/188 new turns have an `everyday` value identical to a scripted option.

### Still not done

A native-speaker pedagogical review of the new English content, and a Spanish-speaker review of the new translations. Everything verified so far is structural (parity, syntax, engine behaviour, the specific "everyday" defect above) — it confirms the content **works**, not that every sentence **reads naturally** to a native ear. Recommended before wide release.
