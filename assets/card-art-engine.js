const EXPECTED_CARD_COUNT = 1200;
const ART_SELECTOR = ".game-card .card-art";

const TYPE_CLASSES = new Map([
  ["specialist agent", "specialist"],
  ["action", "action"],
  ["overseer", "overseer"],
  ["mission objective", "mission"],
  ["ultimate protocol", "ultimate"],
  ["home arena", "arena"],
  ["synergy node", "synergy"],
  ["neutral system", "neutral"],
]);

const ROLE_SIGILS = new Map([
  ["guardian", "◆"],
  ["architect", "◇"],
  ["analyst", "⌬"],
  ["operator", "⌁"],
  ["creator", "✦"],
  ["coordinator", "◎"],
  ["system", "⬡"],
  ["reaction", "↯"],
  ["support", "✚"],
]);

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeDivision(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 1 && number <= 20 ? number : 0;
}

function spritePosition(division) {
  if (!division) return { x: 50, y: 50 };
  const index = division - 1;
  const column = index % 5;
  const row = Math.floor(index / 5);
  return {
    x: (column / 4) * 100,
    y: (row / 3) * 100,
  };
}

function createElement(tagName, className, attributes = {}) {
  const element = document.createElement(tagName);
  element.className = className;
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function createEffects(type, seed) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "aa-art-fx");
  svg.setAttribute("viewBox", "0 0 188 128");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const paths = {
    specialist: [
      '<ellipse cx="94" cy="62" rx="47" ry="54" />',
      '<path d="M24 106 Q94 80 164 106" />',
      '<path d="M94 8 V25 M43 29 L57 42 M145 29 L131 42" />',
    ],
    action: [
      '<path d="M-10 108 C48 82 86 62 198 12" />',
      '<path d="M-8 120 C58 92 105 72 198 29" />',
      '<circle cx="138" cy="35" r="17" />',
    ],
    overseer: [
      '<circle cx="94" cy="53" r="40" />',
      '<circle cx="94" cy="53" r="53" />',
      '<path d="M52 108 L69 80 L94 98 L119 80 L136 108" />',
    ],
    mission: [
      '<circle cx="94" cy="62" r="46" />',
      '<circle cx="94" cy="62" r="27" />',
      '<path d="M94 8 V116 M35 62 H153" />',
    ],
    ultimate: [
      '<path d="M94 3 L105 46 L151 25 L119 61 L171 66 L120 76 L149 116 L105 88 L94 126 L83 88 L39 116 L68 76 L17 66 L69 61 L37 25 L83 46 Z" />',
      '<circle cx="94" cy="66" r="24" />',
    ],
    arena: [
      '<path d="M8 108 Q94 19 180 108" />',
      '<path d="M29 108 Q94 45 159 108" />',
      '<path d="M6 109 H182 M94 29 V109" />',
    ],
    synergy: [
      '<circle cx="60" cy="64" r="28" />',
      '<circle cx="128" cy="64" r="28" />',
      '<path d="M84 50 L104 50 M84 78 L104 78" />',
    ],
    neutral: [
      '<path d="M94 9 L139 35 L139 87 L94 113 L49 87 L49 35 Z" />',
      '<path d="M94 28 L122 44 L122 78 L94 94 L66 78 L66 44 Z" />',
    ],
  };

  svg.innerHTML = (paths[type] || paths.neutral).join("");
  svg.style.setProperty("--fx-rotation", `${(seed % 17) - 8}deg`);
  return svg;
}

