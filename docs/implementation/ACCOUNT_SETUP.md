# Connect account sign-in

The app includes a real Supabase adapter for Google OAuth, email OTP, session resolution, owner-scoped storage, and revision-checked saves. Device mode works independently. Provider configuration has not been provisioned by this change.

1. Select a Supabase project and apply [schema.sql](../../supabase/schema.sql).
2. Copy `.env.example` to `.env.local`; set the project URL and browser-safe publishable key. Never use the service-role key in a Vite environment variable.
3. In Auth, configure Google OAuth and its client credentials. Set the local site URL to `http://127.0.0.1:5173`, allow `http://127.0.0.1:5173/auth/callback`, and add the exact deployed origin/callback when deploying.
4. Configure email delivery and change the magic-link email template to show `{{ .Token }}` for the app's code entry. Confirm configured OTP length matches the app's accepted 6–8 digits.
5. Restart Vite. Account buttons enable only when the public configuration exists. Verify an actual OAuth return and an email code; cancelling or expired code must not create a false success state.
6. Use two independent test accounts to verify the RLS policies: neither may read/update the other's row. These cloud tests remain pending until the project exists.

The workspace schema intentionally stores the existing task format in one owner-scoped JSON document, preserving IDs, activity links, completion state, and original local keys. This implementation is smaller than the normalized-table option in the research plan. Local data imports into an account only through the explicit settings action. Custom image/video blobs are device-local IndexedDB assets and are not advertised as cross-device uploads.

A revision mismatch is reported to the user and does not overwrite the remote document. Device edits remain cached in the account-specific local keys. Offline caches are separate per user. Export a backup before manually reconciling conflicting edits.
