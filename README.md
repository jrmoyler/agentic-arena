# Agentic Arena

Agentic Arena is a tactical strategy card-battler based on Collective AI Inc's 20-division, 1,200-card universe.

This repository begins from the verified static production build deployed at [agentic-arena-iota.vercel.app](https://agentic-arena-iota.vercel.app). The production baseline is intentionally preserved on `main`; visual-system upgrades are developed in reviewable feature branches.

## Local preview

Serve the repository root with any static web server, for example:

```bash
npx serve .
```

## Deployment

The application is configured for Vercel through `vercel.json` and remains offline-first at runtime.

## Card artwork integrity

The card renderer derives a complete vector illustration from each card's canonical ID, title, type, division, faction, and role. Run the exhaustive integrity gate with:

```bash
npm test
```

The gate fails on catalog drift, duplicate IDs, seed collisions, duplicate SVG output, duplicate visible geometry, missing name-derived insignia, or missing semantic title motifs.
