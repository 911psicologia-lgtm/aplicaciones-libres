# Easy Speak v0.4.6 — Single Mic Session

This build preserves the v0.4.5 bilingual UI and adds a microphone stability redesign for mobile, local-file testing and Cloudflare/PWA use.

## v0.4.6 microphone stability

- `getUserMedia()` is acquired once and its live audio track is reused for the whole page/session.
- `listen()` no longer calls a fresh microphone acquisition for every exercise.
- Speech recognition is no longer auto-restarted from `onend`.
- Where supported, `SpeechRecognition.start(audioTrack)` uses the already-authorized microphone track.
- On mobile browsers that do not support recognition from an existing track, Easy Speak attempts that path once and then remains in record / My Voice / guided self-check mode instead of repeatedly opening microphone permission UI.
- TTS never starts speech recognition; recognition is opened only inside the learner's response window, so the parrot is less likely to be transcribed.
- `pause()` stops processing but deliberately keeps the granted microphone stream available between app screens and exercises.
- The stream is fully released when the page is actually closed/unloaded.
- A brief “Microphone ready for this session · one permission only” confirmation appears after the first successful acquisition.

## Bilingual support retained

- `EN`: English only.
- `EN+ES`: Spanish meaning visible under English.
- `EN·ES`: Spanish appears on tap.
- The parrot always speaks English only.
- Spanish remains offline and does not enter microphone recognition or Training Score.

## Deployment

Replace the whole previous app folder in GitHub / Cloudflare Pages. The service-worker cache is versioned as `easy-speak-v0.4.6`.

Direct `file://` testing is browser-dependent. The app now avoids repeated permission requests inside one open page, but a browser may still ask again after the local file is closed/reopened because permission persistence belongs to the browser, not to Easy Speak.
