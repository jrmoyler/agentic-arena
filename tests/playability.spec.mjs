import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { chromium } from "playwright";

// Runtime smoke coverage, not proof of complete duel/rules correctness.
const root = fileURLToPath(new URL("../", import.meta.url));
const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
};
let server;
let browser;
let baseURL;

before(async () => {
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!path.startsWith(resolve(root) + sep)) {
        response.writeHead(403).end();
        return;
      }
      const content = await readFile(path);
      response.writeHead(200, {
        "Content-Type": types[extname(path)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  baseURL = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  if (server) {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`game boots online and offline at ${viewport.width}px`, { timeout: 90000 }, async () => {
    const context = await browser.newContext({ viewport, serviceWorkers: "allow" });
    const page = await context.newPage();
    const errors = [];
    const failedAssets = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(baseURL)) {
        failedAssets.push(`${response.status()} ${response.url()}`);
      }
    });
    try {
      await page.goto(baseURL, { waitUntil: "networkidle" });
      await page.waitForFunction(() => {
        const root = document.getElementById("root");
        return root?.innerText.trim().length > 40 && root.querySelector("button");
      });
      assert.match(await page.title(), /Agentic Arena/i);
      assert.equal(await page.locator("#root button:enabled").count() > 0, true);
      // Explicit registration isolates the offline subsystem from client wiring.
      await page.evaluate(async () => {
        await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
      });
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
      await context.setOffline(true);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForFunction(() => document.getElementById("root")?.innerText.trim().length > 40);
      const offline = await page.evaluate(async () => {
        const engine = await fetch("/assets/card-art-engine.js");
        const core = await fetch("/assets/card-illustration-core.js");
        const catalog = await (await fetch("/data/card-art-catalog.json")).json();
        return { engine: engine.ok, core: core.ok, cards: catalog.length };
      });
      assert.deepEqual(offline, { engine: true, core: true, cards: 1200 });
      assert.deepEqual(failedAssets, [], "All requested game assets should load");
      assert.deepEqual(errors, [], "No uncaught browser errors online or offline");
    } catch (error) {
      await page.screenshot({ path: `playability-failure-${viewport.width}.png`, fullPage: true }).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  });
}
