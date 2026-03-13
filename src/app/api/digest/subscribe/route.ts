import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

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

    // In production, send confirmation email via Resend here.
    // For now, return the confirmation token for testing.
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
