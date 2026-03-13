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

    const kvStore = await getKV();
    if (!kvStore) {
      return NextResponse.json(
        { error: "Service not available." },
        { status: 503 },
      );
    }

    const id = await kvStore.get<string>(`subscriber:email:${email.toLowerCase()}`);
    if (!id) {
      // Don't reveal whether the email was subscribed
      return NextResponse.json({ message: "If this email was subscribed, it has been removed." });
    }

    const subscriber = await kvStore.get<Subscriber>(`subscriber:${id}`);

    // Clean up all keys
    await kvStore.del(`subscriber:${id}`);
    await kvStore.del(`subscriber:email:${email.toLowerCase()}`);
    if (subscriber?.confirmToken) {
      await kvStore.del(`subscriber:token:${subscriber.confirmToken}`);
    }
    await kvStore.srem("subscribers:all", id);

    return NextResponse.json({ message: "You have been unsubscribed." });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
