# Merged Kaal Darpan project

This folder combines the two supplied project archives.

## Merge strategy
- Preserved the `CLAUDEKD.zip` application as the primary source for the Heritage Atlas, GPS/map route, language toggle, and gallery exhibit metadata.
- Added narration/read-aloud modules and bundled English narration assets from `zip.zip`.
- Combined Vite server plugins so Gemini, OpenWeather, and Sarvam narration routes can coexist.
- Added on-demand read-aloud to the monument history panel. Narration is user-triggered and stops when the active page, monument, tab, or hotspot changes.
- Combined package dependencies and retained the source files from both archives where they were unique.

## Setup
1. Install Node.js compatible with the project's Vite version.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add only the API keys you intend to use.
4. Run `npm run dev`; production build: `npm run build`.

The `.env.local` from the supplied archives is intentionally not included so private API keys are not redistributed. The lockfile may need refreshing after dependency reconciliation (`npm install`).


## Follow-up merge: points of interest and audio
- Combined the audio-enabled ZIP with this consolidated project rather than creating a separate project.
- Preserved the consolidated project’s existing React/i18n UI and POI components as the canonical versions.
- Added the narration audio cache from the supplied ZIP under `.cache/narration/`.
- Filled any other missing source/runtime assets without overwriting existing consolidated files.
- POI marker rendering and monument POI data remain in `src/viewer/POIMarkers.jsx` and `src/viewer/monuments/`; POI photos are in `public/images/poi/`.
