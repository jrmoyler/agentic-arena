import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { illustrationRecipe, renderCardIllustration } from "../assets/card-illustration-core.js";

const catalog = JSON.parse(await readFile(new URL("../data/card-art-catalog.json", import.meta.url), "utf8"));
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const counts = (values) => Object.fromEntries([...new Set(values)].map((value) => [value, values.filter((item) => item === value).length]));

assert.equal(catalog.length, 1200, "The canonical catalog must contain exactly 1,200 cards.");
assert.equal(new Set(catalog.map((card) => card.id)).size, 1200, "Every card ID must be unique.");
assert.match(index, /card-art-engine\.js/, "The production page must load the card-art engine.");
assert.match(index, /card-illustration-core\.js/, "The production page must preload the illustration core.");
assert.doesNotMatch(index, /faction-art-atlas/, "The production page must not reference the former shared atlas.");
await assert.rejects(
  access(new URL("../assets/faction-art-atlas.webp", import.meta.url)),
  "The former shared atlas must not exist on the artwork branch.",
);

const records = catalog.map((card) => {
  const input = { ...card, cardId: card.id, title: card.name };
  const recipe = illustrationRecipe(input);
  const svg = renderCardIllustration(input);
  const geometry = /<g class="aa-unique-geometry">([\s\S]*?)<\/g>/.exec(svg)?.[1] || "";
  return {
    ...card,
    recipe,
    svgHash: digest(svg),
    geometryHash: digest(geometry),
    hasId: svg.includes(`data-art-id="${card.id}"`),
    hasNameGlyph: svg.includes("aa-name-insignia"),
  };
});

assert.equal(new Set(records.map((record) => record.recipe.seed)).size, 1200, "Art seeds must not collide.");
assert.equal(new Set(records.map((record) => record.svgHash)).size, 1200, "Every rendered SVG must be structurally unique.");
assert.equal(new Set(records.map((record) => record.geometryHash)).size, 1200, "Every card must have distinct visible signature geometry.");
assert.ok(records.every((record) => record.hasId), "Every illustration must carry its canonical card ID.");
assert.ok(records.every((record) => record.hasNameGlyph && record.recipe.nameDerived), "Every illustration must include a name-derived insignia.");
assert.ok(records.every((record) => record.recipe.primary && record.recipe.secondary), "Every illustration must have two subject motifs.");
assert.ok(new Set(records.flatMap((record) => record.recipe.matchedThemes)).size >= 18, "The art direction must use the full semantic motif vocabulary.");

const semanticMatches = records.filter((record) => record.recipe.semanticTitleMatch).length;
const report = {
  catalogCards: records.length,
  uniqueCardIds: new Set(records.map((record) => record.id)).size,
  uniqueArtSeeds: new Set(records.map((record) => record.recipe.seed)).size,
  uniqueSvgIllustrations: new Set(records.map((record) => record.svgHash)).size,
  uniqueVisibleGeometries: new Set(records.map((record) => record.geometryHash)).size,
  nameDerivedIllustrations: records.filter((record) => record.recipe.nameDerived).length,
  semanticTitleMatches: semanticMatches,
  semanticTitleMatchRate: Number((semanticMatches / records.length).toFixed(4)),
  cardTypes: counts(records.map((record) => record.type)),
  compositions: counts(records.map((record) => record.recipe.composition)),
  motifVocabulary: new Set(records.flatMap((record) => record.recipe.matchedThemes)).size,
};

console.log(JSON.stringify(report, null, 2));
