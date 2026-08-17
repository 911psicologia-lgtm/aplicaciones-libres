# Easy Speak v0.2.2

Mobile-first, multi-file English speaking practice app for static hosting (GitHub + Cloudflare Pages).

## What is included
- 40 structured conversations: 10 each for A1, A2, B1 and B2.
- 470 conversation turns in total.
- Three standard answer models plus one **Everyday English** model per turn.
- Guided and Hands-free modes.
- A1 / A2 / B1 / B2 / Scale / Surprise routes.
- 5 / 10 / 15 / 20 minute sessions.
- Browser speech synthesis and speech recognition when supported.
- Microphone permission is requested once from the Start action. A single continuous speech-recognition session is then reused across turns; the app only accepts recognition results during the user's speaking window, so it does not restart recognition for every exercise.
- Approximate training metrics for communication, fluency, clarity and voice activity.
- Points, streak multipliers (x1–x5), session score and saved reinforcements.
- LocalStorage progress; no backend required.
- Installable PWA with offline fallback after the first successful load.
- Network-first service worker so new GitHub/Cloudflare deployments are less likely to remain stuck on an old cached version.

## v0.2.2 interaction fixes
- **Critical mobile microphone fix:** one persistent `SpeechRecognition` instance is started for the app session instead of creating/restarting recognition on every turn.
- While the parrot speaks, recognition results are ignored; when the user turn opens, the same recognizer begins accepting the answer without a new `start()` call.
- A turn has one active prompt and one listening cycle; stale audio/listening callbacks from the previous turn are discarded.
- Each answer model occupies its own card; model strings are de-duplicated before rendering.
- Short patterns such as `Yes. ...` are normalized as one spoken response (`Yes, ...`).
- The fourth model is intentionally more conversational and less classroom-like, marked **EVERYDAY**.
- Previously saved v0.1 reinforcements with only three options receive a fourth conversational fallback at runtime.

## Deploy
Upload the contents of this folder as the site root, or point the existing Cloudflare Pages project to this directory. It uses plain HTML/CSS/JS and requires no build command.

## Browser notes
Speech recognition support varies by browser and operating system. Chromium-based browsers generally provide the best experience. If recognition is unavailable, Easy Speak switches to a manual speaking fallback: speak aloud, then choose the closest model response to continue.

For microphone access, the site must run on HTTPS (Cloudflare Pages provides this) or localhost during development. Opening the app directly with `file://` is not a reliable way to test microphone permissions.

## Important scoring note
The score is a training estimate. It does not reproduce the British Council scoring engine and is not an official CEFR assessment. Pronunciation is represented only indirectly through recognition confidence / clarity in this prototype.
