import { NextResponse } from "next/server";

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

async function removeSubscriber(email: string) {
  const kvStore = await getKV();
  if (!kvStore) return { success: false, reason: "unavailable" as const };

  const id = await kvStore.get<string>(`subscriber:email:${email.toLowerCase()}`);
  if (!id) return { success: true, reason: "not_found" as const };

  const subscriber = await kvStore.get<Subscriber>(`subscriber:${id}`);

  await kvStore.del(`subscriber:${id}`);
  await kvStore.del(`subscriber:email:${email.toLowerCase()}`);
  if (subscriber?.confirmToken) {
    await kvStore.del(`subscriber:token:${subscriber.confirmToken}`);
  }
  await kvStore.srem("subscribers:all", id);

  return { success: true, reason: "removed" as const };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(
      unsubscribePage("Missing email address. Please use the unsubscribe link from your email.", false),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  try {
    const result = await removeSubscriber(email);

    if (!result.success) {
      return new Response(
        unsubscribePage("Service temporarily unavailable. Please try again later.", false),
        { status: 503, headers: { "Content-Type": "text/html" } },
      );
    }

    return new Response(
      unsubscribePage("You have been unsubscribed from the State of Creative Jobs digest.", true),
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  } catch (err) {
    console.error("Unsubscribe GET error:", err);
    return new Response(
      unsubscribePage("Something went wrong. Please try again.", false),
      { status: 500, headers: { "Content-Type": "text/html" } },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address required." },
        { status: 400 },
      );
    }

    const result = await removeSubscriber(email);

    if (!result.success) {
      return NextResponse.json(
        { error: "Service not available." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "If this email was subscribed, it has been removed." });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

function unsubscribePage(message: string, success: boolean): string {
  const siteUrl = process.env.SITE_URL || "https://creative-jobs.juanemo.com";
  const privacyUrl = `${siteUrl}/privacy`;
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>State of Creative Jobs \u2014 ${success ? "Unsubscribed" : "Error"}</title>
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
    <h1 class="headline" style="margin-top: 32px;">${success ? "You\u2019re Out." : "Something Went Wrong"}</h1>
    <p class="body-text" style="padding-top: 0;">${message}</p>
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
