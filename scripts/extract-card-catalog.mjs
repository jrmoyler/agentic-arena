import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = resolve(root, "assets/index-Tn-T5T8F.js");
const outputPath = resolve(root, "data/card-art-catalog.json");
const bundle = await readFile(bundlePath, "utf8");

const cardPattern = /\{id:`([^`]+)`,name:`([^`]+)`,type:`([^`]+)`,division:(null|\d+),faction:`([^`]+)`,role:`([^`]+)`.*?rarity:`([^`]+)`,aegis:`([^`]+)`/g;
const cards = [...bundle.matchAll(cardPattern)].map((match) => ({
  id: match[1],
  name: match[2],
  type: match[3],
  division: match[4] === "null" ? null : Number(match[4]),
  faction: match[5],
  role: match[6],
  rarity: match[7],
  aegis: match[8],
}));

if (cards.length !== 1200) {
  throw new Error(`Expected 1,200 cards in the production bundle, found ${cards.length}.`);
}

const ids = new Set(cards.map((card) => card.id));
if (ids.size !== cards.length) {
  throw new Error(`Catalog contains ${cards.length - ids.size} duplicate card IDs.`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
console.log(`Extracted ${cards.length} canonical cards to ${outputPath}.`);

