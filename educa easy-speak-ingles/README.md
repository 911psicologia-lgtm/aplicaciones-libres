# Easy Speak v0.4.2

Mobile-first, multi-file CEFR A1–B2 English speaking practice app for GitHub + Cloudflare Pages. Plain HTML/CSS/JS; no build command, account, Firebase or cloud progress sync.

## v0.4.2
- Discreet voice-speed selector visible during practice: **0.5× · 0.8× · 1× · 1.2× · 1.5×**.
- The chosen speed is saved locally and reused for prompts and models.
- **Slow** remains an additional temporary slowdown for a specific model.
- Settings use the same five discrete speed choices instead of a continuous range.
- Mobile home is denser: reduced vertical whitespace, shorter setup cards and smaller A1–B2 route tiles.
- Mobile practice is denser: smaller parrot zone, prompt, answer cards, microphone block, results and learning actions so more of the exercise fits on one screen.
- Preserves the `MORE ›` / swipe route cue from v0.4.1.
- Preserves the v0.4.1 mobile microphone compatibility architecture.

## Core
- 40 conversations / 470 turns across A1, A2, B1 and B2.
- 3 model answers + 1 Everyday English option per turn.
- Learn and continuous Flow.
- Training score, points, streaks, CEFR Can-Do, reinforcements, My Progress and local backup/restore.
- Optional PWA installation and user-controlled update indicator.
- Temporary My Voice playback where browser recording is supported.

## Deploy
Upload the contents of this folder as the Cloudflare Pages site root or replace the current app folder in GitHub. HTTPS is required for microphone access.
