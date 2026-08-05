const PALETTES = [
  ["#41e6d0", "#188cff", "#07182a"], ["#e0b95b", "#6f8cff", "#171126"],
  ["#ffb86b", "#a56bff", "#21112a"], ["#ff4fa3", "#7d5cff", "#220d22"],
  ["#e4bd62", "#58a6a6", "#18201d"], ["#43e3a1", "#65a9ff", "#071f1b"],
  ["#6ba8ff", "#b66bff", "#0b132b"], ["#f5c65b", "#4bdfc5", "#151b20"],
  ["#ff9f43", "#ff4f67", "#27100e"], ["#a57cff", "#d8b4ff", "#100b20"],
  ["#e6c05c", "#67b7ff", "#151b27"], ["#55d9ff", "#8a7cff", "#071929"],
  ["#74d65c", "#37c89d", "#092116"], ["#ffb04a", "#4bd6cf", "#211709"],
  ["#35d7ff", "#8f73ff", "#071828"], ["#d8ae63", "#ef6b79", "#241114"],
  ["#ff5fa2", "#ffb15c", "#25101a"], ["#4fe0c2", "#ffd166", "#10201c"],
  ["#8ec5ff", "#caa8ff", "#11152a"], ["#85a8ff", "#ec8cff", "#151329"],
];

const ENVIRONMENTS = [
  "lattice", "strategy", "academy", "studio", "megacity", "biolab", "server",
  "exchange", "kinetic", "blacksite", "civic", "aether", "ecosystem", "transit",
  "foundry", "tribunal", "signal", "horizon", "temporal", "cognitive",
];

const STOP_WORDS = new Set([
  "agent", "and", "the", "of", "for", "to", "a", "an", "system", "specialist",
  "protocol", "directive", "window", "engine", "platform", "infrastructure", "service",
  "alpha", "beta", "gamma", "delta", "node", "core", "total", "full", "every",
]);

const THEME_RULES = [
  ["antenna", /signal|relay|network|mesh|beacon|broadcast|radio|podcast|media|newsletter|communication|audience|distribution|transmission|channel|aether|bandwidth|link state|voice|speech|translation|babel|language|localization|connectivity/i],
  ["command", /command|director|coordinator|manager|management|overseer|axis|priority|control|orchestrat|leadership|executive|consult|enterprise accord|alignment brief|client intake|change management|retainer/i],
  ["structure", /architect|build|construction|structure|housing|city|urban|zoning|facility|campus|megaplan|development|real estate|terra|sector|foundation|site survey|fortification|master plan|property|tenant|vacancy|habitat/i],
  ["scales", /legal|juris|law|compliance|audit|policy|regulat|consent|contract|governance|accredit|court|justice|tribunal|injunction|precedent|due process|evidence|appeal|ruling|supreme|terms|diligence|litigation|liability|ethical|ethics|insurance/i],
  ["helix", /health|medical|bio|helix|gene|care|wellness|triage|regenerat|vital|clinical|patient|therapy|nutrition|dose|homeostasis|recovery loop|recovery window|wearable|genomics|physiology|senostatic|autophagy|neuro-pulse|formulation/i],
  ["codex", /learning|curriculum|tutor|course|student|training|education|knowledge|study|mentor|certif|assessment|lesson|scholar|mastery|capstone|skill|practice|graduation|onboarding|trainer|coach|prompt|proposal|writer|stem/i],
  ["ledger", /market|revenue|finance|financial|ledger|capital|invest|pricing|economic|sales|monetiz|wealth|fund|portfolio|account|value map|liquidity|yield|closing bell|alpha position|options|quantitative|treasury|asset correlation|quantum exchange|trading|cost engineering/i],
  ["automaton", /robot|drone|mechatronic|servo|assembly|autonomous|physical|embodiment|manufactur|machine|android|swarm|prime|chassis|titan|materialization|actuator|tactile|sensing/i],
  ["leaf", /climate|ecolog|gaia|forest|biodiversity|ecosystem|agricultur|water|green|planet|bloom|cultivat|nature|carbon|soil|seed bank|food|farm|weather|pest|fertilization/i],
  ["mind", /mind|cognit|behavior|psycholog|emotion|neural|prediction|insight|sentiment|mental|choice|bias|memory|cognara|pattern|pressure point|natural language|hallucination|diagnostic|research|evaluation|intersectionality|persuasion/i],
  ["hourglass", /time|eon|legacy|inheritance|longevity|timeline|archive|future|history|continuity|succession|epoch|continuance|eternal|record|long horizon/i],
  ["compass", /route|transit|logistic|cargo|fleet|mobility|travel|relocat|nomad|delivery|transport|supply|navigation|expansion|atlas|vector|wayfinder|border crossing|without borders|mobile haven|open horizon|express lane|extraction point|pathfinder|last mile|disposition/i],
  ["shield", /security|threat|defen|shield|aegis|lockdown|contain|risk|safe|privacy|fraud|protect|integrity|resilien|sentinel|blackwall|bastion|countermeasure|red alert|sequence lock|cold storage|fallback|redundant|emergency|recovery point|incident response|vulnerability|red team|soc|penetration|identity|access|crisis|reliability|backup|disaster/i],
  ["lens", /content|story|narrative|creative|editorial|video|film|documentary|brand|creator|design|visual|production|studio|nexus|viral|myth|culture pulse|premiere|final edit|influencer|repurpos|sponsor|advertis|paid search|truth lens|campaign pulse/i],
  ["compute", /data|analytic|intelligence|model|compute|digital|software|code|debug|algorithm|automation|api|cloud|stack|deployment|lattice|zenith|loom|compiler|hotfix|module|release train|release engineering|rollback|pipeline|devops|developer|integration|versioning|observability|maintenance|system patch|storage|standard|routine|adapter|sandbox|cache|tool|custom script|load balancing|edge computing|field service|cro testing/i],
  ["bolt", /energy|kinetic|power|momentum|performance|sport|fitness|speed|velocity|strength|movement|peak|apex|activation|transformation sprint|ascension|perfect form|fast break|tempo|final rep|streak|limit break|bandwidth surge|cta surge|adaptation|stress/i],
  ["collective", /community|public|civic|trust|social|partnership|customer|client|human|peer|cohort|alumni|engagement|outreach|commons|common protocol|mutual aid|open forum|shared resource|consensus|common ground|liaison|volunteer|donor|non-profit|partner|employer|relations|equity|impact|small business|support/i],
  ["target", /mission|goal|objective|outcome|roadmap|benchmark|success|conversion|growth|optimization|quality|synchronize|complete|sustain|stabilize|funnel|retention|establish|enrollment|subscription product|returns/i],
];

