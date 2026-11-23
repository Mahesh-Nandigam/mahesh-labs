# MaheshLabs

Podcast website for Mahesh Nandigam and Mahesh Moholkar, built with Next.js 16 App Router, React 19, and TypeScript. Preserves the finalized blue pill brand and the existing editorial homepage.

## Development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:4173.

## Build and run

```sh
npm run check
npm run build
node scripts/check-export.mjs
npm start
```

`next build` prerenders the homepage and every episode into `out/`. `npm start` serves that exported website; development uses the actual Next.js dev server. The site currently needs no backend or runtime secrets.

## Structure

- `app/layout.tsx`: global metadata, font links, header, and footer.
- `app/page.tsx`: homepage, composed from React components.
- `app/episodes/[number]/page.tsx`: episode pages, static parameters, and per-episode metadata.
- `app/globals.css`: existing responsive design.
- `components/`: homepage sections, episode filters, chapter search, YouTube player, sharing, and mobile navigation.
- `content/episodes.json`: the single source for episode metadata, chapters, and guest links.
- `lib/episodes.ts`: typed episode model, sorting, chapter search, and URL helpers.
- `public/assets/`: the original brand and episode artwork.

Episode links are `/episodes/1/`, `/episodes/2/`, `/episodes/3/`, and `/episodes/4/`. Episode 1 is an archive placeholder linked to its original YouTube upload. Earlier `#episode-2` links on the homepage continue to open the matching episode. Episode content is present in the initial rendered HTML. Filters, search, sharing, navigation, and the player use React state; the former DOM manipulation script and JSON fetch are removed.

## Episode data

Episode 2 (`kMeQgxn6R4w`) and episode 3 (`4rsdSg4dU9g`) were verified on the actual YouTube channel on November 23, 2026. Episode 4 has no confirmed public video link and stays marked coming soon. Set its `videoId` in `content/episodes.json` when it is published. Search covers the chapters of published episodes; episode previews include the upcoming chapters.

The archive is maintained locally, without automatic YouTube synchronization. The privacy-enhanced YouTube player loads only after pressing Play. The actual guest links and MaheshLabs X contact are retained. The source YouTube/media project is untouched.

## Deploy

On Vercel, leave the Root Directory at `./` (this repository’s root) and let it detect Next.js. The build command is `npm run build`. For other static hosts, deploy the generated `out/` directory. The existing private Site identity is preserved in `.openai/hosting.json` and its output directory is now `out`.

Set `NEXT_PUBLIC_SITE_URL` to the final origin before building for a custom domain, so social image URLs and episode metadata use the correct address. See `.env.example`.

Google Fonts loads DM Sans and Instrument Serif in the browser, with system fallbacks. Font availability does not block the production build.

## Creators and release schedule

`lib/creators.ts` owns both creator profiles, portraits, roles, and social links. The same data drives the hero byline and creator cards. The website announces new episodes every Saturday in the hero and subscription section.

The portrait is an optimized copy of the supplied photograph. The single-M favicon is defined in `public/icon.svg`, with ICO and Apple touch variants alongside it.

## Episode 1 and the upcoming conversation

Episode 1 links to its original YouTube upload (`fuUFEIzRTbM`), with placeholder notes and artwork. EP4 includes the existing 52-second H.264/AAC teaser in `public/media/episode-04-teaser.mp4`; the full episode remains marked coming soon. J Prakash’s updated open-source-to-remote-job thumbnail is used throughout the site.

## Project vision

the most valuable insights in the world never make it to the public. they stay locked in private rooms with the top 0.1% — the founders, builders, and thinkers who actually know how things work.

mahesh labs is a podcast studio built to change that.

we bring in the top 0.1% for raw, unfiltered conversations to democratize the concentrated knowledge that usually stays behind closed doors. no rehearsed answers, no surface-level pr. just how real things get built, solved, and scaled.

we are currently building the website to house every episode, breakdown, and insight for everyone.

more soon.
