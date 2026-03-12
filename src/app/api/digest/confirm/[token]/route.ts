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
    const { kv } = await import("@vercel/kv");
    await kv.ping();
    return kv;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  const kvStore = await getKV();
  if (!kvStore) {
    return new Response(
      confirmationPage("Service not available. Please try again later.", false),
      { status: 503, headers: { "Content-Type": "text/html" } },
    );
  }

  const id = await kvStore.get<string>(`subscriber:token:${token}`);
  if (!id) {
    return new Response(
      confirmationPage("Invalid or expired confirmation link.", false),
      { status: 404, headers: { "Content-Type": "text/html" } },
    );
  }

  const subscriber = await kvStore.get<Subscriber>(`subscriber:${id}`);
  if (!subscriber) {
    return new Response(
      confirmationPage("Subscriber not found.", false),
      { status: 404, headers: { "Content-Type": "text/html" } },
    );
  }

  // Mark as confirmed
  const updated: Subscriber = { ...subscriber, confirmed: true };
  await kvStore.set(`subscriber:${id}`, updated);

  return new Response(
    confirmationPage("Your subscription is confirmed. You'll receive your first digest soon.", true),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

function confirmationPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>State of Creative Jobs — ${success ? "Confirmed" : "Error"}</title>
  <style>
    body {
      font-family: 'IBM Plex Mono', 'Courier New', monospace;
      background: #F5F3EE;
      color: #0A0A0A;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    .title {
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6B6B6B;
      margin-bottom: 1.5rem;
    }
    .message {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    a {
      color: #1A1A6B;
      text-decoration: none;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">State of Creative Jobs</div>
    <div class="icon">${success ? "&#10003;" : "&#10007;"}</div>
    <div class="message">${message}</div>
    <a href="/">Back to the Index</a>
  </div>
</body>
</html>`;
}