const ROLE_THEME = {
  guardian: "shield", architect: "structure", analyst: "mind", operator: "compute",
  creator: "lens", coordinator: "command", support: "collective", system: "compute",
  reaction: "bolt", protocol: "compute", objective: "target", ultimate: "bolt",
  arena: "structure", "division commander": "command", "cross-division": "collective",
};

export function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function tokenGlyph(title) {
  const tokens = title
    .replaceAll("×", " ")
    .replaceAll("&", " ")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token.toLowerCase()));
  const useful = tokens.length ? tokens : title.split(/\s+/).filter(Boolean);
  return useful.slice(0, 3).map((token) => token[0]?.toUpperCase()).join("") || "AA";
}

export function resolveArtDirection(card) {
  const title = String(card.title || card.name || "Unknown Card");
  const titleMatches = THEME_RULES.filter(([, pattern]) => pattern.test(title)).map(([theme]) => theme);
  const matches = [...titleMatches];
  const roleTheme = ROLE_THEME[String(card.role || "system").toLowerCase()] || "compute";
  if (!matches.includes(roleTheme)) matches.push(roleTheme);
  const titleSeed = hashString(title.toLowerCase());
  const fallback = THEME_RULES[titleSeed % THEME_RULES.length][0];
  if (!matches.includes(fallback)) matches.push(fallback);
  const type = String(card.type || "Neutral System").toLowerCase();
  const composition = type.includes("arena") ? "vista"
    : type.includes("action") ? "impact"
      : type.includes("mission") ? "objective"
        : type.includes("ultimate") ? "apotheosis"
          : type.includes("synergy") ? "dual"
            : type.includes("neutral") ? "artifact"
              : type.includes("overseer") ? "commander"
                : "character";
  return {
    primary: matches[0],
    secondary: matches[1] || fallback,
    matchedThemes: matches,
    titleThemes: titleMatches,
    semanticTitleMatch: titleMatches.length > 0,
    glyph: tokenGlyph(title),
    composition,
    nameDerived: true,
  };
}