function parseCard(card, art) {
  const cardId = card.dataset.cardId || "unknown-card";
  const title = card.querySelector(".card-copy strong")?.textContent?.trim() || "Unknown Card";
  const meta = card.querySelector(".card-copy small")?.textContent?.trim() || "System · Neutral System";
  const [role = "System", rawType = "Neutral System"] = meta.split(" · ");
  const originalIndex = art.querySelector(".art-index")?.textContent?.trim() || "00";
  const type = TYPE_CLASSES.get(rawType.toLowerCase()) || "neutral";
  const activeFaction = normalizeDivision(
    document.querySelector(".faction-rail button.active b")?.textContent || "0",
  );
  const division = ["neutral", "synergy"].includes(type)
    ? normalizeDivision(originalIndex)
    : activeFaction || normalizeDivision(originalIndex);
  return { cardId, title, role, rawType, division, type, originalIndex };
}

function addPointerLighting(card) {
  if (card.dataset.artPointerReady === "true") return;
  card.dataset.artPointerReady = "true";
  card.addEventListener("pointermove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    card.style.setProperty("--pointer-x", `${x * 100}%`);
    card.style.setProperty("--pointer-y", `${y * 100}%`);
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 3.2}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 4.2}deg`);
  }, { passive: true });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  }, { passive: true });
}

function enhanceArt(art) {
  if (!(art instanceof HTMLElement)) return false;
  const card = art.closest(".game-card");
  if (!(card instanceof HTMLElement)) return false;

  const details = parseCard(card, art);
  const signature = `${details.cardId}|${details.title}|${details.rawType}|${details.division}`;
  if (
    art.dataset.artReady === "true" &&
    art.dataset.artSignature === signature
  ) {
    return false;
  }
  const seed = hashString(signature);
  const sprite = spritePosition(details.division);
  const rarityTier = seed % 5;
  const particles = Array.from({ length: card.classList.contains("compact") ? 5 : 9 }, (_, index) => {
    const particleSeed = hashString(`${seed}:${index}`);
    const x = 7 + (particleSeed % 86);
    const y = 8 + ((particleSeed >>> 7) % 82);
    const size = 0.7 + ((particleSeed >>> 13) % 3) * 0.55;
    return `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, var(--card-secondary) 82%, white) 0 ${size}px, transparent ${size + 1.2}px)`;
  }).join(", ");

  card.dataset.cardType = details.type;
  card.dataset.division = String(details.division);
  card.dataset.artSeed = String(seed);
  [...card.classList]
    .filter((className) => className.startsWith("aa-art-tier-"))
    .forEach((className) => card.classList.remove(className));
  card.classList.add("aa-art-card", `aa-art-tier-${rarityTier}`);
  card.style.setProperty("--foil-angle", `${seed % 360}deg`);
  card.style.setProperty("--art-saturation", String(1.02 + (seed % 19) / 100));
  card.style.setProperty("--art-brightness", String(0.83 + ((seed >>> 6) % 12) / 100));

  art.querySelectorAll(
    ".aa-faction-art, .aa-art-grade, .aa-art-fx, .aa-particle-field, .aa-role-sigil, .aa-art-foil, .aa-art-vignette",
  ).forEach((layer) => layer.remove());
  art.dataset.artReady = "true";
  art.dataset.artSignature = signature;
  art.setAttribute("role", "img");
  art.setAttribute("aria-label", `${details.title} faction illustration`);
  art.style.setProperty("--sprite-x", `${sprite.x}%`);
  art.style.setProperty("--sprite-y", `${sprite.y}%`);
  art.style.setProperty("--particle-map", particles);

  const cropX = ((seed >>> 8) % 9) - 4;
  const cropY = ((seed >>> 13) % 7) - 3;
  const artScale = 1.045 + ((seed >>> 18) % 7) / 100;
  const factionArt = createElement("span", "aa-faction-art", { "aria-hidden": "true" });
  factionArt.style.backgroundPosition = `${sprite.x}% ${sprite.y}%`;
  factionArt.style.setProperty("--crop-x", `${cropX}px`);
  factionArt.style.setProperty("--crop-y", `${cropY}px`);
  factionArt.style.setProperty("--art-scale", String(artScale));

  const grade = createElement("span", "aa-art-grade", { "aria-hidden": "true" });
  const particleField = createElement("span", "aa-particle-field", { "aria-hidden": "true" });
  const particleCount = card.classList.contains("compact") ? 5 : 9;
  for (let index = 0; index < particleCount; index += 1) {
    const particleSeed = hashString(`${seed}:particle:${index}`);
    const particle = createElement("i", "aa-particle");
    particle.style.setProperty("--particle-x", `${6 + (particleSeed % 88)}%`);
    particle.style.setProperty("--particle-y", `${14 + ((particleSeed >>> 7) % 78)}%`);
    particle.style.setProperty("--particle-size", `${1 + ((particleSeed >>> 13) % 4) * 0.55}px`);
    particle.style.setProperty("--particle-delay", `${-((particleSeed >>> 17) % 3800)}ms`);
    particleField.append(particle);
  }

  const roleKey = details.role.trim().toLowerCase();
  const roleSigil = createElement("span", "aa-role-sigil", { "aria-hidden": "true" });
  roleSigil.textContent = ROLE_SIGILS.get(roleKey) || details.role.trim().slice(0, 1).toUpperCase() || "◆";

  const foil = createElement("span", "aa-art-foil", { "aria-hidden": "true" });
  const vignette = createElement("span", "aa-art-vignette", { "aria-hidden": "true" });
  art.prepend(factionArt, grade, createEffects(details.type, seed), particleField);
  art.append(roleSigil, foil, vignette);

  addPointerLighting(card);
  return true;
}

function enhanceWithin(scope = document) {
  const artwork = [];
  if (scope instanceof HTMLElement && scope.matches(ART_SELECTOR)) artwork.push(scope);
  scope.querySelectorAll?.(ART_SELECTOR).forEach((art) => artwork.push(art));
  let enhanced = 0;
  artwork.forEach((art) => {
    if (enhanceArt(art)) enhanced += 1;
  });
  window.AgenticArenaArt.enhanced += enhanced;
  return enhanced;
}

function bootstrap() {
  const root = document.getElementById("root");
  if (!root) return;
  document.documentElement.classList.add("aa-art-engine-active");

  let refreshFrame = 0;
  const scheduleRefresh = () => {
    window.cancelAnimationFrame(refreshFrame);
    refreshFrame = window.requestAnimationFrame(() => enhanceWithin(root));
  };

  enhanceWithin(root);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const target = mutation.target.nodeType === Node.TEXT_NODE
        ? mutation.target.parentElement
        : mutation.target;
      const targetCard = target instanceof HTMLElement ? target.closest(".game-card") : null;
      if (targetCard) enhanceArt(targetCard.querySelector(".card-art"));
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) enhanceWithin(node);
      });
    });
  });
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  root.addEventListener("click", scheduleRefresh, { passive: true });
  root.addEventListener("change", scheduleRefresh, { passive: true });
  window.AgenticArenaArt.observer = observer;
  window.AgenticArenaArt.scheduleRefresh = scheduleRefresh;
}

window.AgenticArenaArt = {
  version: "2.0.0",
  catalogSize: EXPECTED_CARD_COUNT,
  enhanced: 0,
  observer: null,
  scheduleRefresh: null,
  audit() {
    const cards = [...document.querySelectorAll(".game-card")];
    const ready = cards.filter((card) => card.querySelector('.card-art[data-art-ready="true"]'));
    const layered = ready.filter((card) => (
      card.querySelector(".aa-faction-art") &&
      card.querySelector(".aa-art-fx") &&
      card.querySelector(".aa-art-vignette")
    ));
    return {
      catalogSize: EXPECTED_CARD_COUNT,
      visibleCards: cards.length,
      illustratedCards: ready.length,
      fullyLayeredCards: layered.length,
      coverage: cards.length ? ready.length / cards.length : 1,
      layeredCoverage: cards.length ? layered.length / cards.length : 1,
    };
  },
  refresh() {
    return enhanceWithin(document);
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
