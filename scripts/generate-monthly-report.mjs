#!/usr/bin/env node

/**
 * generate-monthly-report.mjs
 *
 * Reads all 20 snapshots + editorial, populates HTML template,
 * renders PDF via Puppeteer, saves to public/reports/.
 *
 * Usage:
 *   node scripts/generate-monthly-report.mjs            # current month
 *   node scripts/generate-monthly-report.mjs 2026-04    # specific month
 *
 * Requires: puppeteer (devDependency)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SNAPSHOTS_DIR = path.join(ROOT, "src", "data", "snapshots");
const EDITORIALS_DIR = path.join(ROOT, "src", "data", "editorials");
const TEMPLATE_PATH = path.join(ROOT, "scripts", "templates", "monthly-report.html");
const REPORTS_DIR = path.join(ROOT, "public", "reports");

const CLUSTER_NAMES = {
  "design-leadership": "Design Leadership",
  "product-ux": "Product & UX",
  "brand-visual": "Brand & Visual",
  "content-copy": "Content & Copy",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthArg() {
  const arg = process.argv[2];
  if (arg && /^\d{4}-\d{2}$/.test(arg)) return arg;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function readAllSnapshots() {
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), "utf-8")));
}

function readEditorial(monthKey) {
  const filePath = path.join(EDITORIALS_DIR, `${monthKey}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function formatSalary(n) {
  if (!n || n <= 0) return "N/A";
  return `$${Math.round(n / 1000)}k`;
}

function formatYoY(n) {
  if (n > 0) return `+${n.toFixed(1)}%`;
  return `${n.toFixed(1)}%`;
}

function getYoYClass(n) {
  if (n > 0) return "text-up";
  if (n < 0) return "text-down";
  return "text-neutral";
}

function getRiskLabel(score) {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "Elevated";
  return "High";
}

function getQuadrant(aiRisk, demandYoY) {
  const safe = aiRisk < 50;
  const growing = demandYoY >= 0;
  if (growing && safe) return "Thriving & Safe";
  if (growing && !safe) return "Growing but Exposed";
  if (!growing && safe) return "Declining & Safe";
  return "Declining & Exposed";
}

function buildLeaderboardRows(snapshots) {
  // Sort by YoY change ascending (most distressed first)
  const sorted = [...snapshots].sort(
    (a, b) => (a.demand?.yoyChange ?? 0) - (b.demand?.yoyChange ?? 0)
  );

  return sorted.map((s) => {
    const yoy = s.demand?.yoyChange ?? 0;
    const aiRisk = s.aiImpact?.score ?? 0;
    const clusterLabel = CLUSTER_NAMES[s.cluster] || s.cluster;
    return `<tr>
      <td>${s.title}</td>
      <td>${clusterLabel}</td>
      <td>${(s.demand?.openingsCount ?? 0).toLocaleString()}</td>
      <td class="${getYoYClass(yoy)}">${formatYoY(yoy)}</td>
      <td>${formatSalary(s.salary?.medianUSD)}</td>
      <td>${aiRisk} ${getRiskLabel(aiRisk)}</td>
    </tr>`;
  }).join("\n");
}

function buildClusterCards(snapshots) {
  const clusters = {};
  for (const s of snapshots) {
    const c = s.cluster;
    if (!clusters[c]) clusters[c] = [];
    clusters[c].push(s);
  }

  return Object.entries(clusters).map(([cluster, roles]) => {
    const name = CLUSTER_NAMES[cluster] || cluster;
    const avgAIRisk = Math.round(
      roles.reduce((sum, r) => sum + (r.aiImpact?.score ?? 0), 0) / roles.length
    );
    const avgDemandYoY = (
      roles.reduce((sum, r) => sum + (r.demand?.yoyChange ?? 0), 0) / roles.length
    ).toFixed(1);
    const biggestMover = roles.reduce((best, r) => {
      return Math.abs(r.demand?.yoyChange ?? 0) > Math.abs(best.demand?.yoyChange ?? 0) ? r : best;
    }, roles[0]);

    return `<div class="cluster-card">
      <div class="cluster-name">${name}</div>
      <div class="cluster-stat">
        <span class="cluster-stat-label">Avg AI Risk</span>
        <span>${avgAIRisk}/100</span>
      </div>
      <div class="cluster-stat">
        <span class="cluster-stat-label">Avg Demand YoY</span>
        <span class="${getYoYClass(parseFloat(avgDemandYoY))}">${formatYoY(parseFloat(avgDemandYoY))}</span>
      </div>
      <div class="cluster-stat">
        <span class="cluster-stat-label">Roles</span>
        <span>${roles.length}</span>
      </div>
      <div class="cluster-mover">
        <span class="cluster-mover-label">Top Mover</span>
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 8pt; margin-top: 2pt;">
          ${biggestMover.title} (${formatYoY(biggestMover.demand?.yoyChange ?? 0)})
        </div>
      </div>
    </div>`;
  }).join("\n");
}

function buildRiskRows(snapshots) {
  const sorted = [...snapshots].sort(
    (a, b) => (b.aiImpact?.score ?? 0) - (a.aiImpact?.score ?? 0)
  );

  return sorted.map((s) => {
    const aiRisk = s.aiImpact?.score ?? 0;
    const yoy = s.demand?.yoyChange ?? 0;
    const quadrant = getQuadrant(aiRisk, yoy);
    return `<tr>
      <td>${s.title}</td>
      <td>${aiRisk}</td>
      <td>${getRiskLabel(aiRisk)}</td>
      <td class="${getYoYClass(yoy)}">${formatYoY(yoy)}</td>
      <td>${quadrant}</td>
    </tr>`;
  }).join("\n");
}

async function generateReport(monthKey) {
  const [yearStr, monthStr] = monthKey.split("-");
  const monthLabel = `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} ${yearStr}`;

  console.log(`Generating PDF report for ${monthLabel}...`);

  // Read data
  const snapshots = readAllSnapshots();
  if (snapshots.length === 0) {
    console.error("No snapshots found. Run the refresh script first.");
    process.exit(1);
  }

  const editorial = readEditorial(monthKey);

  // Compute aggregations
  const totalOpenings = snapshots.reduce((sum, s) => sum + (s.demand?.openingsCount ?? 0), 0);
  const avgAIRisk = Math.round(
    snapshots.reduce((sum, s) => sum + (s.aiImpact?.score ?? 0), 0) / snapshots.length
  );
  const rolesInDecline = snapshots.filter((s) => (s.demand?.yoyChange ?? 0) < 0).length;
  const highestRiskSnapshot = snapshots.reduce((max, s) =>
    (s.aiImpact?.score ?? 0) > (max.aiImpact?.score ?? 0) ? s : max
  , snapshots[0]);

  // Biggest gainer / decliner
  const sortedByYoY = [...snapshots].sort(
    (a, b) => (b.demand?.yoyChange ?? 0) - (a.demand?.yoyChange ?? 0)
  );
  const biggestGainer = sortedByYoY[0];
  const biggestDecliner = sortedByYoY[sortedByYoY.length - 1];

  // Read template
  let html = fs.readFileSync(TEMPLATE_PATH, "utf-8");

  // Replace simple placeholders
  html = html.replace(/\{\{monthLabel\}\}/g, monthLabel);
  html = html.replace(/\{\{totalOpenings\}\}/g, totalOpenings.toLocaleString());
  html = html.replace(/\{\{avgAIRisk\}\}/g, String(avgAIRisk));
  html = html.replace(/\{\{rolesInDecline\}\}/g, String(rolesInDecline));
  html = html.replace(/\{\{highestRiskRole\}\}/g, highestRiskSnapshot.title);
  html = html.replace(/\{\{dataAsOf\}\}/g, snapshots[0]?.lastUpdated ?? monthKey);

  // Editorial section
  if (editorial) {
    // Remove the {{^editorial}} ... {{/editorial}} block
    html = html.replace(/\{\{\^editorial\}\}[\s\S]*?\{\{\/editorial\}\}/g, "");
    // Replace {{#editorial}} markers
    html = html.replace(/\{\{#editorial\}\}/g, "");
    html = html.replace(/\{\{\/editorial\}\}/g, "");
    html = html.replace(/\{\{editorialHeadline\}\}/g, editorial.headline);
    // Convert body paragraphs to HTML
    const bodyHtml = editorial.body
      .split(/\n\n+/)
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim()}</p>`)
      .join("\n");
    html = html.replace(/\{\{editorialBody\}\}/g, bodyHtml);
  } else {
    // Remove the {{#editorial}} ... {{/editorial}} block
    html = html.replace(/\{\{#editorial\}\}[\s\S]*?\{\{\/editorial\}\}/g, "");
    // Remove markers from fallback block
    html = html.replace(/\{\{\^editorial\}\}/g, "");
    html = html.replace(/\{\{\/editorial\}\}/g, "");
  }

  // Callout boxes
  html = html.replace(/\{\{biggestGainer\.role\}\}/g, biggestGainer.title);
  html = html.replace(/\{\{biggestGainer\.yoy\}\}/g, formatYoY(biggestGainer.demand?.yoyChange ?? 0));
  html = html.replace(/\{\{biggestDecliner\.role\}\}/g, biggestDecliner.title);
  html = html.replace(/\{\{biggestDecliner\.yoy\}\}/g, formatYoY(biggestDecliner.demand?.yoyChange ?? 0));
  html = html.replace(/\{\{highestRisk\.role\}\}/g, highestRiskSnapshot.title);
  html = html.replace(/\{\{highestRisk\.score\}\}/g, String(highestRiskSnapshot.aiImpact?.score ?? 0));

  // Tables
  html = html.replace(/\{\{leaderboardRows\}\}/g, buildLeaderboardRows(snapshots));
  html = html.replace(/\{\{clusterCards\}\}/g, buildClusterCards(snapshots));
  html = html.replace(/\{\{riskRows\}\}/g, buildRiskRows(snapshots));

  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Render PDF via Puppeteer
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.error(
      "Puppeteer not installed. Install it with: npm install --save-dev puppeteer"
    );
    console.log("Saving HTML preview instead...");
    const htmlPath = path.join(REPORTS_DIR, `state-of-creative-jobs-${monthKey}.html`);
    fs.writeFileSync(htmlPath, html);
    console.log(`HTML preview saved to ${htmlPath}`);
    return;
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfPath = path.join(REPORTS_DIR, `state-of-creative-jobs-${monthKey}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "1in", bottom: "1in", left: "1in", right: "1in" },
  });

  await browser.close();
  console.log(`PDF report saved to ${pdfPath}`);
}

const monthKey = getMonthArg();
generateReport(monthKey).catch((err) => {
  console.error("Report generation failed:", err.message);
  process.exit(1);
});
