# Easy Speak v0.4.7 — Single Mic Session (audited)

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

Replace the whole previous app folder in GitHub / Cloudflare Pages. The service-worker cache is versioned as `easy-speak-v0.4.7`.

Direct `file://` testing is browser-dependent. The app now avoids repeated permission requests inside one open page, but a browser may still ask again after the local file is closed/reopened because permission persistence belongs to the browser, not to Easy Speak.
