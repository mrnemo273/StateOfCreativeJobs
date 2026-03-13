import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
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

// Valid role slugs
const VALID_SLUGS = new Set([
  "creative-director", "design-director", "head-of-design", "vp-of-design", "cco",
  "senior-product-designer", "ux-designer", "product-designer", "ux-researcher", "design-systems-designer",
  "brand-designer", "graphic-designer", "visual-designer", "art-director", "motion-designer",
  "copywriter", "content-strategist", "ux-writer", "creative-copywriter", "content-designer",
]);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, roles, cadence } = body;

    // Validate email
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email address required." },
        { status: 400 },
      );
    }

    // Validate roles
    if (!Array.isArray(roles) || roles.length === 0 || roles.length > 3) {
      return NextResponse.json(
        { error: "Select 1-3 roles to follow." },
        { status: 400 },
      );
    }
    for (const slug of roles) {
      if (!VALID_SLUGS.has(slug)) {
        return NextResponse.json(
          { error: `Invalid role: ${slug}` },
          { status: 400 },
        );
      }
    }

    // Validate cadence
    if (cadence !== "weekly" && cadence !== "monthly") {
      return NextResponse.json(
        { error: "Cadence must be 'weekly' or 'monthly'." },
        { status: 400 },
      );
    }

    const kvStore = await getKV();
    if (!kvStore) {
      return NextResponse.json(
        { error: "Email subscriptions are not yet configured. Check back soon." },
        { status: 503 },
      );
    }

    // Check if already subscribed
    const existingId = await kvStore.get<string>(`subscriber:email:${email.toLowerCase()}`);
    if (existingId) {
      // Update existing subscription
      const existing = await kvStore.get<Subscriber>(`subscriber:${existingId}`);
      if (existing) {
        const updated: Subscriber = { ...existing, roles, cadence };
        await kvStore.set(`subscriber:${existingId}`, updated);
        return NextResponse.json({
          message: "Subscription updated.",
          requiresConfirmation: !existing.confirmed,
        });
      }
    }

    // Create new subscriber
    const id = uuidv4();
    const confirmToken = uuidv4();

    const subscriber: Subscriber = {
      id,
      email: email.toLowerCase(),
      roles,
      cadence,
      confirmed: false,
      confirmToken,
      createdAt: new Date().toISOString(),
      lastSentAt: null,
    };

    // Store subscriber
    await kvStore.set(`subscriber:${id}`, subscriber);
    await kvStore.set(`subscriber:email:${email.toLowerCase()}`, id);
    await kvStore.set(`subscriber:token:${confirmToken}`, id);

    // Add to subscribers list
    await kvStore.sadd("subscribers:all", id);

    // Send confirmation email via Resend
    const siteUrl = process.env.SITE_URL || "https://creative-jobs.juanemo.com";
    const confirmUrl = `${siteUrl}/api/digest/confirm/${confirmToken}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "State of Creative Jobs <digest@juanemo.com>",
        to: email.toLowerCase(),
        subject: "Confirm your subscription — State of Creative Jobs",
        html: confirmationEmailHtml(confirmUrl, siteUrl),
      });
    }

    return NextResponse.json({
      message: "Check your email to confirm your subscription.",
      requiresConfirmation: true,
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

function confirmationEmailHtml(confirmUrl: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your subscription</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F3EE;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F3EE;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #0A0A0A;">
              <span style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #0A0A0A; font-weight: 500;">
                State of Creative Jobs
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 0;">
              <p style="font-family: 'DM Sans', 'Helvetica Neue', Helvetica, sans-serif; font-size: 15px; color: #1A1A1A; line-height: 1.6; margin: 0 0 16px 0;">
                Confirm your subscription to start receiving digest updates on the roles you follow.
              </p>
              <p style="margin: 0 0 32px 0;">
                <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0A0A0A; color: #F5F3EE; font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                  Confirm Subscription
                </a>
              </p>
              <p style="font-family: 'DM Sans', 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; color: #6B6B6B; line-height: 1.6; margin: 0;">
                If you didn't subscribe, you can ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 16px; border-top: 1px solid #C8C4BC;">
              <p style="font-family: 'IBM Plex Mono', 'Courier New', monospace; font-size: 9px; color: #6B6B6B; line-height: 1.6; margin: 0;">
                <a href="${siteUrl}" style="color: #6B6B6B; text-decoration: underline;">State of Creative Jobs</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
