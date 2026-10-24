# Timeline / Monument Viewer

Opened when a miniature is clicked in the gallery (App.jsx -> page 'timeline').

- `monumentsData.js` registry; one file per monument in `monuments/`
- `MonumentViewer.jsx` screen layout + state
- `MonumentCanvas.jsx` R3F scene, lights, OrbitControls
- `ConstructionRig.jsx` timeline construction + explode spring (works on any Object3D)
- `MonumentModel.jsx` procedural / GLB / OBJ loading
- `POIMarkers.jsx`, `CameraRig.jsx`, `TimelineBar.jsx`, `ViewerToolbar.jsx`, `InfoDrawer.jsx`

## Add a monument
1. Copy `monuments/taj.js` to `monuments/<id>.js`, edit it.
2. Import it in `monumentsData.js`.
3. For a real model put the file in `public/models/` and set
   `model: { type: 'glb', path: '/models/<id>.glb', size: 14 }`.
   Phases then match meshes by name: `match: { names: ['dome', 'drum'] }`.

## Integration notes (KDUPDATEDOVERALL)
- Opened from `App.jsx` as page `'timeline'` when a monument is clicked (gallery scene, index list). `onLearn` goes on to the `'monument'` learning page.
- `models.js` here is the KAAL-DARPAN-UPDATED procedural model set (`makeMonument(id, { surroundings })`); the museum hall keeps using `src/models.js`.
- Colours follow `document.documentElement.dataset.theme` (`dark` | `light`): see the CSS variables at the top of `viewer.css`, `useViewerTheme.js` (3D scene palette) and `TimelineBackdrop.jsx` (low-opacity MandalaRing / JaaliTexture / Chakra).
- Type: Cinzel (loaded from Google Fonts in `index.html`) for year labels, event titles and drawer headings; Manrope for reading text.
- Tailwind v4 (no preflight) is only used by this folder; `postcss.config.js` is at the repo root.