function motif(theme, x, y, size, color, accent, seed) {
  const stroke = `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const fill = `fill="${accent}" fill-opacity=".22" stroke="${color}" stroke-width="1.7"`;
  const transform = `transform="translate(${x} ${y}) scale(${size / 40}) rotate(${(seed % 31) - 15})"`;
  const forms = {
    antenna: `<path d="M0 16V-3M-9 16H9M-5-7a7 7 0 0 1 10 0M-12-14a17 17 0 0 1 24 0" ${stroke}/><circle cy="-3" r="3" fill="${accent}"/>`,
    command: `<path d="M-15 8V-8l8 7 7-13L7-1l8-7V8Z" ${fill}/><path d="M-13 13H13" ${stroke}/>`,
    structure: `<path d="M-16 15V-5L-6-13V15M-6 15V-19L6-13V15M6 15V-8L16-2V15M-12 1h3M-2-7h4M10 1h3" ${stroke}/>`,
    scales: `<path d="M0-18V15M-13 15H13M-16-8H16M-11-8l-7 14h14Zm22 0L4 6h14Z" ${stroke}/>`,
    helix: `<path d="M-10-18C16-7-16 7 10 18M10-18C-16-7 16 7-10 18M-7-11H7M-7 0H7M-7 11H7" ${stroke}/>`,
    codex: `<path d="M0-13C-5-17-11-17-16-14V13c5-3 11-3 16 1 5-4 11-4 16-1v-27c-5-3-11-3-16 1Zm0 0v27" ${fill}/><path d="M-12-7h8M4-7h8M-12-1h8M4-1h8" ${stroke}/>`,
    ledger: `<path d="M-16 14V-15H16V14ZM-10 7l6-8 6 4 9-12M-10 10h21" ${stroke}/><circle cx="-4" cy="-1" r="2" fill="${accent}"/>`,
    automaton: `<path d="M-14-7H14V14H-14ZM-8-16v9M8-16v9M-8 2h3M5 2h3M-8 9H8" ${fill}/><circle cx="-8" cy="-17" r="2" fill="${accent}"/><circle cx="8" cy="-17" r="2" fill="${accent}"/>`,
    leaf: `<path d="M-15 12C-13-12 4-20 17-17 17-1 9 15-15 12ZM-12 10 11-11M-3 4l-1-9M4-3l9 1" ${stroke}/>`,
    mind: `<path d="M-2 15C-15 18-19 5-13-2c-5-10 7-19 14-12 8-7 19 2 14 11 8 9-1 21-11 17M0-14v29M-9-7c8 2 9 9 9 9M10-7C2-5 1 2 1 2M-8 9c5-3 8-2 8-2M9 9C4 6 1 7 1 7" ${stroke}/>`,
    hourglass: `<path d="M-13-17H13M-13 17H13M-10-16c0 9 8 9 10 15-2 6-10 6-10 16m20-31c0 9-8 9-10 15 2 6 10 6 10 16M-8 12H8" ${stroke}/>`,
    compass: `<circle r="17" ${fill}/><path d="m7-11-4 14-14 4 4-14ZM-7-7 3 3" ${stroke}/><circle r="2.5" fill="${accent}"/>`,
    shield: `<path d="M0-18 15-12v10C15 9 8 15 0 19-8 15-15 9-15-2v-10ZM-8 0l6 6L9-7" ${stroke}/>`,
    lens: `<circle r="15" ${fill}/><circle r="7" ${stroke}/><path d="M12-9h9v18h-9M-18-11v22" ${stroke}/><circle r="2" fill="${accent}"/>`,
    compute: `<path d="M-13-13H13V13H-13ZM-18-8h5M-18 0h5M-18 8h5M13-8h5M13 0h5M13 8h5M-8-18v5M0-18v5M8-18v5M-8 13v5M0 13v5M8 13v5" ${stroke}/><path d="m-7 2 5-5 4 4 6-7" stroke="${accent}" stroke-width="2" fill="none"/>`,
    bolt: `<path d="M4-19-13 4h11l-4 16L14-6H3Z" ${fill}/>`,
    collective: `<circle cx="-10" cy="-7" r="6" ${fill}/><circle cx="10" cy="-7" r="6" ${fill}/><circle cy="3" r="7" ${fill}/><path d="M-19 16c1-8 7-12 13-10M19 16C18 8 12 4 6 6M-10 18c1-9 5-14 10-14s9 5 10 14" ${stroke}/>`,
    target: `<circle r="17" ${fill}/><circle r="10" ${stroke}/><circle r="3" fill="${accent}"/><path d="M0-22v8M0 14v8M-22 0h8M14 0h8" ${stroke}/>`,
  };
  return `<g ${transform} class="aa-motif aa-motif-${theme}">${forms[theme] || forms.compute}</g>`;
}

function environment(kind, primary, secondary, seed) {
  const rand = seeded(seed ^ 0x9e3779b9);
  const stars = Array.from({ length: 13 }, () => {
    const x = Math.round(rand() * 188);
    const y = Math.round(rand() * 76);
    const r = (0.25 + rand() * 1.1).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${rand() > 0.5 ? primary : secondary}" opacity="${(0.18 + rand() * 0.5).toFixed(2)}"/>`;
  }).join("");
  const horizon = 70 + Math.round(rand() * 20);
  const skylines = {
    lattice: `<path d="M0 ${horizon} 28 57 44 ${horizon} 68 28 91 ${horizon} 118 42 144 ${horizon} 169 51 188 ${horizon}V128H0Z"/>`,
    strategy: `<path d="M0 ${horizon}h30V55h22v${horizon - 55}h27V39h30v${horizon - 39}h25V61h24v${horizon - 61}h30v58H0Z"/>`,
    academy: `<path d="M0 ${horizon}h38l8-25 8 25h29l11-39 11 39h30l8-25 8 25h37v58H0Z"/>`,
    studio: `<path d="M0 ${horizon}h34l18-24 21 24h44l19-29 23 29h29v58H0Z"/><circle cx="145" cy="42" r="16"/>`,
    megacity: `<path d="M0 ${horizon}h17V46h17v24h13V27h25v43h19V50h21v20h16V35h27v35h33v58H0Z"/>`,
    biolab: `<path d="M0 ${horizon}c36-21 49 20 79-3s50 14 109-10v61H0Z"/><circle cx="33" cy="42" r="14"/><circle cx="151" cy="48" r="21"/>`,
    server: `<path d="M0 ${horizon}h24V32h25v38h22V20h27v50h20V39h25v31h22V26h23v102H0Z"/>`,
    exchange: `<path d="M0 99 23 85 42 91 66 51 91 76 115 35 143 64 166 46 188 58v70H0Z"/>`,
    kinetic: `<path d="M-10 107 35 47l23 23 29-44 34 45 27-29 50 66v20H-10Z"/>`,
    blacksite: `<path d="M0 77 26 67 45 76 72 52 96 74 126 43 149 72 188 55v73H0Z"/><path d="M0 92h188"/>`,
    civic: `<path d="M0 79h31l14-24 14 24h20l15-38 15 38h21l14-24 14 24h30v49H0Z"/>`,
    aether: `<path d="M0 95q35-50 70-8t65-17 53 3v55H0Z"/><path d="M12 82Q94 15 176 82"/>`,
    ecosystem: `<path d="M0 97q23-38 46-7 28-58 55-5 28-44 53-4 17-18 34 4v43H0Z"/>`,
    transit: `<path d="M0 105 188 45M0 78l188 29M26 128 91 46M88 128l44-86M146 128l18-62"/>`,
    foundry: `<path d="M0 91h25V48l28 17V39l31 22V31l35 31 24-17 45 30v53H0Z"/>`,
    tribunal: `<path d="M0 88h25l9-27h120l10 27h24v40H0Z"/><path d="M48 61V32h16v29M85 61V32h18v29M124 61V32h16v29"/>`,
    signal: `<path d="M0 101q25-47 50-4t47-18 46 9 45-26v66H0Z"/><path d="M20 82Q94 12 168 82M45 82Q94 39 143 82"/>`,
    horizon: `<path d="M0 91 36 63 70 83 107 43 141 79 166 59 188 76v52H0Z"/>`,
    temporal: `<path d="M0 94q47-37 94 0t94 0v34H0Z"/><circle cx="94" cy="62" r="35"/>`,
    cognitive: `<path d="M0 96q31-41 62-5 32-67 64-4 31-40 62-2v43H0Z"/><path d="M14 71C53 14 132 15 174 71"/>`,
  };
  const form = skylines[kind] || skylines.lattice;
  return `${stars}<g fill="${primary}" fill-opacity=".08" stroke="${secondary}" stroke-opacity=".3" stroke-width="1">${form}</g><path d="M0 ${horizon + 17}Q47 ${horizon + 4} 94 ${horizon + 17}t94 0" fill="none" stroke="${primary}" stroke-opacity=".22"/>`;
}

