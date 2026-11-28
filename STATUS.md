# MaheshLabs status

Updated November 28, 2026.

Implemented:

- Next.js server runtime with Neon Postgres, password-only Studio, session/origin checks, episode editing, chapters, blog publishing, and subscriber search/export/suppression.
- Newsletter drafts, live writing preview, text export, optional episode association, and branded HTML/plain-text email rendering.
- Email-provider adapter for Resend, test-recipient sends, immutable campaign snapshots, per-recipient delivery records, cancellation, manual batches, and an authenticated scheduler endpoint.
- Queue idempotency, send-time unsubscribe checks, per-recipient messages, provider acceptance tracking, and paused campaigns after failures. Ambiguous responses are held for review and excluded from automatic retries.
- Public episode release dates in India time. Full playback and chapters stay out of public data before release; subscriber links unlock the episode during the preceding 24 hours. Public playback switches at release without waiting for cached episode data to expire.
- Signed personal watch links, episode-scoped HTTP-only reader cookies, subscription checks on access, and an email-link request form for current subscribers during early access.
- Unsubscribe confirmation and standard one-click POST support. GET requests from email scanners do not unsubscribe people. Suppressed addresses receive an explicit error when they try to sign up again.
- Teasers retire from rendered playback once the full episode is public. Teaser files are retained; YouTube visibility remains a separate YouTube Studio action.

Activation remaining:

- Resend is confirmed and the account is managed by the project owner's friend. Obtain a dedicated Sending access API key and the exact verified sender address; no provider credentials have been added.
- Apply migration `003_newsletter_delivery.sql` to the intended Neon branch.
- Verify the sending domain and configure the server variables documented in [NEWSLETTER.md](NEWSLETTER.md).
- Send a real test email to the owner and verify the result.
- Connect and test a scheduler before enabling unattended delivery. No live scheduler has been registered by this change.
- Deploy the verified website changes through the existing hosting workflow. This task has not deployed or sent emails to the subscriber list.

Known boundaries:

- Unlisted YouTube and emailed links can be forwarded; this is early availability rather than copy protection.
- Provider bounce/complaint events are reviewed in the provider dashboard and suppressed manually in Studio. Automatic webhook ingestion is not implemented.
- Daily news needs an authored newsletter. No automatic news generation or recurring unwritten campaign exists.
- Automatic resubscription, media uploads, and physical teaser deletion are not implemented.

Validation:

- Newsletter regression tests cover signatures, expiry, release boundaries, public-data filtering, scoped access, safe templates, suppression, queue guards, delivery errors, HTTP handlers, and endpoint authentication using mocked database/provider transport.
- TypeScript, existing content/Markdown checks, and all 10 newsletter regression groups passed again after confirming Resend. A read-only live migration-status check failed because this session could not connect to Neon. Live Neon integration checks and a real inbox test remain blocked by network access and missing email-provider credentials.
- Integration tests must use an isolated `dev-*` Neon branch and a running app with `STUDIO_TEST_PASSWORD`; see [NEWSLETTER.md](NEWSLETTER.md).
