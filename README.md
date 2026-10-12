# wills — portfolio

A minimal, dark, terminal-flavoured developer portfolio for **Wills Ekanem**, inspired by the look and feel of [heyamit.dev](https://www.heyamit.dev/): near-black background (`#0d0e0f`), monospace type, lowercase copy, a single narrow column and tab-style navigation.

## Quick start
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
npm run preview
```
Deploy to Vercel by importing the repo (framework preset: Vite).

## Tech
| Tool | Why |
|---|---|
| React 18 | UI and tab state |
| Vite 5 | dev server and build |
| Plain CSS (`src/styles.css`) | tiny, no CSS framework, theme via CSS variables |
| JetBrains Mono | the monospace font (Google Fonts) |
| GitHub REST API | live stats, fetched in the browser (no token needed) |

## Sections
A single scrolling page styled like a terminal session (each section header is a shell command), mirroring heyamit.dev:
- **intro** – ASCII logo, one-line bio, a `▸ building …` line (latest pushed repo, live), skill chips, contribution heatmap and total from the last year.
- **`$ cat experience.log`** – role entries, edited in `src/data.js` (see note below).
- **`$ ls projects/`** – cards built live from the GitHub API: your public non-fork repos plus orgs in `me.orgs` (homedork-se2).
- **`$ cat contributions.md`** – `/open` and `/closed` tabs listing your pull requests to *other people's* repos, live from GitHub search.
- **`$ ls photos/`** – VSCO gallery with lightbox; each photo links to its own VSCO page.
- **`$ cat why-hire-me.md`** – short bullet pitch.
- **`$ cat hire.me`** – mail form (to / from / subject / message / send) that opens your mail client addressed to ekanemwills1@gmail.com. No backend needed.

## Customising
Almost everything lives in `src/data.js`: name, bio, skills, projects, links and photos.
Colours are the CSS variables at the top of `src/styles.css`.

### VSCO photos
VSCO has no public API, blocks hotlinking and returns **403 to plain scripts**, so photos are synced with a real headless browser (Playwright) *on your machine*, then committed:
```bash
npm install
npx playwright install chromium     # one-time browser download
npm run sync:photos                 # or: npm run sync:photos -- --headed  (visible window, if headless gets blocked)
git add public && git commit -m "sync vsco photos" && git push
```
`scripts/sync-vsco.mjs` opens `vsco.co/draxler606/gallery`, scrolls to load everything, captures the image data, downloads each image into `public/photos/` and writes `public/photos.json`. You can also paste individual image links (one per line) into `vsco-links.txt`; each is resolved via its `og:image`. Every photo opens in a lightbox with an "open on vsco" link to its own VSCO page.
Vercel just serves the committed files (no browser needed at build time). Re-run the sync whenever you post new photos. If VSCO changes its markup and nothing is found, use `vsco-links.txt`.

## Structure
```
index.html
src/main.jsx   entry
src/App.jsx    layout, GitHub loader, all sections
src/data.js    your content
src/styles.css theme
public/photos  gallery images
```

## Notes / to verify
- LinkedIn blocks automated access, so it is linked but not imported. The `experience` and `why` entries in `src/data.js` are **drafts inferred from your public repos**: replace them with your real roles, dates and reasons.\n- The VSCO sync could not be tested against VSCO from my environment; run it once and check the output.
