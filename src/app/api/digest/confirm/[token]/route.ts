import fs from "fs";
import path from "path";
import { Resend } from "resend";

interface Subscriber {
  id: string;
  email: string;
  roles: string[];
  cadence: "weekly" | "monthly";
  confirmed: boolean;
  confirmToken: string;
  createdAt: string;
  lastSentAt: string | null;
}

async function getKV() {
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    await redis.ping();
    return redis;
  } catch {
    return null;
  }
}

function getRiskLabel(score: number): string {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "Elevated";
  return "High";
}

function formatSalary(n: number): string {
  if (!n || n <= 0) return "N/A";
  return `$${Math.round(n / 1000).toLocaleString()}k`;
}

function readSnapshot(slug: string): Record<string, unknown> | null {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "snapshots", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function slugToTitle(slug: string): string {
  return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function buildWelcomeRolePreview(roles: string[], siteUrl: string): string {
  const rows: string[] = [];
  for (let i = 0; i < roles.length; i++) {
    const slug = roles[i];
    const snap = readSnapshot(slug) as Record<string, unknown> | null;
    if (!snap) continue;
    const demand = (snap.demand as Record<string, unknown>)?.openingsCount as number ?? 0;
    const salary = (snap.salary as Record<string, unknown>)?.medianUSD as number ?? 0;
    const aiRisk = (snap.aiImpact as Record<string, unknown>)?.score as number ?? 0;
    const title = (snap.title as string) || slugToTitle(slug);
    const roleUrl = `${siteUrl}/role/${slug}`;
    const isLast = i === roles.length - 1;
    rows.push(`
              <tr>
                <td style="padding: 20px 0 ${isLast ? "32px" : "16px"} 0;${isLast ? "" : " border-bottom: 1px solid #C8C4BC;"}">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding-bottom: 10px;">
                        <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 16px; text-transform: uppercase; letter-spacing: 0.1em; color: #0A0A0A; font-weight: 600;">${title}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding-right: 28px;">
                              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em;">Demand</span><br>
                              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${demand.toLocaleString()}</span>
                            </td>
                            <td style="padding-right: 28px;">
                              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em;">Salary</span><br>
                              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${formatSalary(salary)}</span>
                            </td>
                            <td>
                              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em;">AI Risk</span><br>
                              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 14px; color: #0A0A0A;">${aiRisk}/100 ${getRiskLabel(aiRisk)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 12px;">
                        <a href="${roleUrl}" style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #0A0A0A; text-decoration: none; font-weight: 500;">View Role &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`);
  }
  return rows.join("\n");
}

function buildWelcomeEmail(subscriber: Subscriber): string {
  const siteUrl = process.env.SITE_URL || "https://creative-jobs.juanemo.com";
  const roleCount = subscriber.roles.length;
  const rolePreviewHtml = buildWelcomeRolePreview(subscriber.roles, siteUrl);
  const unsubscribeUrl = `${siteUrl}/api/digest/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
  const privacyUrl = `${siteUrl}/privacy`;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Index</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F3EE;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F3EE;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Header: big site title -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 22px; text-transform: uppercase; letter-spacing: 0.12em; color: #0A0A0A; font-weight: 700; line-height: 1.3; display: block;">
                State of<br>Creative Jobs
              </span>
            </td>
          </tr>
          <tr><td style="border-bottom: 1px solid #0A0A0A; font-size: 0; line-height: 0;">&nbsp;</td></tr>

          <!-- Module 1: Welcome headline centered -->
          <tr>
            <td align="center" style="padding: 40px 0 32px 0;">
              <h1 style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 36px; font-weight: 700; color: #0A0A0A; margin: 0 0 20px 0; line-height: 1.15;">
                Welcome to the Index.
              </h1>
              <p style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 15px; color: #6B6B6B; line-height: 1.6; margin: 0; max-width: 440px;">
                You\u2019re now subscribed to the ${subscriber.cadence} digest. Each edition includes role demand snapshots, AI risk scores, salary benchmarks, and notable headlines for the roles you follow.
              </p>
            </td>
          </tr>

          <tr><td style="border-bottom: 1px solid #0A0A0A; font-size: 0; line-height: 0;">&nbsp;</td></tr>

          <!-- Module 2: Live snapshot, left-justified -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #6B6B6B; font-weight: 500;">
                Your Roles \u2014 Live Snapshot
              </span>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 4px;">
                ${rolePreviewHtml}
              </table>
            </td>
          </tr>

          <tr><td style="border-bottom: 1px solid #0A0A0A; font-size: 0; line-height: 0;">&nbsp;</td></tr>

          <!-- Module 3: Quick tips -->
          <tr>
            <td style="padding: 32px 0;">
              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #6B6B6B; font-weight: 500;">
                Quick Tips
              </span>
              <p style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 15px; color: #6B6B6B; line-height: 1.6; margin: 16px 0 0 0;">
                You\u2019re tracking ${roleCount} role${roleCount !== 1 ? "s" : ""}. You can update your preferences or add more roles anytime from the site.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td>
                    <a href="${siteUrl}" style="display: block; padding: 14px 24px; background-color: #0A0A0A; color: #F5F3EE; font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; text-align: center;">
                      Visit the Index &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr><td style="border-bottom: 1px solid #C8C4BC; font-size: 0; line-height: 0;">&nbsp;</td></tr>
          <tr>
            <td align="center" style="padding: 24px 0 8px 0;">
              <span style="font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #0A0A0A; font-weight: 600;">
                State of Creative Jobs
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 0 4px 0;">
              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 12px; color: #999; line-height: 1.6;">
                Data-driven insights for creative professionals.
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 8px 0 0 0;">
              <a href="${privacyUrl}" style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #6B6B6B; text-decoration: underline;">Privacy Policy</a>
              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #C8C4BC; padding: 0 8px;">&middot;</span>
              <a href="${unsubscribeUrl}" style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 11px; color: #6B6B6B; text-decoration: underline;">Unsubscribe</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 12px 0 0 0;">
              <span style="font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif; font-size: 10px; color: #C8C4BC;">
                &copy; ${year} State of Creative Jobs. All rights reserved.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const siteUrl = process.env.SITE_URL || "https://creative-jobs.juanemo.com";

  const kvStore = await getKV();
  if (!kvStore) {
    return new Response(
      confirmationPage("Service not available. Please try again later.", false, siteUrl),
      { status: 503, headers: { "Content-Type": "text/html" } },
    );
  }

  const id = await kvStore.get<string>(`subscriber:token:${token}`);
  if (!id) {
    return new Response(
      confirmationPage("Invalid or expired confirmation link.", false, siteUrl),
      { status: 404, headers: { "Content-Type": "text/html" } },
    );
  }

  const subscriber = await kvStore.get<Subscriber>(`subscriber:${id}`);
  if (!subscriber) {
    return new Response(
      confirmationPage("Subscriber not found.", false, siteUrl),
      { status: 404, headers: { "Content-Type": "text/html" } },
    );
  }

  // Mark as confirmed
  const updated: Subscriber = { ...subscriber, confirmed: true };
  await kvStore.set(`subscriber:${id}`, updated);

  // Send welcome email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "State of Creative Jobs <digest@juanemo.com>",
        to: subscriber.email,
        subject: "Welcome to the Index \u2014 State of Creative Jobs",
        html: buildWelcomeEmail(updated),
      });
    } catch (err) {
      console.error("Failed to send welcome email:", err);
    }
  }

  const cadenceLabel = subscriber.cadence === "weekly" ? "weekly" : "monthly";
  const roleCount = subscriber.roles.length;

  return new Response(
    confirmationPage(
      `You\u2019ll receive a ${cadenceLabel} digest covering ${roleCount} role${roleCount !== 1 ? "s" : ""} you follow. Your first digest will arrive on the next scheduled send.`,
      true,
      siteUrl,
    ),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

function confirmationPage(message: string, success: boolean, siteUrl: string): string {
  const privacyUrl = `${siteUrl}/privacy`;
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>State of Creative Jobs \u2014 ${success ? "Confirmed" : "Error"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif;
      background: #F5F3EE;
      color: #0A0A0A;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 80px 24px;
    }
    .container {
      max-width: 520px;
      width: 100%;
    }
    .site-title {
      font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #0A0A0A;
      font-weight: 700;
      line-height: 1.3;
      text-align: center;
      margin-bottom: 32px;
    }
    .headline {
      font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace;
      font-size: 36px;
      font-weight: 700;
      line-height: 1.15;
      color: #0A0A0A;
      margin-bottom: 24px;
      text-align: center;
    }
    hr {
      border: none;
      border-top: 1px solid #0A0A0A;
      margin: 0;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #6B6B6B;
      padding: 32px 0;
      text-align: center;
    }
    hr.light {
      border-top-color: #C8C4BC;
    }
    .footer {
      padding-top: 24px;
      text-align: center;
    }
    .footer-cta {
      display: inline-block;
      padding: 14px 32px;
      background-color: #0A0A0A;
      color: #F5F3EE;
      font-family: 'IBM Plex Mono', 'Andale Mono', 'Menlo', monospace;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-decoration: none;
      font-weight: 500;
    }
    .footer-cta:hover { opacity: 0.8; }
    .footer-links {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #C8C4BC;
      text-align: center;
    }
    .footer-links a {
      font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 11px;
      color: #6B6B6B;
      text-decoration: underline;
    }
    .footer-links .dot {
      font-size: 11px;
      color: #C8C4BC;
      padding: 0 8px;
    }
    .copyright {
      font-family: 'DM Sans', 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 10px;
      color: #C8C4BC;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="site-title">State of<br>Creative Jobs</div>
    <hr>
    <h1 class="headline" style="margin-top: 32px;">${success ? "You\u2019re In." : "Something Went Wrong"}</h1>
    <p class="body-text" style="padding-top: 0;">${message}${!success ? " Please check the link and try again, or re-subscribe from the site." : ""}</p>
    <hr class="light">
    <div class="footer">
      <a href="${siteUrl}" class="footer-cta">Back to the Index &rarr;</a>
      <div class="footer-links">
        <a href="${privacyUrl}">Privacy Policy</a>
        <span class="dot">&middot;</span>
        <a href="${siteUrl}">Home</a>
        <p class="copyright">&copy; ${year} State of Creative Jobs. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
