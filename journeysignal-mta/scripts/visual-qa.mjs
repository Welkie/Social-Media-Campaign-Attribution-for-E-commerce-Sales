import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const screenshotsDir = path.join(root, "qa-screenshots");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const baseUrl = "http://localhost:3000";

const routes = [
  { name: "overview", path: "/" },
  { name: "attribution", path: "/attribution" },
  { name: "regression", path: "/regression" },
  { name: "comparison", path: "/comparison" },
  { name: "simulation", path: "/simulation" },
  { name: "methodology", path: "/methodology" }
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 900 }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }
    await sleep(500);
  }
  throw new Error("Timed out waiting for Next.js server.");
}

const server = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "start", "--port", "3000"], {
  cwd: root,
  stdio: "pipe",
  windowsHide: true
});

try {
  mkdirSync(screenshotsDir, { recursive: true });
  await waitForServer();

  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true
  });

  const results = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyText: document.body.innerText,
        chartNodes: document.querySelectorAll(".recharts-wrapper, [aria-label*='Delta revenue']").length
      }));
      const screenshot = path.join(screenshotsDir, `${viewport.name}-${route.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: false });

      const maxAllowedOverflow = viewport.name === "mobile" ? 16 : 8;
      if (metrics.scrollWidth - metrics.clientWidth > maxAllowedOverflow) {
        throw new Error(
          `${viewport.name} ${route.path} has horizontal overflow: scrollWidth ${metrics.scrollWidth}, clientWidth ${metrics.clientWidth}`
        );
      }
      if (!metrics.bodyText.includes("Signal")) {
        throw new Error(`${viewport.name} ${route.path} did not render expected app text.`);
      }

      results.push({
        viewport: viewport.name,
        route: route.path,
        status: "ok",
        screenshot,
        scrollWidth: metrics.scrollWidth,
        clientWidth: metrics.clientWidth,
        chartNodes: metrics.chartNodes
      });
    }

    await context.close();
  }

  await browser.close();
  console.table(results);
} finally {
  server.kill();
}
