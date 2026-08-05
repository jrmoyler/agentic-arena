import { readFile, writeFile } from "node:fs/promises";
import { renderCardIllustration } from "../assets/card-illustration-core.js";

const catalog = JSON.parse(await readFile(new URL("../data/card-art-catalog.json", import.meta.url), "utf8"));
const wanted = [
  "d01-overseer-axis",
  "d01-action-01",
  "d02-specialist-market-expansion-agent",
  "d03-specialist-curriculum-architect",
  "d04-specialist-brand-narrative-agent",
  "d05-ultimate",
  "d06-ultimate",
  "d08-arena",
  "d10-mission",
  "d15-specialist-robot-learning-agent",
  "synergy-01",
  "neutral-01",
];
const samples = wanted.map((id) => catalog.find((card) => card.id === id)).filter(Boolean);
if (samples.length !== wanted.length) {
  const missing = wanted.filter((id) => !samples.some((card) => card.id === id));
  throw new Error(`Missing contact sheet cards: ${missing.join(", ")}`);
}

const cellWidth = 410;
const cellHeight = 335;
const columns = 4;
const rows = Math.ceil(samples.length / columns);
const panels = samples.map((card, index) => {
  const x = (index % columns) * cellWidth;
  const y = Math.floor(index / columns) * cellHeight;
  const art = renderCardIllustration({ ...card, cardId: card.id, title: card.name })
    .replace("<svg ", `<svg x="18" y="18" width="374" height="255" `);
  const safeName = card.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const safeMeta = `${card.faction} · ${card.type}`.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  return `<g transform="translate(${x} ${y})">
    <rect x="8" y="8" width="394" height="319" rx="12" fill="#070b15" stroke="#d4a843" stroke-opacity=".5" stroke-width="2"/>
    ${art}
    <text x="20" y="294" fill="#f5f5f5" font-family="Arial,sans-serif" font-size="17" font-weight="700">${safeName}</text>
    <text x="20" y="316" fill="#8b9bae" font-family="Arial,sans-serif" font-size="11" letter-spacing="1">${safeMeta.toUpperCase()}</text>
  </g>`;
}).join("");

const output = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns * cellWidth}" height="${rows * cellHeight}" viewBox="0 0 ${columns * cellWidth} ${rows * cellHeight}">
  <rect width="100%" height="100%" fill="#050a18"/>
  ${panels}
</svg>`;

const outputPath = process.argv[2] || "/tmp/agentic-arena-card-art.svg";
await writeFile(outputPath, output, "utf8");
console.log(outputPath);
