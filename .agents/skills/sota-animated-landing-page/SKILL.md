---
name: sota-animated-landing-page
description: Research and build art-directed landing pages with reference-matched imagery, expressive typography, cinematic scroll sequences, responsive layouts, and visual verification. Use for landing-page creation or substantial redesign; preserve the existing product and the user's chosen visual direction.
---

# SOTA Animated Landing Page

This is the user's saved **SOTA Animated Landing Page Workflow**, recovered from the chat **Save Landing Page Workflow** on 2026-11-01. Apply it across projects without imposing one project's subject, palette, or branding on others.

## Brief and evidence

- Read the existing app, local agent instructions, task state, and available assets. Preserve working user journeys and data. If the user requests research and a plan first, produce those before product implementation.
- Use the concept and references to determine the hero: an architectural reveal, interface assembly, character scene, neural core, or another appropriate subject. Never force a commercial product shot.
- Browse actual visual references. Record source URLs, what each contributes, and whether imagery has been visually inspected. Source-led imagery must match the named subject, character, series, and era; don't substitute stock photos or unrelated fan art.
- Treat discovery, downloadability, use permission, and production readiness as separate facts. Record actual status instead of making unsupported availability or license claims.
- Follow a supplied font collection to the creator/foundry, select display and interface roles, and confirm actual webfont terms and files. Keep reading text legible; display fonts belong in large headlines.
- Define composition, palette, type pairing, graphic language, interaction, and mobile behavior. Awwwards-level ambition is a brief, not proof of an award or measured quality.

## Saved production sequence

Read [the animation production workflow](references/animation-production.md) when creating the hero. It preserves the user's Google Flow, Nano Banana Pro, Veo, FFmpeg, and Stitch settings, filenames, and scroll behavior.

Check actual tool access before starting. Prefer the requested provider when available. If Flow, Veo, Stitch, or browser integration is unavailable, complete independent research, reference collection, storyboards, layout, and code scaffolding, and report which provider-specific outputs remain unavailable. Do not claim another generator ran the requested service. Spending and publication remain within the current task's authorization.

For established-character imagery, anchor the work to verified source images. A current web-sourced-art requirement takes precedence over generating replacement character art. The generation workflow can animate backgrounds and panel reveals around verified artwork; disclose synthetic character motion and inspect for identity drift.

## Assembly

- Keep the headline, explanation, navigation, and primary action semantic HTML outside the canvas. The page must communicate before animation loads and if it fails.
- Use the saved desktop `400vh` track and sticky `100vh` canvas. Map normalized scroll to frame index, paint via `requestAnimationFrame`, and fade hero copy after 30% progress. Preserve native wheel/touch scrolling.
- The saved workflow preloads the sequence. Separate compressed frame prefetch from decoding: 210 decoded 1920×1080 RGBA frames require roughly 1.62 GiB before browser overhead. Start with the poster and a small decoded window; prefetch remaining compressed assets after critical content within connection/memory limits. Explain the cost if full decoded preloading is required.
- Provide a static/reduced-motion path and a short mobile layout when the desktop sequence would impede access. Cap rendering resolution, resize correctly, and cancel observers, frames, and media when leaving the view.
- Adapt imported Stitch output to the real component system. Remove duplicated hero/nav content, replace invented content, preserve chosen fonts, and make visible actions work.
- Demonstrate the actual product through a useful preview, choices, benefits, honest FAQ, and a final action. Do not invent customers, testimonials, awards, usage counts, or integrations.
- Avoid loading dozens of videos or full-resolution posters at once. An ambient dashboard loop is separate from a beginning-to-end hero transition; read the loop criteria in the production reference.

## Verification and handoff

- Check desktop and narrow mobile layouts, keyboard navigation, visible focus, contrast, reduced motion, image failures, loading states, and the main user journey.
- Inspect rendered screenshots when a browser is available. Report when visual verification has not been possible; a successful build is not visual verification.
- Run relevant builds and behavior checks. Verify data preservation and account isolation when persistence or sign-in changes.
- Measure critical loading and interaction; identify media bottlenecks. Label targets separately from measured results.
- Hand off source files, provenance, dependencies, and verified local results. Push to GitHub or deploy to Vercel when requested or already authorized, following the project's hosting workflow.
