> Implementation update (1 Nov 2026): the later live Chrome observation and 64-world production manifest supersede the initial shortlist/readiness counts below. See [STATUS.md](../implementation/STATUS.md) and [ANIME_CATALOG.md](ANIME_CATALOG.md). Original research notes are retained as history.

# Research, visual references, and media readiness

Checked **1 November 2026**. This is a source ledger, not a claim that media is licensed for production or that videos have been downloaded or reviewed. All six local images were fetched from the web and visually inspected. Hashes and byte sizes are in [reference-images/manifest.json](reference-images/manifest.json).

## Retrieved visual references

| Reference | Primary page / observed asset | Local copy | Inspection and use decision |
| --- | --- | --- | --- |
| One Piece crew art | [Toei catalog](https://www.toei-animation.com/catalog/one-piece/) / [observed image](https://www.toei-animation.com/wp-content/uploads/2019/02/one_piece_product.jpg) | [Reference image](reference-images/one-piece-official.jpg) | Recognizable Luffy and Straw Hat crew, bright blue/red/yellow. **540×432: reference only, too small for a full-screen hero.** Resolve a higher-resolution official source before production. |
| Solo Leveling | [Official anime site](https://sololeveling-anime.net/) / [observed OG image](https://sololeveling-anime.net/assets/og/og.jpg) | [Reference image](reference-images/solo-leveling-official.jpg) | 1200×630, Jinwoo and shadow imagery, violet/cyan palette. Includes large embedded Japanese text and a 2025 date. **Useful identity reference; do not use unchanged as a current, text-free hero.** |
| Demon Slayer | [Official anime portal](https://kimetsu.com/anime/) / [observed OG image](https://kimetsu.com/anime/ogp.png) | [Reference image](reference-images/demon-slayer-official.png) | 1200×630 red/black logo image, **no character scene**. Useful for logo/color reference only. Find an actual character key visual and separate loop. |
| DAN DA DAN | [Official anime site](https://anime-dandadan.com/) / [observed OG image](https://anime-dandadan.com/ogp4_ja.png) | [Reference image](reference-images/dandadan-official.png) | 1200×630 split composition: characters/environment on left, large red logo on right, purple/magenta/green. **Not a clean full-width scene; choose crops intentionally and preserve correct character identities.** |
| Ranade specimen | [Awwwards entry](https://www.awwwards.com/inspiration/ranade) / [specimen image](https://assets.awwwards.com/awards/element/2022/07/62cc57d252210232308073.jpg) | [Reference image](reference-images/ranade-awwwards.jpg) | Contrasting weights demonstrate a readable neo-grotesque for UI/body. Specimen is a visual reference, not the font binary. |
| Geist specimen | [Awwwards entry](https://www.awwwards.com/inspiration/geist-by-vercel) / [specimen image](https://assets.awwwards.com/awards/element/2024/06/666ac01de80e6356323247.jpg) | [Reference image](reference-images/geist-awwwards.jpg) | Clear Sans/Mono family roles; Mono suits focus timers and metadata. Specimen is a visual reference, not the font binary. |

Research art stays under `docs/research/`; it is not silently promoted into production `public/` assets. Download success does not establish a production-ready crop, sufficient resolution, or permission for reuse.

## Art direction references

- [SHIFTBRAIN — Awwwards Conference Tokyo 2020](https://shiftbrain.com/work/awwwards_2020/?lang=en): primary studio case study describes anime/manga-informed Japanese imagery, a red-led identity, and transitions into illustrations. Borrow the principles of composed illustration, decisive accent color, and scene transitions. This is a historical composition reference, not evidence of a current design trend or a template to copy.
- [ONE PIECE official site](https://one-piece.com/) and [Toei's catalog](https://www.toei-animation.com/catalog/one-piece/): source identity for the pirate world. Existing local Luffy files are inventory, not verified provenance for every existing file.
- [Jujutsu Kaisen official site](https://jujutsukaisen.jp/) and [movie gallery](https://jujutsukaisen.jp/movie/): correct series/character reference. Main-page direct retrieval timed out in this session; the web reader exposed the source and movie navigation. No local character image or video was acquired.
- [Frieren official site](https://frieren-anime.jp/) and [movie gallery](https://frieren-anime.jp/movie/): correct identity and calm landscape direction. Direct image fetching returned 403; the web reader exposed the official site. Image search also surfaced third-party copies, which were not promoted into the production ledger.
- [Naruto official announcement](https://naruto-official.com/en/news/01_2696?pubDate=20261014): official visual/project context; includes multiple media and eras. Do not mix original-series, Shippuden, game, or new-project imagery without verifying the intended theme.

The project's bright manga direction is the user's explicit choice. Paper textures, panel layouts, and per-anime color proposals are our art direction, not a requirement to imitate any one reference site.

## Typography from the supplied collection

Discovery source: [Awwwards Free Fonts](https://www.awwwards.com/awwwards/collections/free-fonts/), successfully read. The first page includes Humane, Ranade, Geist, Mango Grotesque, and other options. Selection is based on a readable bright editorial system, not a universal claim that a font is “SOTA.”

| Role | Selected candidate | Primary verification | Acquisition status |
| --- | --- | --- | --- |
| Large editorial headings | [Humane on Awwwards](https://www.awwwards.com/inspiration/humane) | [Rajesh Rajput's Humane 2.0 announcement](https://rajputrajesh-448.gumroad.com/p/introducing-humane-v-2-0-bigger-bolder-better) describes personal/commercial availability and website use; [creator download](https://rajputrajesh-448.gumroad.com/l/HUMANE) | Creator page researched; original package/license still to acquire. Use large headlines, never dense task content. |
| Interface and body | [Ranade on Awwwards](https://www.awwwards.com/inspiration/ranade) | [Fontshare's Ranade](https://www.fontshare.com/fonts/ranade), ITF Free Font License | Foundry page/license identification checked; original WOFF2/package still to acquire. Preserve actual license; avoid unsupported font modifications. |
| Timer / numbers / fallback | [Geist on Awwwards](https://www.awwwards.com/inspiration/geist-by-vercel) | [Vercel Geist](https://vercel.com/font), OFL distribution | Ready source identified; Sans/Mono package still to acquire. Geist Black is a practical headline fallback while Humane is unavailable. |

Retain only selected weights and original licensed webfont formats. Font download/hosting must happen before calling the selected production typography installed. The font specimens above were fetched and inspected; they do not supply the font software.

## Crunchyroll evidence and ranking limits

- [Popular](https://www.crunchyroll.com/videos/popular) and [Popular with query state](https://www.crunchyroll.com/videos/popular?lang=dub): live-reader attempts returned navigation/unsupported-browser shells; search-indexed snapshots exposed partial title lists. These are not complete reproducible rank captures.
- [Crunchyroll homepage](https://www.crunchyroll.com/): indexed catalog sections provide primary-source association for major titles; ordering is not a universal ranking.
- [Spanish catalog page](https://www.crunchyroll.com/es?beta_opt_in=1) and [regional fantasy Popular](https://www.crunchyroll.com/es-es/videos/adventure/fantasy/popular): additional primary title evidence, with locale recorded as regional/mixed.
- [Romance Popular](https://www.crunchyroll.com/videos/anime/genres/romance): primary category evidence for the romance choices.
- Individual series pages and a historical Hunter x Hunter catalog announcement are linked per row in [the 50-theme shortlist](ANIME_CATALOG.md).

Do not use Crunchyroll store merchandise results or search results containing unrelated help-center tags as proof that a series currently streams in a region. No playback availability in India was established. No exact top-50 rank was established. Official rank fields remain null. Proposed product wording until verified: **50 anime worlds**, not **Crunchyroll's official top 50**.

## Video reference sources and readiness

| Title | Source | What is established | Still missing |
| --- | --- | --- | --- |
| One Piece | [Toei catalog / Trailer section](https://www.toei-animation.com/catalog/one-piece/) | Official source page with Trailer navigation | Appropriate loop source, acquisition/use status, edit, encodes, playback review |
| Jujutsu Kaisen | [Official movie gallery](https://jujutsukaisen.jp/movie/) | Official gallery page discovered/read | Exact clip selection, acquisition/use status, seamless edit and review |
| Frieren | [Official movie gallery](https://frieren-anime.jp/movie/) | Official gallery page discovered/read | Exact clip selection, acquisition/use status, seamless edit and review |
| Solo Leveling | [Official movie gallery](https://sololeveling-anime.net/movie/) and [official GIF gifts](https://sololeveling-anime.net/special/gif/) | Official video/gallery and downloadable GIF reference page exists | Select a stable cyclic scene; confirm app embedding/use terms; source/download/encode/review |
| DAN DA DAN | [Official movie gallery](https://anime-dandadan.com/movie) | Official source/navigation identified | Exact clip selection, acquisition/use status, seamless edit and review |
| Remaining launch themes | Their primary catalog evidence and title-specific loop briefs in the manifest | Candidate theme and intended scene are defined | Official media source resolution, production media, loop review |

No new videos were downloaded, generated, or claimed to be seamless. A trailer has cuts and does not satisfy an ambient-loop requirement. Official GIF availability is useful discovery but does not establish general reuse permission or a high-quality dashboard video. Existing `assets/` video files also need production provenance and seam review.

## Technical references used in the plan

- [MDN video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video): poster, muted/inline playback, preload, loop, and fallback behavior.
- [MDN canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas): practical redraw and render-cost guidance.
- [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): honor operating-system motion preference.
- [W3C pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): user control over persistent moving content.
- [Core Web Vitals](https://web.dev/articles/vitals): LCP, INP, CLS and percentile-oriented experience measurement. Plan budgets are proposed targets, not measured results.
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google): real provider configuration and callback flow.
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security): server-enforced ownership for user records.
- [FFmpeg xfade](https://ffmpeg.org/ffmpeg-filters.html#xfade): overlap editing reference; initial web retrieval timed out. Local FFmpeg 6.0 is present. Crossfading alone does not prove a seamless loop.

## Reusable skill installation references

- [Claude Code skills](https://code.claude.com/docs/en/skills): personal skill directory `~/.claude/skills/<name>/`.
- [OpenCode skills](https://opencode.ai/docs/skills/): `~/.config/opencode/skills/<name>/` and compatible shared skill paths.
- [Google Antigravity skills](https://antigravity.google/docs/skills?app=antigravity-ide): current shared global path `~/.gemini/config/skills/<name>/`. The local Antigravity customization guide also confirms the directory + SKILL.md structure.
- Codex's bundled `skill-creator` instructions identify `~/.codex/skills/` for personal discovery. A shared copy also lives under `~/.agents/skills/`.

The skill preserves the recovered Google workflow, rather than changing it into a provider-agnostic process without disclosure. Provider availability is checked at execution; model names/settings are the user's baseline, not a guarantee about future UI options.
