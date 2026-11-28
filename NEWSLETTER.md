# Newsletter and early access

The website keeps subscribers and delivery records in Neon. Studio can save a letter, send a test, queue an immutable copy for current subscribers, and process delivery in batches. Resend is the confirmed provider; its account is managed by the project owner's friend. The API key and sending identity still need to be supplied.

## Details needed from the Resend account owner

Ask the account owner to create a dedicated **Sending access** API key for Mahesh Labs, restricted to the domain verified for this project. They can add it directly to the site's server environment as `EMAIL_API_KEY`; the site does not need their Resend login or a full-access API key. Resend documents these permissions at https://resend.com/changelog/new-api-key-permissions.

They also need to confirm the exact verified sender address for `EMAIL_FROM` (a plain address, without a display name), and an optional `EMAIL_REPLY_TO`. `news@maheshlabs.io` below is an example, not a confirmed sender. Do not put real API keys in Git, screenshots, or chat.

Set `EMAIL_PROVIDER=resend` alongside these values in `.env.local` and in the production server environment. Local secrets are not automatically copied to production: keep `NEWSLETTER_TOKEN_SECRET` stable and use the intended value on each server. After activation, send a test only to an explicitly chosen address before queuing any subscriber campaign.

## Activate delivery

1. Run `npm run db:migrate` against the intended Neon branch. Migration `003_newsletter_delivery.sql` adds the episode selector, campaigns, and per-recipient delivery records. It does not change existing subscribers or publish episodes.
2. Verify the sending domain in the email provider, including the DNS records it supplies. Set these server-only environment variables locally and on the hosting provider:

| Variable | Value |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` |
| `EMAIL_API_KEY` | Dedicated Resend Sending access key restricted to the verified domain |
| `EMAIL_FROM` | Verified plain sender address, for example `news@maheshlabs.io` |
| `EMAIL_REPLY_TO` | Optional plain reply-to address |
| `NEWSLETTER_TOKEN_SECRET` | A separate random secret, at least 32 characters |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin, `https://maheshlabs.io` |

3. Keep the token secret stable. Rotating it invalidates access cookies, personal watch links, and unsubscribe links in older emails. Generate secrets with `openssl rand -hex 32`; keep them out of Git and chat.
4. Restart/redeploy the server. Settings shows missing configuration. Save a newsletter, send a test to your own address, and inspect both inbox and spam before queuing a real delivery.

The provider adapter is isolated in `lib/newsletter-email.ts` if a different provider is chosen. No provider account, DNS records, credentials, or live sends are created by the implementation.

## Release an episode

1. Upload the full episode to YouTube as **unlisted**, with embedding enabled. Set its video ID in Studio.
2. Set **Public release** in India time. Publish the episode on the website so its teaser and description are visible. The full video and its chapters stay out of public page data until that time.
3. Save a newsletter and choose that episode under **Early-access episode**. Each subscribed recipient receives a signed link to the website; no subscriber account or password is required.
4. The access window opens 24 hours before public release. A blank newsletter send time uses that boundary, or now if the window is already open. Scheduling a future send requires the worker below; otherwise queue and process it manually during the window.
5. During early access, subscribers who missed the campaign or joined later can request an email link from the episode page. Requests are limited per IP and address; the response does not reveal list membership.
6. At public release, the site shows the full player and retires the teaser from playback automatically. Change the same video's visibility to public in YouTube Studio separately. The website does not control YouTube visibility or delete teaser files.

The reader cookie is HTTP-only, scoped to the chosen episode, expires at public release, and is checked against the current subscription on each request. Email links remain valid for seven days after release, then expire. Shared email or YouTube links can be forwarded: unlisted playback is early availability, not copy protection.

## Automatic queue processing

Manual delivery uses **Process next batch** in the newsletter editor. Each request processes up to five recipients within its time budget; larger lists need repeated requests.

For unattended sending, configure a scheduler to call `GET https://maheshlabs.io/api/cron/newsletters/` every minute with `Authorization: Bearer <CRON_SECRET>`. Use the trailing slash. Configure `CRON_SECRET` as a separate random secret of at least 32 characters, then set `NEWSLETTER_SCHEDULER_ENABLED=true` only after that scheduler is connected and tested. Enabling a variable does not create a scheduler. Delivery begins on the first successful worker run after the send time and may require multiple batches. Scale the worker and provider limits before sending to a large audience.

No hosting cron is registered automatically. If using Vercel, choose a scheduler frequency supported by the account plan; its Hobby cron frequency is insufficient for minute-level timing. A separate scheduler can call the authenticated endpoint without changing the app.

## Delivery operations

- Queuing snapshots the saved letter and the current subscribed audience together. Repeating a request for the same saved revision does not create another campaign. Save a changed draft to create a later campaign; finish or cancel the current campaign first.
- The worker rechecks suppression before every send. Each address receives its own email, personal access link, and unsubscribe link.
- Provider acceptance is tracked as **accepted**, not inbox delivery. Inbox placement, bounces, and complaints must be reviewed in the provider dashboard. Suppress affected addresses in Studio; automatic provider-event ingestion is not implemented.
- A provider failure pauses the campaign. **Retry failed** retries rejected messages only; **Continue remaining** resumes pending recipients. Accepted messages are excluded.
- Interrupted responses or workers are marked **need review** and are never automatically resent. Inspect the provider dashboard before arranging a replacement delivery. Provider idempotency keys add protection against repeated send requests.
- **Cancel remaining** stops pending messages; a message already being sent or accepted cannot be recalled. Already issued early-access links remain valid while the recipient stays subscribed.
- Unsubscribe GET shows a confirmation page. An explicit form POST or standard one-click unsubscribe POST suppresses the address. Subsequent signup attempts return a clear unsubscribed message instead of a false success. Rejoining needs an operator-assisted flow; automatic resubscription is not implemented.
- Daily news is editorial: write a new newsletter and choose its send time. The app does not generate news or send an unwritten recurring campaign.

## Validation

`npm run check` includes newsletter tests with a mocked database and provider: signatures, expiry, release boundaries, public data filtering, scoped cookies, HTML escaping, suppression, delivery failures, HTTP handlers, and endpoint authentication. No live emails are sent by these tests.

Run `npm run test:integration` only against an isolated `dev-*` Neon branch with a running app and `STUDIO_TEST_PASSWORD`. A successful real test email, migration, and live scheduler run are required before calling production delivery active.
