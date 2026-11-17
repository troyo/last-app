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
| `src/lib/demo-catalog.json` | The list of every guide, which topic it's in and which pack it belongs to |
| `src/lib/catalog.ts` | Reads the catalog. Packs stack up: Medium = Small + more, Large = Medium + more |
| `src/lib/library.ts` | Downloads each file to the phone, checks it, and tracks what's saved |
| `src/lib/LibraryContext.tsx` | Shares download progress with every screen, keeps the screen awake while downloading |
| `src/app/index.tsx` | Home: topics + search (only shows what's actually on the phone) |
| `src/app/packs.tsx` | Pick / switch / pause / delete packs, with a free-space check |
| `src/app/topic/[id].tsx` | List of guides in a topic |
| `src/app/item/[id].tsx` | Reader: articles, videos (built-in player) and PDFs (phone's own viewer) |

Design choices worth knowing:

- **Each guide is its own file**, not one giant zip. A dropped connection only costs the file you
  were on, and you never need double the space to unzip.
- **Nothing is fetched while reading.** Articles are cleaned on download (scripts, styles, remote
  images removed) and shown with network requests blocked.
- **Switching to a smaller pack frees the space immediately.**
- Items can carry a `sha256` so damaged downloads are caught.

## Demo content

The demo packs use ~44 Wikipedia articles (CC BY-SA 4.0) as stand-ins so you can test the full
flow. Real packs (PDFs, videos, maps) plug into the same catalog format: add items with
`"type": "pdf"` or `"type": "video"` and a URL you're allowed to distribute.

## Not done yet

- Real content packs + somewhere to host them
- Background downloads (keep going when the app is closed)
- Offline maps
- Full-text search inside articles (right now search matches titles)
- App icon, name, store listings
