"use client";

import { useState } from "react";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";

interface Props {
  /** Pre-select a role slug (from role deep-dive CTA) */
  initialRole?: string;
  /** Compact mode for inline CTAs on role pages */
  compact?: boolean;
}

export default function DigestSubscribe({ initialRole, compact }: Props) {
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    initialRole ? [initialRole] : [],
  );
  const [cadence, setCadence] = useState<"weekly" | "monthly">("monthly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const availableRoles = TRACKED_JOB_TITLES.filter(
    (r) => !selectedRoles.includes(r.slug),
  );

  function addRole(slug: string) {
    if (selectedRoles.length >= 3) return;
    setSelectedRoles([...selectedRoles, slug]);
    setShowRoleSelector(false);
  }

  function removeRole(slug: string) {
    setSelectedRoles(selectedRoles.filter((s) => s !== slug));
  }

  function getRoleTitle(slug: string): string {
    return TRACKED_JOB_TITLES.find((r) => r.slug === slug)?.title ?? slug;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || selectedRoles.length === 0) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, roles: selectedRoles, cadence }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Subscribed successfully.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={compact ? "" : "p-6 md:p-8"}>
        <span className="font-mono text-label-sm text-up uppercase tracking-widest block mb-2">
          Subscribed
        </span>
        <p className="text-body-sm text-dark">{message}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          Follow {initialRole ? getRoleTitle(initialRole) : "this role"}
        </span>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-3 py-2 border border-light bg-white font-mono text-data-sm text-ink focus:border-ink focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading" || selectedRoles.length === 0}
            className="px-4 py-2 bg-ink text-paper font-mono text-label-md uppercase tracking-widest hover:bg-dark transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Follow"}
          </button>
        </div>
        {status === "error" && (
          <p className="font-mono text-label-sm text-down">{message}</p>
        )}
      </form>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <span className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-2">
        Stay Updated
      </span>
      <h3
        className="font-mono text-ink leading-tight mb-2"
        style={{ fontSize: "var(--text-display-md)" }}
      >
        Get the Digest
      </h3>
      <p className="font-mono text-body-sm text-dark mb-6 max-w-[45ch]">
        Track up to 3 roles. We&rsquo;ll email you when the data moves.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 border border-light bg-white font-mono text-data-sm text-ink focus:border-ink focus:outline-none transition-colors"
          />
        </div>

        {/* Selected roles */}
        <div>
          <label className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-2">
            Roles ({selectedRoles.length}/3)
          </label>
          <div className="space-y-2">
            {selectedRoles.map((slug) => (
              <div
                key={slug}
                className="flex items-center justify-between px-3 py-2 border border-light bg-white"
              >
                <span className="font-mono text-data-sm text-ink">
                  {getRoleTitle(slug)}
                </span>
                <button
                  type="button"
                  onClick={() => removeRole(slug)}
                  className="font-mono text-label-md text-mid hover:text-down transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
            {selectedRoles.length < 3 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="w-full px-3 py-2 border border-dashed border-light text-left font-mono text-label-md text-mid hover:border-ink hover:text-ink transition-colors"
                >
                  + Add role
                </button>
                {showRoleSelector && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-light bg-white">
                    {availableRoles.map((role) => (
                      <button
                        key={role.slug}
                        type="button"
                        onClick={() => addRole(role.slug)}
                        className="block w-full text-left px-3 py-2 font-mono text-data-sm text-ink hover:bg-faint transition-colors border-b border-faint last:border-b-0"
                      >
                        {role.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cadence */}
        <div>
          <label className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-2">
            Cadence
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cadence"
                value="weekly"
                checked={cadence === "weekly"}
                onChange={() => setCadence("weekly")}
                className="accent-ink"
              />
              <span className="font-mono text-data-sm text-ink">Weekly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cadence"
                value="monthly"
                checked={cadence === "monthly"}
                onChange={() => setCadence("monthly")}
                className="accent-ink"
              />
              <span className="font-mono text-data-sm text-ink">Monthly</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "loading" || selectedRoles.length === 0}
          className="w-full py-3 bg-ink text-paper font-mono text-label-md uppercase tracking-widest hover:bg-dark transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>

        {status === "error" && (
          <p className="font-mono text-label-sm text-down">{message}</p>
        )}

        <p className="font-mono text-label-sm text-mid">
          No spam. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
