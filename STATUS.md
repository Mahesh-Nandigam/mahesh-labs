# Website status

Updated November 23, 2026.

- Next.js 16 App Router, React 19, TypeScript.
- Original editorial design and episode content preserved.
- Episode pages have a paper-and-blue player control bar with play/pause, 10-second skips, chapter markers, time, volume, playback speed, keyboard shortcuts, and fullscreen. YouTube loads after play or chapter selection. A settings button restores YouTube controls for captions and quality; playback position, speed, and mute are retained. YouTube’s own overlays remain provider-controlled.
- Playback speed uses a custom two-column menu with the current choice marked, matching paper colors, and keyboard navigation. The volume slider uses the same slim track and small thumb as the timeline.
- The hero features a carousel of released episodes, ordered latest to oldest from left to right. Titles use the full caption width and wrap naturally, with a single play button on the thumbnail. The left control moves to newer episodes and the right control to previous episodes, with episode dots, keyboard navigation, and touch swipes.
- Mahesh Moholkar’s supplied portrait appears in the hero and creator profile; the missing PNG reference was replaced with the actual optimized JPEG. Both instances were verified loaded in the browser.
- Both creators are featured in the hero. Profile content is centralized in lib/creators.ts.
- Mahesh Moholkar’s Website and LinkedIn links point to https://maheshmoholkar.in/ and https://www.linkedin.com/in/mahesh1822/.
- Co-creator wording replaces the restrictive behind-the-scenes/production label.
- The creator introduction reads “Two friends. One shared curiosity.” Its supporting paragraph sits beneath the heading in one left-aligned block. Navigation says “The creators.”
- Episode cards use 28–30px semibold titles, 15px guest names, 16px supporting text, and subtle blue episode badges. Each title and role stay together with consistent spacing; card footers align across each row. Tablet layouts use two columns. Creator cards have equal heights, including the mobile stack.
- Unreleased episode thumbnails use the selected editorial serif style: a gentle 1px blur, warm paper wash, and centered 36px italic Instrument Serif “Coming soon” text in the site’s ink color. Card playback links use “Teaser” or “Episode” with circular play icons and descriptive accessible labels.
- The favicon is a single M, with SVG, ICO, and Apple touch icon variants.
- “New episodes every Saturday” appears in the hero and subscription section.

Validation passed:

- Speed menu: real rate changes, arrow-key selection, Escape, Tab, outside-click dismissal, and focus return passed browser checks. The menu fits at 320px and 390px without page overflow.
- Custom player: real YouTube playback, pause, skips, speed, mute, chapter seeking and highlighting, fullscreen, and returning to YouTube controls were checked in the browser. At 320px and 390px, controls wrap without page overflow.
- Thumbnail blur is limited to unreleased episodes; released thumbnails remain sharp. Playback labels, icons, destinations, and layouts at 1280, 390, and 320px were checked in the browser, with no horizontal overflow.
- Episode card typography checked at 1280, 768, 390, and 320px: no page or card overflow, 10px title-to-role spacing, and aligned desktop footers. TypeScript, content checks, production build, and export checks passed after the update.
- Featured carousel: previous/next, episode dots, keyboard navigation, disabled boundaries, and play links checked in the browser. No horizontal overflow at 320, 390, or 1280px; inactive slides are hidden from keyboard and assistive technology.
- npm run check: TypeScript, all episode records, chapters, asset references, and icons.
- npm run build: optimized production build, homepage, all 3 episode routes, and 404.
- node scripts/check-export.mjs: generated HTML, chapter content, episode links, and route exports.
- Exported HTML was checked for the portrait in both locations, both supplied contact links, updated heading and roles, M icon metadata, and Saturday copy in both sections.
- Browser layout checks at 320, 390, 768, 1024, 1280, and 1920 CSS pixels: no horizontal overflow; episode card heights and footer positions match.
- Creator cards were checked on desktop and mobile, including equal 288px heights at 390px width after the final correction.
- All three episode pages were checked at 320px width: no overflow, correct titles and chapters, no broken images.
- Mobile filter, timed chapter search, and navigation open/close behavior passed.
- Mahesh Moholkar’s portrait was visibly verified in both locations at its actual 480×640 dimensions. No broken image elements were found.

The local preview at http://localhost:4173/ is running and was reviewed. No hosted deployment is claimed; publishing network restrictions remain unresolved. The existing private Site identity is retained. The source YouTube directory and original portrait remain unchanged.

Run npm run dev here. For a fresh checkout or ZIP, run npm install first. The ZIP includes the source and generated out/ folder.
