import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../sw.js", import.meta.url), "utf8");
const origin = "https://arena.test";

function harness({ offline = false, status = 200, rejectWrites = false } = {}) {
  const listeners = new Map();
  const stores = new Map();
  const deleted = [];
  const state = { precache: [], skipped: false, claimed: false };
  const key = (input) => new URL(typeof input === "string" ? input : input.url, origin).href;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(paths) {
          state.precache = Array.from(paths);
          paths.forEach((path) => store.set(key(path), new Response(`cached:${path}`)));
        },
        async match(request) { return store.get(key(request))?.clone(); },
        async put(request, response) {
          if (rejectWrites) throw new Error("Quota exceeded");
          store.set(key(request), response.clone());
        },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { deleted.push(name); return stores.delete(name); },
    async match(request) {
      for (const store of stores.values()) {
        const response = store.get(key(request));
        if (response) return response.clone();
      }
    },
  };
  const self = {
    location: { origin },
    clients: { async claim() { state.claimed = true; } },
    async skipWaiting() { state.skipped = true; },
    addEventListener(type, listener) { listeners.set(type, listener); },
  };
  vm.runInNewContext(source, {
    self, caches, URL, Response,
    fetch: async () => {
      if (offline) throw new TypeError("Offline");
      return new Response("network", { status });
    },
  });
  async function lifecycle(type) {
    const work = [];
    listeners.get(type)({ waitUntil(promise) { work.push(promise); } });
    await Promise.all(work);
  }
  async function request(path, overrides = {}) {
    const work = [];
    let response;
    listeners.get("fetch")({
      request: { url: key(path), method: "GET", mode: "cors", ...overrides },
      waitUntil(promise) { work.push(promise); },
      respondWith(promise) { response = promise; },
    });
    const result = await response;
    await Promise.all(work);
    return result;
  }
  return { caches, stores, deleted, state, lifecycle, request };
}

// Characterization checks: preserve the existing network-first contract.
test("online GET returns the network response and caches it", async () => {
  const h = harness();
  assert.equal(await (await h.request("/play.js")).text(), "network");
  assert.equal(await (await h.caches.match("/play.js")).text(), "network");
});

test("non-GET and cross-origin requests are left to the browser", async () => {
  const h = harness();
  assert.equal(await h.request("/", { method: "POST" }), undefined);
  assert.equal(await h.request("https://other.test/play.js"), undefined);
});

test("offline requests return their cached asset", async () => {
  const h = harness({ offline: true });
  await h.lifecycle("install");
  assert.equal(await (await h.request("/play.js")).text(), "cached:/play.js");
});

test("installation precaches artwork dependencies and all paths exist", async () => {
  const h = harness();
  await h.lifecycle("install");
  for (const path of ["/assets/card-art-engine.js", "/assets/card-art-engine.css", "/assets/card-illustration-core.js"]) {
    assert.ok(h.state.precache.includes(path), `Missing offline dependency: ${path}`);
  }
  for (const path of h.state.precache) {
    await readFile(new URL(`..${path === "/" ? "/index.html" : path}`, import.meta.url));
  }
  assert.equal(h.state.skipped, true);
});

test("activation deletes only older duel caches", async () => {
  const h = harness();
  await h.caches.open("agentic-arena-duel-v1");
  await h.caches.open("unrelated-app-v1");
  await h.lifecycle("install");
  await h.lifecycle("activate");
  assert.deepEqual(h.deleted, ["agentic-arena-duel-v1"]);
  assert.ok(h.stores.has("unrelated-app-v1"));
  assert.equal(h.state.claimed, true);
});

test("unknown offline navigation uses the app shell", async () => {
  const h = harness({ offline: true });
  await h.lifecycle("install");
  assert.equal(await (await h.request("/duel", { mode: "navigate" })).text(), "cached:/");
});

test("unknown offline assets never receive HTML", async () => {
  const h = harness({ offline: true });
  await h.lifecycle("install");
  const response = await h.request("/missing.js");
  assert.equal(response.type, "error");
});

test("offline navigation without a cached shell returns a network error", async () => {
  const h = harness({ offline: true });
  assert.equal((await h.request("/", { mode: "navigate" })).type, "error");
});

test("offline fallback does not read another application's cache", async () => {
  const h = harness({ offline: true });
  const unrelated = await h.caches.open("unrelated-app-v1");
  await unrelated.put("/private.js", new Response("unrelated"));
  assert.equal((await h.request("/private.js")).type, "error");
});

test("cache write failure does not discard a successful network response", async () => {
  const h = harness({ rejectWrites: true });
  assert.equal(await (await h.request("/play.js")).text(), "network");
});

test("HTTP errors are returned without poisoning the cache", async () => {
  const h = harness({ status: 404 });
  assert.equal((await h.request("/missing.js")).status, 404);
  assert.equal(await h.caches.match("/missing.js"), undefined);
});
