# MaheshLabs status

Updated November 24, 2026.

Implemented:

- Next.js server runtime with Neon Postgres; migrations and non-destructive episode seeding.
- Password-only Studio at `/admin/`, hashed password, server-side sessions, origin checks, and login rate limits. No subscriber accounts.
- Compact newsletter signup with signup consent recorded, email normalization, duplicate prevention, subscriber search/pagination, CSV export, and unsubscribe suppression. Public pages include a corner button and the same signup popup on desktop exit intent (once per session after 10 seconds). Successful signup suppresses future prompts in that browser; this is not early-access authentication.
- Provider-independent newsletter drafts, live writing preview, and text export. No email service or sending integration.
- Episode drafts/publishing, titles, descriptions, and image/teaser URL editing. Chapters import directly from the YouTube `.txt` chapter file, with timestamp validation and a preview. Guest links use separate label/URL fields with add/remove controls.
- Native vertical overscroll bounce is disabled across the public site and Studio.
- Homepage introduction, story, creator introduction, and newsletter copy are hardcoded in `content/homepage.json`. Studio has no Site copy menu, editor, or write API.
- Homepage shows up to 4 podcasts on mobile and 6 on desktop. More opens `/episodes/`, with 12 conversations per page and search/topic filters.
- Blog at `/blog/`: covers, authors, tags, reading time, table of contents, pagination, metadata, and safe Markdown. Studio provides an article editor with formatting controls, preview, draft/publish states, and URL slugs.

Publishing workflow to discuss:

- Teasers in Neon Object Storage, removed after the full episode goes live.
- Full episodes available to newsletter subscribers one day early.
- Unique expiring email links, browser access cookies, forwarding/device rules, and the selected email provider.
- Email confirmation and provider-managed delivery/unsubscribe events.

No early-access schedule, email sending, or automatic teaser deletion is active yet. Image and video fields currently accept existing asset paths or hosted URLs; uploads will follow the storage design.

Validation:

- Newsletter layout/popup: build and TypeScript/content checks passed; browser checks confirmed a single-line desktop heading, a compact 121px banner, same-row email/button at desktop and 390px, popup sizing, close/Escape behavior, focus/scroll restoration, and signup suppression after reload. Popup signup persisted in Neon; the temporary test subscriber was removed. Automatic desktop exit intent is implemented; the browser-chrome pointer gesture could not be automated because native app control was unavailable.
- Chapter importing passed against the original EP2, EP3, and EP4 YouTube chapter exports (16, 19, and 18 chapters), plus malformed timestamps, duplicate/order checks, BOM/CRLF, and limits. Browser checks confirmed file upload/preview, error preservation, guest-link add/remove fields, no horizontal overflow, and the upward scroll boundary. Build and TypeScript/content checks passed after these changes.
- After removing Site copy, the build and TypeScript/content checks passed; a production-server smoke check confirmed hardcoded homepage copy and HTTP 404 for the retired editor and save API.
- Production build and TypeScript/content checks passed.
- The production runtime returned HTTP 200 for the homepage, archive, blog, and sign-in page; Neon-backed admin login, dashboard, and logout passed.
- All 12 original end-to-end functional checks passed on the isolated development branch: database connectivity, access controls, password login/session/logout, cross-site protection, signup/consent/duplicates/export/unsubscribe, episode draft/publish/concurrent edits, homepage/episode pagination, newsletter draft persistence, safe blog publishing/Markdown/table of contents, and login rate limiting. The former homepage editing check now verifies hardcoded copy and removed editor routes.
- Browser checks confirmed 4 podcast cards at 390px and 6 at 1280px, without horizontal overflow; Studio password login and the blog editor preview also worked.
- The test runner’s final cleanup encountered a proxy connection error. Cleanup succeeded from a fresh process; the runner now batches cleanup in a single transaction.
- Neon’s production branch received both additive migrations and the existing five episodes.
- The development branch remains available; automatic branch deletion was blocked because Neon CLI could not refresh credentials in its read-only global config directory.

Integration tests require an isolated `dev-*` Neon branch, a running app using that branch, and `STUDIO_TEST_PASSWORD`; they create and remove temporary test records.

Optional cleanup from `website/` in a normal terminal (the agent could not refresh the global Neon CLI credentials):

```sh
npx --yes neon@latest branches delete dev-newsletter-studio
```
