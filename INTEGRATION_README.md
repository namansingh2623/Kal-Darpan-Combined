# Kaal Darpan combined site

## Sources

- Base: `kaal darpan final 1 siddh.zip` (its `kaal-darpan-plan-my-visit/kaal-darpan` project).
- GPS: `KAAL_DARPAN_INTEGRATED_GESTURES_BESIDE_EXPLODE (1).zip`, specifically its MapLibre atlas source and styles.
- Pricing/demo: `kaal-darpan-integrated-pricing-billing (2) (1).zip`, specifically its pricing pages, demo checkout, Macerena link, and optional billing API server.

The base site's learning content, images, narration bundle, monument models, gallery, timeline, and visit planner remain in place.

## Run locally

Use Node.js compatible with Vite 8 (Node 20.19+ or 22.12+).

```sh
cd KAAL_DARPAN_COMBINED
npm ci
npm run dev
```

Open `http://localhost:5175/`. The pricing page is at `/kaal-darpan-pricing/index.html`. Choose Pro to open its separate demo order page. Completing the **demo** sets a browser-local access flag, reveals a direct Macerena link on the success page, and changes the Macerena links on the homepage and gallery to `https://macerena-96e83.web.app/`. This is local demo access only; it is not payment verification or access control on the Macerena site.

The GPS atlas uses MapLibre GeoJSON layers for monument dots and labels, with `[longitude, latitude]` coordinates. Its full-map shade overlay was removed. The user's location is requested only after selecting **Use my location**. If no landmark is within 100 km, all landmark markers remain visible and the map stays at the heritage collection. Location requires browser permission and HTTPS or localhost.

## API configuration

The `.env.local` file is intentionally excluded. To enable the main site's development APIs, create one in this folder with:

```dotenv
GEMINI_API_KEY=
SARVAM_API_KEY=
OPENWEATHER_API_KEY=
```

The chat (`/api/chat`), weather (`/api/weather`), and Hindi/Tamil narration (`/api/narration`) endpoints are Vite middleware in development and preview. English narration uses the bundled audio files. The map basemap requires access to OpenStreetMap tiles.

The optional Stripe/SMTP scaffold lives in `pricing-billing-server/`. Install it separately, copy its `.env.example` to `.env`, supply your own server-side test credentials, and run `npm start` there to serve API routes on port 8000. Vite proxies `/api/health`, `/api/config`, `/api/create-payment-intent`, `/api/order-confirmation-status`, and `/api/stripe-webhook` to it. The copied demo checkout does not call Stripe or send an email. The scaffold's PaymentIntent is a **one-time payment** and does not create an automatically renewing subscription. Production billing, entitlements, and deployment routing require further implementation and valid provider credentials. Never enter a real card in the demo.

## Verification performed

- `npm ci`, `npm run build`, and `npm run lint` passed.
- English narration bundle verification passed: 97/97 expected clips. Four Jantar Mantar clips missing from the supplied base were generated locally with the macOS Rishi voice and added to the manifest; their timbre may differ from the older bundled narration.
- Browser: homepage, pricing, Pro demo order, unlocked Macerena links, GPS map and Jantar Mantar marker selection, museum, Taj Mahal timeline, live weather panel, and visit planner rendered and responded.
- API smoke tests using the final archive's temporary keys: chat 200 with a Gemini reply; weather 200 with current data and five forecast days; Hindi narration 200 with `audio/mpeg`; missing weather coordinates 400.
- Billing server health returned 200 with `stripeConfigured: false` and `emailConfigured: false`; payment routes returned 503 as expected without Stripe keys. No live payment or email was attempted.
- The external Macerena URL returned HTTP 200 during a read-only availability check.
- Live browser geolocation returned an unavailable-location message in the test browser. Actual GPS coordinates and permission behavior need testing on a device with location access.

The source archives supplied API keys in ignored environment files. They were used temporarily for local smoke tests and are **not included** in this project or ZIP.
