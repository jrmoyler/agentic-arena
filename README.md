# Agentic Arena

Agentic Arena is a tactical strategy card-battler based on Collective AI Inc's 20-division, 1,200-card universe.

The site is a playable classic duel: 8,000 Life Points, a 40-card deck, Draw through End phases, one Normal Summon, tributes at Level 5 and Level 7, Attack versus Defense math, Spells, and Traps that chain. Card names, factions, and illustrations stay the original Collective AI catalog. Nothing here copies another game's cards.

It is a progressive web app. After the first visit, install it from the browser (Add to Home Screen on iPhone, Install app on Android) and it opens full screen, including offline.

## Local preview

Serve the repository root with any static web server, for example:

```bash
npx serve .
```

## Deployment

The application is configured for Vercel through `vercel.json` and remains offline-first at runtime. `play.js` is the duel client. The production card bundle in `assets/` stays in the tree so the catalog extractor and the illustration audit can still verify all 1,200 cards.

## Card artwork integrity

The card renderer derives a complete vector illustration from each card's canonical ID, title, type, division, faction, and role. Run the exhaustive integrity gate with:

```bash
npm test
```

The gate fails on catalog drift, duplicate IDs, seed collisions, duplicate SVG output, duplicate visible geometry, missing name-derived insignia, or missing semantic title motifs.