function character(role, primary, secondary, seed, direction) {
  const rand = seeded(seed ^ 0x85ebca6b);
  const x = 72 + Math.round(rand() * 44);
  const headY = 35 + Math.round(rand() * 8);
  const shoulder = 18 + Math.round(rand() * 10);
  const stance = (seed % 3) - 1;
  const armor = String(role).toLowerCase().includes("guardian") ? 1.22
    : String(role).toLowerCase().includes("creator") ? 0.84
      : String(role).toLowerCase().includes("architect") ? 1.08 : 1;
  const left = x - shoulder * armor;
  const right = x + shoulder * armor;
  return `<g class="aa-subject" filter="url(#glow-${seed})">
    <path d="M${x - 9} ${headY - 10}Q${x} ${headY - 20} ${x + 9} ${headY - 10}L${x + 7} ${headY + 7}Q${x} ${headY + 14} ${x - 7} ${headY + 7}Z" fill="url(#armor-${seed})" stroke="${secondary}" stroke-width="1.4"/>
    <path d="M${x - 6} ${headY - 4}h12l-2 5h-8Z" fill="${primary}" opacity=".85"/>
    <path d="M${left} ${headY + 23}Q${x} ${headY + 7} ${right} ${headY + 23}L${x + 14} 105H${x - 14}Z" fill="url(#armor-${seed})" stroke="${primary}" stroke-width="1.5"/>
    <path d="M${left} ${headY + 24}  ${x - 33 - stance * 5} 91M${right} ${headY + 24} ${x + 34 - stance * 4} 82M${x - 9} 101 ${x - 19 + stance * 4} 124M${x + 9} 101 ${x + 19 + stance * 4} 124" stroke="${secondary}" stroke-width="7" stroke-linecap="round"/>
    <path d="M${left} ${headY + 25} ${x - 33 - stance * 5} 91M${right} ${headY + 25} ${x + 34 - stance * 4} 82M${x - 9} 101 ${x - 19 + stance * 4} 124M${x + 9} 101 ${x + 19 + stance * 4} 124" stroke="#07101c" stroke-width="3" stroke-linecap="round"/>
    <path d="M${x - 11} ${headY + 35}h22M${x} ${headY + 18}v72" stroke="${primary}" stroke-opacity=".55"/>
    ${motif(direction.primary, x + 42, 67, 30, secondary, primary, seed)}
  </g>`;
}

