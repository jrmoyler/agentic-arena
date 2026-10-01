# Agentic Arena

Agentic Arena is a tactical strategy card-battler based on Collective AI Inc's 20-division, 1,200-card universe.

The site is a playable classic duel: 8,000 Life Points, a 40-card deck, Draw through End phases, one Normal Summon, tributes at Level 5 and Level 7, Attack versus Defense math, Spells, and Traps that chain. Card names, factions, and illustrations stay the original Collective AI catalog. Nothing here copies another game's cards.

It is a progressive web app. After the first visit, install it from the browser (Add to Home Screen on iPhone, Install app on Android) and it opens full screen, including offline. Offline support requires a successful initial service-worker installation on HTTPS or localhost; clearing browser storage removes downloaded assets.

## Local preview

Serve the repository root with any static web server, for example:

```bash
npx serve .
```

## Deployment

The application is configured for Vercel through `vercel.json` and remains offline-first at runtime. `play.js` is the duel client. The production card bundle in `assets/` stays in the tree so the catalog extractor and the illustration audit can still verify all 1,200 cards.

The service worker uses network-first requests with an offline cache fallback. The v3 cache includes the artwork engine and illustration dependencies. Activation removes only older `agentic-arena-duel-` caches. Missing offline documents fall back to the app shell; missing assets return a network error instead of HTML. No saved-game schema or duel rules change in this update.

## Verification

Use Node.js 22 or newer. Run syntax checks, service-worker regression tests, catalog extraction, and the exhaustive artwork gate:

```bash
npm test
```

Run only the offline regression suite:

```bash
npm run test:offline
```

Install the pinned browser-test dependency and Chromium, then run real-browser startup checks:

```bash
npm install --ignore-scripts --no-audit --no-fund --package-lock=false
npx playwright install --with-deps chromium
npm run test:browser
```

The browser suite starts and stops its own local server. It checks desktop and mobile-sized Chromium viewports, a rendered game root, enabled buttons, uncaught browser errors, offline reload, and offline availability of the artwork modules and all 1,200 catalog entries. It explicitly registers the service worker to isolate offline behavior; it does not prove automatic client registration. Failures attempt to save `playability-failure-<width>.png`.

The existing CI workflow runs `npm test`. Browser checks must currently be run separately; the attempted workflow extension was not applied. No dedicated linter or static type checker is configured; `npm run check` validates JavaScript syntax only.

### Remaining release acceptance checks

These are requirements, not claims of completed testing:

- [ ] Complete a player-versus-AI match through a win or loss and restart successfully.
- [ ] Verify phase progression, draw rules, summon limits, tributes, battle math, spells, and trap chains.
- [ ] Verify illegal actions cannot corrupt state or stall the opponent turn.
- [ ] Verify automatic service-worker registration without test assistance.
- [ ] Complete an offline match after the initial online installation.
- [ ] Verify touch controls, keyboard access, readable card details, and layout on physical mobile devices.
- [ ] Run the browser suite and existing CI successfully before leaving draft status.

Startup smoke tests are not full gameplay coverage, accessibility certification, performance certification, or an AAA-quality claim. The bundled duel client is preserved; deeper gameplay changes require readable source and characterization coverage first.

## Card artwork integrity

The card renderer derives a complete vector illustration from each card's canonical ID, title, type, division, faction, and role.

The artwork gate fails on catalog drift, duplicate IDs, seed collisions, duplicate SVG output, duplicate visible geometry, missing name-derived insignia, or missing semantic title motifs.
