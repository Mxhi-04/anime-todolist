# Anime Todo upgrade — implementation status

Updated 1 November 2026. Local preview: http://127.0.0.1:5173/ . The user selected **bright manga / graphic editorial**.

## Working implementation

- Editorial landing with Humane/Ranade, real anime posters, a Three.js collage, a desktop 400vh scroll composition, GSAP reveals, and a short mobile/reduced-motion layout.
- **64 anime worlds**, including every one of the first **50 entries actually observed** in the signed-in Chrome Crunchyroll Popular view. The remaining 14 established classics stay available. Popular 50 filtering, dated position badges, genre filtering, alternate-title search, previews, and load-more are implemented.
- Device-mode entry, favorite selection, active world/name/motion onboarding, and title-themed dashboards. Task creation/editing/completion/deletion with Undo, activities, calendar, focus timer, world switching, preferences, backup import/export.
- Custom artwork and optional video saved in IndexedDB. Image format/size/dimension and video format/size/duration validation. Custom files are device-local.
- Existing v1 task/activity keys and IDs are preserved. The original One Piece interface remains at `/legacy.html` and is linked from Settings.
- A Supabase adapter and owner-scoped revision-checked schema exist. **Real account sign-in and cloud sync are not connected or verified yet.** The user chose an existing project and has not yet supplied its name/URL. Setup: [ACCOUNT_SETUP.md](ACCOUNT_SETUP.md).
- Portable landing-page skill installed in Codex, Claude, OpenCode, Antigravity, and shared skill directories. All five copies still match the project source.

## Sources and media

The dated ordering is recorded in [crunchyroll-popular-observed.json](../research/crunchyroll-popular-observed.json), with the individual Crunchyroll series URLs and the account/region/date limitation. It is not presented as a universal official ranking. The earlier research shortlist is superseded by this browser observation and the production manifest.

Every world has its own poster, scene, and six-second H.264 loop. Metadata/title identities come from AniList's public GraphQL API. Existing and added titles were checked against the returned names; the 14 new poster/scene pairs were visually inspected in a contact sheet. Assets are credited; permission for commercial redistribution has not been established.

**These are cyclic live-artwork videos made from the sourced stills, not extracted anime footage or newly animated characters.** This distinction also appears in the app's credits/settings. All 64 decode through their final frame; the maximum normalized first/last-frame mean absolute difference is 0.013897. Total loop transfer size is 9.63 MiB. See [media-checks.json](media-checks.json). Automated seam checks do not establish flawless three-cycle playback on every browser. Safari/real mobile playback remains unverified.

Typeface provenance and original-file sources are in [SOURCES.md](../../public/fonts/SOURCES.md).

## Saved Flow / Stitch workflow

Flow project: https://flow.google.com/project/de7d1aea-0aab-4ebc-baf5-0e0571cda5d1 .

1. Four Nano Banana Pro 16:9 end-frame options were generated with official anime references attached. Option 2 was exported at 2K: `public/media/hero/end_frame.jpg` (2752×1536), plus a PNG conversion.
2. A matching quiet start frame was generated in Flow. Its 2K upscale did not download; the successful original export is `public/media/hero/start_frame.jpg` (1376×768), plus PNG conversion. It is not labeled as a 2K original.
3. The exact exported end frame was reuploaded and attached alongside the generated start frame. Two eight-second Veo 3.1 Quality variants were requested.
4. **Flow rejected that request with “unusual activity.” No Veo clip was obtained.** The user has been asked to use Flow's normal retry/verification UI. No verification challenge was bypassed.
5. The sequence renderer is implemented but `src/data/hero-sequence.json` remains `ready:false,count:0`. The landing uses the real poster collage and static Flow background, not a claimed Veo sequence. `scripts/prepare-hero-sequence.py` can extract seconds 1–8 at 30 FPS once the real clip is exported and reviewed.

Stitch project: https://stitch.withgoogle.com/projects/326268033321084036 .

- Web mode and the available Balanced model were used (the UI previously identified it as Gemini 3.8 Flash; saved workflow's 3.1 option was unavailable).
- The exact image upload did not open a file chooser after the file-URL setting was enabled. A detailed matching visual brief was submitted instead.
- A desktop draft appeared, but the last observed state still said “Building out the screen.” It also invented unsupported features such as OST cues and an encrypted bridge. These claims were **not** incorporated into the app.
- No final `code.html` / `screen.png` exports were obtained. Draft correction, mobile result, export, and selective adaptation remain pending.
- Chrome-control tools became unavailable later in the continuation. Plugin discovery found no replacement that can use this existing local Chrome session, so browser-specific work stopped without switching accounts or control mechanisms.

## Verification performed

- `npm test`: **17 passed**, including old-data persistence, account-cache separation, sync conflicts, world switching, timer elapsed time, backup import, and exact source-URL coverage/order for all 50 observed Popular entries.
- `npm run test:legacy`: **34 compatibility checks passed** against the preserved original interface. These are not 34 tests of the new UI.
- HTTP smoke check: all 203 checked app/media/font URLs returned 200 with no HTML fallback for media.
- `npm run build`: passed. Three.js is lazy loaded but still produces a 742.8 kB / 187.7 kB gzip chunk warning; main app is approximately 135 kB / 44 kB gzip. This is a bundle measurement, not a Core Web Vitals result.
- Real Chrome: landing at 390×844; dashboard at 360×800; both had matching viewport/document widths and no horizontal overflow. Desktop landing WebGL initialized. Real phone and Safari checks remain pending.
- Real Chrome: library load-more reached all original 50; alias “Sousou” found Frieren. The later 64-world/Popular 50 addition passed data tests/build but has **not** received a new rendered-browser pass after control became unavailable.
- Real Chrome: device entry → favorites → active world → dashboard; create/complete task → reload; running focus timer + completed task persisted across Frieren → Solo Leveling switch and reload. Temporary task removed; QA timer reset.
- Real Chrome on the isolated `localhost` origin: custom One Piece image + matching video → onboarding → active custom world → reload. Video restored from a blob URL, `readyState:4`, duration six seconds. This QA data is separate from the primary `127.0.0.1` origin.
- Keyboard controls, native modal focus/Escape implementation, reduced-motion CSS, and observer cleanup were reviewed. A complete keyboard/screen-reader audit and new post-fix visual pass remain pending.

Screenshots are in [screenshots](screenshots/). Some capture the earlier 50-world build; they are labeled by view and do not prove the later catalog filter's rendered behavior.

## Remaining work requiring external state

1. Receive the existing Supabase project name/URL; apply/configure the schema and public client configuration, then exercise real OAuth/email and two-account RLS/sync cases.
2. Restore Chrome control and clear the Flow rejection through the normal user-facing UI, then export/review the actual Veo clip and activate the frame sequence.
3. Correct/export the Stitch draft and finish browser QA, including the 64-world filter, reduced motion, keyboard flow, and Safari/mobile loops.

No deployment or Git push was performed.
