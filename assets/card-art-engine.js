import { illustrationRecipe, renderCardIllustration } from "./card-illustration-core.js";

const EXPECTED_CARD_COUNT = 1200;
const ART_SELECTOR = ".game-card .card-art";

const TYPE_CLASSES = new Map([
  ["specialist agent", "specialist"], ["action", "action"], ["overseer", "overseer"],
  ["mission objective", "mission"], ["ultimate protocol", "ultimate"], ["home arena", "arena"],
  ["synergy node", "synergy"], ["neutral system", "neutral"],
]);

const ROLE_SIGILS = new Map([
  ["guardian", "◆"], ["architect", "◇"], ["analyst", "⌬"], ["operator", "⌁"],
  ["creator", "✦"], ["coordinator", "◎"], ["system", "⬡"], ["reaction", "↯"],
  ["support", "✚"], ["protocol", "⌘"], ["cross-division", "∞"],
]);

function normalizeDivision(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 1 && number <= 20 ? number : null;
}

function createElement(tagName, className, attributes = {}) {
  const element = document.createElement(tagName);
  element.className = className;
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function parseCard(card, art) {
  const cardId = card.dataset.cardId || "unknown-card";
  const title = card.querySelector(".card-copy strong")?.textContent?.trim() || "Unknown Card";
  const meta = card.querySelector(".card-copy small")?.textContent?.trim() || "System · Neutral System";
  const [role = "System", rawType = "Neutral System"] = meta.split(" · ");
  const idDivision = /^d(\d{2})-/.exec(cardId)?.[1];
  const originalIndex = art.querySelector(".art-index")?.textContent?.trim() || "00";
  const division = normalizeDivision(idDivision) || normalizeDivision(originalIndex);
  const type = TYPE_CLASSES.get(rawType.toLowerCase()) || "neutral";
  return { cardId, title, role, rawType, type, division };
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

function createParticles(seed, compact) {
  const field = createElement("span", "aa-particle-field", { "aria-hidden": "true" });
  const count = compact ? 5 : 9;
  for (let index = 0; index < count; index += 1) {
    const value = (seed ^ Math.imul(index + 1, 2654435761)) >>> 0;
    const particle = createElement("i", "aa-particle");
    particle.style.setProperty("--particle-x", `${6 + (value % 88)}%`);
    particle.style.setProperty("--particle-y", `${14 + ((value >>> 7) % 78)}%`);
    particle.style.setProperty("--particle-size", `${1 + ((value >>> 13) % 4) * 0.55}px`);
    particle.style.setProperty("--particle-delay", `${-((value >>> 17) % 3800)}ms`);
    field.append(particle);
  }
  return field;
}

function enhanceArt(art) {
  if (!(art instanceof HTMLElement)) return false;
  const card = art.closest(".game-card");
  if (!(card instanceof HTMLElement)) return false;
  const details = parseCard(card, art);
  const signature = `${details.cardId}|${details.title}|${details.rawType}|${details.division}|${details.role}`;
  if (art.dataset.artReady === "true" && art.dataset.artSignature === signature) return false;

  const recipe = illustrationRecipe({ ...details, type: details.rawType });
  card.dataset.cardType = details.type;
  card.dataset.division = String(details.division || 0);
  card.dataset.artSeed = String(recipe.seed);
  card.dataset.artPrimaryMotif = recipe.primary;
  card.dataset.artSecondaryMotif = recipe.secondary;
  card.dataset.artComposition = recipe.composition;
  card.style.setProperty("--foil-angle", `${recipe.seed % 360}deg`);

  art.querySelectorAll(
    ".aa-illustration-stage, .aa-particle-field, .aa-role-sigil, .aa-art-foil, .aa-art-vignette",
  ).forEach((layer) => layer.remove());

  const stage = createElement("span", "aa-illustration-stage", { "aria-hidden": "true" });
  stage.innerHTML = renderCardIllustration({ ...details, type: details.rawType });
  const roleSigil = createElement("span", "aa-role-sigil", { "aria-hidden": "true" });
  roleSigil.textContent = ROLE_SIGILS.get(details.role.toLowerCase()) || details.role.slice(0, 1).toUpperCase() || "◆";
  const foil = createElement("span", "aa-art-foil", { "aria-hidden": "true" });
  const vignette = createElement("span", "aa-art-vignette", { "aria-hidden": "true" });

  art.prepend(stage, createParticles(recipe.seed, card.classList.contains("compact")));
  art.append(roleSigil, foil, vignette);
  art.dataset.artReady = "true";
  art.dataset.artSignature = signature;
  art.dataset.artId = details.cardId;
  art.dataset.artMotifs = `${recipe.primary},${recipe.secondary}`;
  art.setAttribute("role", "img");
  art.setAttribute("aria-label", `${details.title}, a unique ${recipe.primary} and ${recipe.secondary} illustration`);

  [...card.classList]
    .filter((className) => className.startsWith("aa-art-tier-"))
    .forEach((className) => card.classList.remove(className));
  card.classList.add("aa-art-card", `aa-art-tier-${recipe.seed % 5}`);
  addPointerLighting(card);
  return true;
}

function enhanceWithin(scope = document) {
  const artwork = [];
  if (scope instanceof HTMLElement && scope.matches(ART_SELECTOR)) artwork.push(scope);
  scope.querySelectorAll?.(ART_SELECTOR).forEach((art) => artwork.push(art));
  let enhanced = 0;
  artwork.forEach((art) => { if (enhanceArt(art)) enhanced += 1; });
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
      const target = mutation.target.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target;
      const targetCard = target instanceof HTMLElement ? target.closest(".game-card") : null;
      if (targetCard) enhanceArt(targetCard.querySelector(".card-art"));
      mutation.addedNodes.forEach((node) => { if (node instanceof HTMLElement) enhanceWithin(node); });
    });
  });
  observer.observe(root, { childList: true, characterData: true, subtree: true });
  root.addEventListener("click", scheduleRefresh, { passive: true });
  root.addEventListener("change", scheduleRefresh, { passive: true });
  window.AgenticArenaArt.observer = observer;
  window.AgenticArenaArt.scheduleRefresh = scheduleRefresh;
}

window.AgenticArenaArt = {
  version: "3.0.0",
  catalogSize: EXPECTED_CARD_COUNT,
  enhanced: 0,
  observer: null,
  scheduleRefresh: null,
  audit() {
    const cards = [...document.querySelectorAll(".game-card")];
    const ready = cards.filter((card) => card.querySelector('.card-art[data-art-ready="true"]'));
    const illustrated = ready.filter((card) => card.querySelector(".aa-card-illustration[data-art-id]"));
    const signatures = new Set(illustrated.map((card) => card.querySelector(".aa-card-illustration")?.dataset.artId));
    return {
      catalogSize: EXPECTED_CARD_COUNT,
      visibleCards: cards.length,
      illustratedCards: illustrated.length,
      distinctVisibleArtIds: signatures.size,
      coverage: cards.length ? illustrated.length / cards.length : 1,
      uniqueVisibleCoverage: illustrated.length ? signatures.size / illustrated.length : 1,
    };
  },
  refresh() { return enhanceWithin(document); },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
