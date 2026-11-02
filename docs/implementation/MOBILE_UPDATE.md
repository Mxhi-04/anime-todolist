# Mobile and media sizing update — 2 November 2026

Removed the fixed 16:9 padding from all 64 loops. Encodes now retain the source artwork aspect ratio, recorded as mediaAspect in the catalog. Preview wrappers explicitly occupy the full modal row; absolute-positioned media fills that wrapper. This removes both the baked black bands and the unused right-side area shown in the user's screenshot. The Jujutsu Kaisen output frame was visually inspected after regeneration.

Mobile improvements include two-column catalog cards, readable labels, 44–48px main touch targets, single-column dashboard side panels, safe-area-aware onboarding controls, 16px form inputs, bounded scrolling dialogs, wrapped task controls, and narrower hero layouts. Ambient loops remain muted and control-free; reduced-motion and motion settings remain available.

Validation: production build, 17 tests, and decode/seam checks for all 64 loops passed. Maximum normalized seam difference: 0.015633. Video total: 6.99 MiB.

Browser-control tools were unavailable for this pass. These changes are not yet verified on actual phones or Safari; no claim of pixel-perfect browser coverage is made.

## Appearance and annotated landing-page changes — November 2

- Removed the floating mission card and bottom scroll strip, preserving the hero headline and collage as clarified by the user.
- Added an accessible 44px light/dark toggle to the landing header, sign-in, onboarding, and dashboard. Dark remains the default; the explicit choice persists locally and is applied before the app paints. Switching appearance preserves form inputs, active anime, tasks, focus timer, and keyboard focus.
- Migrated neutral copy and surfaces to shared appearance tokens, corrected featured-art captions and calendar overlays, and adjusted small-screen header spacing.
- Avoided applying two independent reveal animations to the same section.
- Verification: 17 automated tests pass and production build passes. Existing native-aspect video fix remains in place, with no native playback controls on artwork previews.
- Limitation: computer-use/browser-control tools are unavailable in this session. This is a source and automated-check audit, not a completed browser or real-device visual audit. Sign-in/cloud testing still requires the user's Supabase project configuration. The existing original workspace remains at /legacy.html and has its own appearance controls.
