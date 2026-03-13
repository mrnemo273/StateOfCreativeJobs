#!/usr/bin/env node

/**
 * generate-digest.mjs
 *
 * Reads subscribers from Upstash Redis, builds per-subscriber emails
 * with tracked roles' data, sends via Resend.
 *
 * Usage:
 *   node scripts/generate-digest.mjs               # send digests for due subscribers
 *   node scripts/generate-digest.mjs --dry-run      # preview without sending
 *   node scripts/generate-digest.mjs --type weekly   # only weekly subscribers
 *   node scripts/generate-digest.mjs --type monthly  # only monthly subscribers
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SNAPSHOTS_DIR = path.join(ROOT, "src", "data", "snapshots");
const TEMPLATE_PATH = path.join(ROOT, "scripts", "templates", "digest-email.html");

const SITE_URL = process.env.SITE_URL || "https://creative-jobs.juanemo.com";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const typeFilter = args.includes("--type")
  ? args[args.indexOf("--type") + 1]
  : null;

function readSnapshot(slug) {
  const filePath = path.join(SNAPSHOTS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function formatSalary(n) {
  if (!n || n <= 0) return "N/A";
  return `$${Math.round(n / 1000).toLocaleString()}k`;
}

function formatYoY(n) {
  if (n > 0) return `+${n.toFixed(1)}%`;
  return `${n.toFixed(1)}%`;
}

function getYoYArrow(n) {
  if (n > 0) return "↑";
  if (n < 0) return "↓";
  return "→";
}

function getYoYColor(n) {
  if (n > 0) return "#4A6E52";
  if (n < 0) return "#8B5A5A";
  return "#7A6D42";
}

function getRiskLabel(score) {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "Elevated";
  return "High";
}

function buildRoleSection(snapshot, slug, isLast = false) {
  const demand = snapshot.demand?.openingsCount ?? 0;
  const demandYoY = snapshot.demand?.yoyChange ?? 0;
  const salary = snapshot.salary?.medianUSD ?? 0;
  const salaryYoY = snapshot.salary?.yoyChange ?? 0;
  const aiRisk = snapshot.aiImpact?.score ?? 0;
  const riskLabel = getRiskLabel(aiRisk);
  const roleUrl = `${SITE_URL}/role/${slug}`;

  // Get most notable headline
  const headline = snapshot.sentiment?.recentHeadlines?.[0];
  const notableText = headline
    ? `"${headline.headline}" \u2014 ${headline.source}`
    : null;

  const hrSeparator = isLast ? "" : `
          <tr>
            <td style="border-bottom: 1px solid #C8C4BC; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>`;

  return `
          <tr>
            <td class="role-section" style="padding: 24px 0;">
              <!-- Role name -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 14px;">
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em; color: #0A0A0A; font-weight: 600;">
                      ${snapshot.title}
                    </span>
                  </td>
                </tr>
              </table>
              <!-- Stats -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 3px 0;">
                    <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 13px; color: #6B6B6B; display: inline-block; width: 64px;">Demand</span>
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${demand.toLocaleString()} openings</span>
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: ${getYoYColor(demandYoY)};">(${getYoYArrow(demandYoY)} ${formatYoY(demandYoY)})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">
                    <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 13px; color: #6B6B6B; display: inline-block; width: 64px;">Salary</span>
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${formatSalary(salary)}</span>
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: ${getYoYColor(salaryYoY)};">(${getYoYArrow(salaryYoY)} ${salaryYoY === 0 ? "flat" : formatYoY(salaryYoY)})</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">
                    <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 13px; color: #6B6B6B; display: inline-block; width: 64px;">AI Risk</span>
                    <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${aiRisk}/100 ${riskLabel}</span>
                  </td>
                </tr>
                ${notableText ? `
                <tr>
                  <td style="padding: 10px 0 0 0;">
                    <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 12px; color: #6B6B6B; font-style: italic;">${notableText}</span>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 14px 0 0 0;">
                    <a href="${roleUrl}" style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #0A0A0A; text-decoration: none; font-weight: 500;">View Role &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>${hrSeparator}`;
}

async function main() {
  console.log(`Digest generator ${dryRun ? "(DRY RUN)" : ""}`);

  // Check for Resend API key
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey && !dryRun) {
    console.error("RESEND_API_KEY not set. Use --dry-run to preview.");
    process.exit(1);
  }

  // Check for KV
  let kvStore;
  try {
    const { Redis } = await import("@upstash/redis");
    kvStore = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    await kvStore.ping();
  } catch {
    console.error("Upstash Redis not available. Cannot read subscribers.");
    process.exit(1);
  }

  // Get all subscriber IDs
  const subscriberIds = await kvStore.smembers("subscribers:all");
  if (!subscriberIds || subscriberIds.length === 0) {
    console.log("No subscribers found.");
    return;
  }

  console.log(`Found ${subscriberIds.length} subscribers.`);

  // Read email template
  const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

  // Set up Resend if not dry run
  let resend;
  if (!dryRun && resendKey) {
    const { Resend } = await import("resend");
    resend = new Resend(resendKey);
  }

  const now = new Date();
  const dateStr = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  let sent = 0;
  let skipped = 0;

  for (const id of subscriberIds) {
    const subscriber = await kvStore.get(`subscriber:${id}`);
    if (!subscriber || !subscriber.confirmed) {
      skipped++;
      continue;
    }

    // Filter by type
    if (typeFilter && subscriber.cadence !== typeFilter) {
      skipped++;
      continue;
    }

    // Build role sections
    const roleSections = [];
    const subjectParts = [];

    const validEntries = [];
    for (const slug of subscriber.roles) {
      const snapshot = readSnapshot(slug);
      if (!snapshot) continue;
      validEntries.push({ snapshot, slug });
      const yoy = snapshot.demand?.yoyChange ?? 0;
      subjectParts.push(`${snapshot.title} ${getYoYArrow(yoy)}${formatYoY(yoy)}`);
    }

    for (let i = 0; i < validEntries.length; i++) {
      roleSections.push(buildRoleSection(validEntries[i].snapshot, validEntries[i].slug, i === validEntries.length - 1));
    }

    if (roleSections.length === 0) {
      skipped++;
      continue;
    }

    const digestType = subscriber.cadence === "weekly" ? "Weekly Digest" : "Monthly Digest";
    const subjectLine = subscriber.cadence === "weekly"
      ? `Weekly Digest: ${subjectParts.join(", ")} — State of Creative Jobs`
      : `${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}: Your Roles Report — State of Creative Jobs`;

    // Populate template
    let emailHtml = template
      .replace(/\{\{subjectLine\}\}/g, subjectLine)
      .replace(/\{\{digestType\}\}/g, digestType)
      .replace(/\{\{digestDate\}\}/g, dateStr)
      .replace(/\{\{roleSections\}\}/g, roleSections.join("\n"))
      .replace(/\{\{siteUrl\}\}/g, SITE_URL)
      .replace(/\{\{privacyUrl\}\}/g, `${SITE_URL}/privacy`)
      .replace(/\{\{year\}\}/g, String(now.getFullYear()))
      .replace(/\{\{unsubscribeUrl\}\}/g, `${SITE_URL}/api/digest/unsubscribe?email=${encodeURIComponent(subscriber.email)}`);

    // Editorial link (if exists)
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const editorialPath = path.join(ROOT, "src", "data", "editorials", `${monthKey}.json`);
    if (fs.existsSync(editorialPath)) {
      emailHtml = emailHtml
        .replace(/\{\{#editorialUrl\}\}/g, "")
        .replace(/\{\{\/editorialUrl\}\}/g, "")
        .replace(/\{\{editorialUrl\}\}/g, `${SITE_URL}/editorial/${monthKey}`);
    } else {
      emailHtml = emailHtml.replace(/\{\{#editorialUrl\}\}[\s\S]*?\{\{\/editorialUrl\}\}/g, "");
    }

    if (dryRun) {
      console.log(`\n--- Would send to: ${subscriber.email} ---`);
      console.log(`Subject: ${subjectLine}`);
      console.log(`Roles: ${subscriber.roles.join(", ")}`);
      sent++;
    } else {
      try {
        await resend.emails.send({
          from: "State of Creative Jobs <digest@juanemo.com>",
          to: subscriber.email,
          subject: subjectLine,
          html: emailHtml,
        });

        // Update lastSentAt
        await kvStore.set(`subscriber:${id}`, {
          ...subscriber,
          lastSentAt: now.toISOString(),
        });

        sent++;
        console.log(`Sent to ${subscriber.email}`);
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err.message);
      }
    }
  }

  console.log(`\nDone. Sent: ${sent}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Digest generation failed:", err.message);
  process.exit(1);
});