function signatureGeometry(seed, primary, secondary) {
  const rand = seeded(seed ^ 0xc2b2ae35);
  return Array.from({ length: 7 }, (_, index) => {
    const x = Math.round(9 + rand() * 170);
    const y = Math.round(10 + rand() * 104);
    const length = Math.round(8 + rand() * 24);
    const angle = Math.round(rand() * 360);
    const color = index % 2 ? primary : secondary;
    return `<path d="M${x} ${y}h${length}" transform="rotate(${angle} ${x} ${y})" stroke="${color}" stroke-width="${(0.35 + rand()).toFixed(2)}" stroke-opacity="${(0.18 + rand() * 0.35).toFixed(2)}"/>`;
  }).join("");
}

export function renderCardIllustration(card) {
  const title = String(card.title || card.name || "Unknown Card");
  const signature = `${card.cardId || card.id}|${title}|${card.type}|${card.division}|${card.role}`;
  const seed = hashString(signature);
  const direction = resolveArtDirection({ ...card, title });
  const division = Number(card.division);
  const palette = PALETTES[Number.isInteger(division) && division > 0 ? (division - 1) % PALETTES.length : seed % PALETTES.length];
  const [primary, secondary, dark] = palette;
  const environmentKind = ENVIRONMENTS[Number.isInteger(division) && division > 0 ? (division - 1) % ENVIRONMENTS.length : (seed >>> 5) % ENVIRONMENTS.length];
  const layout = seed % 12;
  const leftX = 31 + (layout % 4) * 8;
  const rightX = 151 - (layout % 3) * 9;
  const centerY = 51 + ((seed >>> 8) % 17);
  const isCharacter = ["character", "commander"].includes(direction.composition);
  const isVista = direction.composition === "vista";
  const isDual = direction.composition === "dual";
  const primarySize = isVista ? 25 : direction.composition === "apotheosis" ? 57 : 39;
  const uniqueId = `${seed.toString(36)}-${escapeXml(String(card.cardId || card.id || "card").replace(/[^a-z0-9-]/gi, ""))}`;
  const subject = isCharacter
    ? character(card.role, primary, secondary, seed, direction)
    : isDual
      ? `${motif(direction.primary, 58, centerY, 44, primary, secondary, seed)}${motif(direction.secondary, 130, 72 - (centerY - 51), 44, secondary, primary, seed >>> 1)}<path d="M78 ${centerY}C95 28 107 97 116 ${72 - (centerY - 51)}" stroke="${primary}" stroke-width="3" fill="none"/>`
      : `${motif(direction.primary, isVista ? leftX : 94, isVista ? 82 : centerY, primarySize, primary, secondary, seed)}${motif(direction.secondary, isVista ? rightX : rightX, isVista ? 69 : 83, isVista ? 20 : 27, secondary, primary, seed >>> 1)}`;
  const glyphX = layout % 2 ? 28 : 160;
  return `<svg class="aa-card-illustration" viewBox="0 0 188 128" preserveAspectRatio="xMidYMid slice" role="presentation" data-art-id="${escapeXml(card.cardId || card.id || "unknown")}" data-art-seed="${seed}" data-primary-motif="${direction.primary}" data-secondary-motif="${direction.secondary}" data-composition="${direction.composition}">
    <defs>
      <linearGradient id="sky-${uniqueId}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset=".52" stop-color="#07101e"/><stop offset="1" stop-color="${primary}" stop-opacity=".24"/></linearGradient>
      <linearGradient id="armor-${seed}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#34425a"/><stop offset=".45" stop-color="#0a101d"/><stop offset="1" stop-color="${primary}" stop-opacity=".46"/></linearGradient>
      <radialGradient id="aura-${seed}"><stop stop-color="${secondary}" stop-opacity=".42"/><stop offset="1" stop-color="${secondary}" stop-opacity="0"/></radialGradient>
      <filter id="glow-${seed}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="grid-${seed}" width="${8 + (seed % 7)}" height="${7 + ((seed >>> 4) % 8)}" patternUnits="userSpaceOnUse" patternTransform="rotate(${(seed % 15) - 7})"><path d="M0 0H20M0 0V20" stroke="${secondary}" stroke-opacity=".055" stroke-width=".6"/></pattern>
    </defs>
    <rect width="188" height="128" fill="url(#sky-${uniqueId})"/>
    <rect width="188" height="128" fill="url(#grid-${seed})"/>
    <ellipse cx="${94 + ((seed >>> 11) % 31) - 15}" cy="${55 + ((seed >>> 17) % 19) - 9}" rx="${44 + (seed % 29)}" ry="${34 + ((seed >>> 6) % 22)}" fill="url(#aura-${seed})"/>
    ${environment(environmentKind, primary, secondary, seed)}
    <g class="aa-unique-geometry">${signatureGeometry(seed, primary, secondary)}</g>
    ${subject}
    <g class="aa-name-insignia" transform="translate(${glyphX} 22) rotate(${(seed % 17) - 8})"><path d="M-15 0 0-15 15 0 0 15Z" fill="#030711" fill-opacity=".72" stroke="${secondary}" stroke-opacity=".7"/><text x="0" y="3" text-anchor="middle" fill="${primary}" font-family="ui-monospace,monospace" font-size="${direction.glyph.length > 2 ? 6 : 8}" font-weight="800" letter-spacing=".5">${escapeXml(direction.glyph)}</text></g>
    <path d="M0 108Q47 ${98 + (layout % 9)} 94 108t94 0v20H0Z" fill="#030711" fill-opacity=".63"/>
    <path d="M8 116H180" stroke="${primary}" stroke-opacity=".36"/>
  </svg>`;
}

export function illustrationRecipe(card) {
  const direction = resolveArtDirection(card);
  const signature = `${card.cardId || card.id}|${card.title || card.name}|${card.type}|${card.division}|${card.role}`;
  return {
    id: card.cardId || card.id,
    seed: hashString(signature),
    ...direction,
  };
}
