# 1,200-card illustration system

## Acceptance contract

The artwork pipeline treats the production catalog as canonical and enforces:

- exactly 1,200 card records;
- 1,200 unique canonical IDs;
- 1,200 unique rendered SVG illustrations;
- 1,200 unique visible geometry fingerprints;
- 1,200 title-derived insignias;
- 1,200 semantic title matches;
- all 20 faction environments and all eight card-type compositions;
- zero dependency on the former 20-image faction atlas.

## How a card becomes an illustration

Each render combines five independent inputs:

1. **Title semantics** — keywords select two recognizable motifs from an 18-family vocabulary, including command, architecture, law, biology, education, finance, robotics, ecology, cognition, time, transit, defense, media, compute, energy, community, and objectives.
2. **Canonical identity** — the full card ID and title seed unique signature geometry; any collision fails CI.
3. **Faction environment** — each division supplies its own palette and environment silhouette.
4. **Card type** — Specialists, Actions, Overseers, Missions, Ultimates, Arenas, Synergy Nodes, and Neutral Systems use different composition grammars.
5. **Role** — Guardian, Architect, Analyst, Operator, Creator, Coordinator, Support, System, Reaction, and protocol roles alter the subject treatment.

Synergy Nodes resolve both concepts around the multiplication mark. Repeated names across factions remain visually distinct because faction and canonical ID are also illustration inputs.

## Visual direction

The existing etched black-metal card frame, dark navy field, restrained gold trim, faction color, foil response, particles, and cinematic upper-half hierarchy are preserved. The former shared raster crops are replaced by detailed tactical-vector scenes so every card can remain name-aware, deterministic, lightweight, offline-capable, and independently auditable.

## Verification

`npm test` re-extracts the canonical catalog from the shipped application bundle and executes the full illustration audit. `scripts/render-art-contact-sheet.mjs` creates a representative visual sheet from the same production renderer for design review.

