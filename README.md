# Last App (prototype)

An offline survival guide for iPhone and Android. Pick a **Small**, **Medium** or **Large** pack,
download it once, and everything works with no internet.

Built with [Expo](https://expo.dev) (React Native), so one codebase makes both the iPhone and the
Android app.

## Try it on your phone (about 10 minutes)

1. Install [Node.js](https://nodejs.org) (the LTS version) on your computer.
2. Install the **Expo Go** app on your phone (App Store / Google Play).
3. In a terminal, in this folder:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR code with your phone camera (iPhone) or the Expo Go app (Android).
5. Tap **Choose a pack → Download Small**, wait for "Ready offline", then turn on
   **airplane mode** and browse. That's the whole point.

To preview in a desktop browser instead: `npx expo install react-dom react-native-web @expo/metro-runtime`
then `npx expo start --web` (browser storage is in-memory only, it's just for looking at screens).

## How it's put together

| File | What it does |
| --- | --- |
| `src/lib/demo-catalog.json` | A tiny built-in catalog so the app works before the real packs are published |
| `src/lib/config.ts` | Where the app looks for the published catalog |
| `tools/build-packs.mjs` | Builds the real packs from `packs/sources.json` |
| `.github/workflows/build-packs.yml` | Runs the builder on GitHub and publishes the packs |
| `src/lib/catalog.ts` | Reads the catalog. Packs stack up: Medium = Small + more, Large = Medium + more |
| `src/lib/library.ts` | Downloads each file to the phone, checks it, and tracks what's saved |
| `src/lib/LibraryContext.tsx` | Shares download progress with every screen, keeps the screen awake while downloading |
| `src/app/welcome.tsx` | First-launch explainer (three swipeable pages) |
| `src/app/(tabs)/index.tsx` | Guides tab (home): topics + search |
| `src/app/(tabs)/about.tsx` | About tab: how it works and why to trust it |
| `src/components/ui.tsx` | Shared buttons, cards and gentle animations |
| `src/lib/theme.ts` | Colors (warm cream, deep green, a little sunshine) |
| `tools/icon/generate-art.js` | Draws the app icon and illustrations |
| `src/app/(tabs)/packs.tsx` | Pick / switch / pause / delete packs, with a free-space check |
| `src/app/topic/[id].tsx` | List of guides in a topic |
| `src/app/item/[id].tsx` | Reader: articles, videos (built-in player) and PDFs (phone's own viewer) |
| `src/app/sources.tsx` | Sources & licenses (credits every source) |

Design choices worth knowing:

- **Small downloads, not one giant zip.** Articles come in ~20 MB bundles and PDFs one by one, so a
  dropped connection only costs the file you were on, and you never need double the space to unzip.
- **Nothing is fetched while reading.** Articles are cleaned when the packs are built (scripts and
  remote files removed, pictures stored inside the article) and shown with network access blocked.
- **Switching to a smaller pack frees the space immediately.**
- Every download has a `sha256` checksum, so damaged downloads are caught.
- Links between saved guides work offline.

## Free and paid

Small is free. One purchase (`all_packs_unlock`, planned at $19.99) unlocks Medium and Large.
All of that lives in `src/lib/purchases.ts`. **It is currently in test mode: "Unlock" charges
nobody.** Before release, wire `purchase()` and `restore()` to real App Store / Google Play
purchases (for example with RevenueCat) and set `TEST_MODE` to false.

## Content packs

All content is free to share: US government guides (public domain) and
Wikipedia / MDWiki articles (CC BY-SA 4.0). The list lives in
[`packs/sources.json`](packs/sources.json), with the license for every source.

| Pack | What's in it | Rough size |
| --- | --- | --- |
| Small | ~46 core guides with pictures (first aid, water, fire, shelter, kit) + FEMA "Are You Ready?", Army First Aid TC 4-02.1, CDC safe water sheet | ~50 MB |
| Medium | Small + ~90 more guides + Wikibooks handbooks (first aid, survival, knots) + Army/Marine survival manuals, land navigation, FEMA CERT, USDA canning | ~250 MB |
| Large | Medium + ~75 more guides + all of MDWiki (medical encyclopedia) + Appropedia (DIY, off-grid) + Wikibooks cookbook, gardening, electronics + SERE manuals | ~2 GB |

Pictures come only from Wikimedia Commons (freely licensed) and are stored inside each article.

Sizes are estimates until the first real build. `REPORT.md` on each release has the exact numbers.

### Building the packs

GitHub builds and hosts them, so nobody needs a server:

1. Repo **Actions** tab, **Build content packs**, **Run workflow**.
   Tick "Quick test run" the first time (takes a couple of minutes).
2. The workflow downloads every source, checks it's really a PDF / article, cleans
   articles so they work offline, and publishes a **Release** with the files plus
   `catalog.json` and `REPORT.md` (what worked, what failed).
3. The app fetches `releases/latest/download/catalog.json`, so a new full run
   updates every phone's pack list with no app update.

The repo must be **public** so phones can download release files without logging in.

To run it on your own computer instead: `node tools/build-packs.mjs` (Node 20+).

### Adding a source

Add it to `packs/sources.json` with its license. Only add things that are
public domain or openly licensed for redistribution. If you're unsure, set
`"needsReview": true` and it'll be skipped until someone checks.

## Not done yet

- Background downloads (keep going when the app is closed)
- Offline maps (OpenStreetMap, pick your state)
- All of Wikipedia (needs a reader for its offline dump format)
- Videos (need sources that allow redistribution)
- Full-text search inside articles (right now search matches titles)
- Real store purchases (needs Apple + Google developer accounts)
- Move paid packs to hosting that checks the purchase (they're public downloads right now)
- App icon, name, store listings
