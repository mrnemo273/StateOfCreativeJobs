"use client";

import { useState } from "react";
import Link from "next/link";
import { getConfidence } from "@/lib/confidenceMap";

type Props = {
  sectionKey: string;
  lastUpdated?: string;
};

const DOT_TOTAL = 4;

export default function ConfidenceBadge({ sectionKey, lastUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const conf = getConfidence(sectionKey, lastUpdated);

  if (!conf) return null;

  const levelColor =
    conf.level === "high"
      ? "text-up"
      : conf.level === "medium"
        ? "text-neutral"
        : "text-down";

  const dots = Array.from({ length: DOT_TOTAL }, (_, i) =>
    i < conf.dots ? "\u25CF" : "\u25CB",
  ).join("");

  // Format "last refreshed" relative time
  let freshness = "";
  if (lastUpdated) {
    const days = Math.floor(
      (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24),
    );
    freshness =
      days === 0
        ? "today"
        : days === 1
          ? "1 day ago"
          : `${days} days ago`;
  }

  return (
    <span
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className={`font-mono text-label-sm tracking-widest ${levelColor}`}
        aria-label={`Confidence: ${conf.level}`}
      >
        {dots}
      </span>
      <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
        {conf.level}
      </span>

      {/* Tooltip */}
      {open && (
        <span className="absolute left-0 top-full mt-1 z-50 bg-ink text-paper p-3 w-64 font-mono text-label-sm leading-relaxed">
          <span className="block uppercase tracking-widest mb-1">
            Confidence: {conf.level}
          </span>
          <span className="block text-light mb-1">
            Sources: {conf.sources}
          </span>
          {conf.note && (
            <span className="block text-light mb-1">{conf.note}</span>
          )}
          {freshness && (
            <span className="block text-light mb-1">
              Last refreshed: {freshness}
            </span>
          )}
          <Link
            href="/methodology"
            className="text-accent-bg underline underline-offset-2 hover:text-paper transition-colors"
          >
            Learn more &rarr;
          </Link>
        </span>
      )}
    </span>
  );
}
