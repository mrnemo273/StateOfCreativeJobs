"use client";

import { getRoleTimeline } from "@/lib/aiTimeline";
import type { RoleTimeline } from "@/lib/aiTimeline";

interface Props {
  slug: string;
}

const VELOCITY_CONFIG: Record<
  RoleTimeline["velocityLabel"],
  { label: string; color: string; bgColor: string }
> = {
  slow: {
    label: "Slow",
    color: "var(--color-up)",
    bgColor: "var(--color-up-bg)",
  },
  moderate: {
    label: "Moderate",
    color: "var(--color-neutral)",
    bgColor: "var(--color-neutral-bg)",
  },
  fast: {
    label: "Fast",
    color: "#C85A1A",
    bgColor: "#F5EDE6",
  },
  accelerating: {
    label: "Accelerating",
    color: "var(--color-down)",
    bgColor: "var(--color-down-bg)",
  },
};

export default function AITimeline({ slug }: Props) {
  const timeline = getRoleTimeline(slug);
  if (!timeline) return null;

  const velocity = VELOCITY_CONFIG[timeline.velocityLabel];

  return (
    <div className="mt-8 border-t border-light pt-6">
      {/* Header with velocity badge */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-label-sm text-mid uppercase tracking-widest font-mono">
          AI Displacement Timeline
        </span>
        <span
          className="font-mono text-label-sm uppercase tracking-widest px-2 py-0.5 border"
          style={{
            color: velocity.color,
            backgroundColor: velocity.bgColor,
            borderColor: velocity.color,
          }}
        >
          {velocity.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        {/* Labels above bar */}
        <div className="relative h-5 mb-1">
          <span
            className="absolute font-mono text-label-sm text-mid"
            style={{ left: 0 }}
          >
            0%
          </span>
          <span
            className="absolute font-mono text-label-sm text-ink -translate-x-1/2"
            style={{ left: `${timeline.currentCoverage}%` }}
          >
            {timeline.currentCoverage}%
          </span>
          {timeline.projectedCeiling < 95 && (
            <span
              className="absolute font-mono text-label-sm text-mid -translate-x-1/2"
              style={{ left: `${timeline.projectedCeiling}%` }}
            >
              {timeline.projectedCeiling}%
            </span>
          )}
          <span
            className="absolute font-mono text-label-sm text-mid right-0"
          >
            100%
          </span>
        </div>

        {/* Bar */}
        <div className="relative w-full h-2 bg-faint border border-light">
          {/* Filled portion — current coverage */}
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: `${timeline.currentCoverage}%`,
              backgroundColor: "var(--color-neutral)",
            }}
          />
          {/* Projected zone — from current to ceiling */}
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${timeline.currentCoverage}%`,
              width: `${timeline.projectedCeiling - timeline.currentCoverage}%`,
              backgroundColor: "var(--color-neutral)",
              opacity: 0.25,
            }}
          />
          {/* Ceiling marker — dashed line */}
          {timeline.projectedCeiling < 95 && (
            <div
              className="absolute top-[-4px] h-[calc(100%+8px)]"
              style={{
                left: `${timeline.projectedCeiling}%`,
                borderLeft: "2px dashed var(--color-down)",
              }}
            />
          )}
        </div>

        {/* Labels below bar */}
        <div className="flex justify-between mt-1">
          <span className="font-mono text-label-sm text-mid">
            Automatable today
          </span>
          {timeline.projectedCeiling < 95 && (
            <span className="font-mono text-label-sm text-mid">
              Ceiling: {timeline.projectedCeiling}%
            </span>
          )}
        </div>
      </div>

      {/* Milestones */}
      {timeline.milestones.length > 0 && (
        <div className="mb-6">
          <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-4">
            Projected Milestones
          </span>
          <div className="space-y-4 border-l-2 border-light pl-4 ml-1">
            {timeline.milestones.map((milestone, i) => (
              <div key={i} className="relative">
                {/* Dot on the timeline line */}
                <div
                  className="absolute -left-[21px] top-[6px] w-2 h-2 border border-ink"
                  style={{ backgroundColor: "var(--color-paper)" }}
                />
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-data-sm text-ink font-medium">
                    {milestone.date}
                  </span>
                  <span className="font-mono text-label-sm text-mid">
                    &mdash; {milestone.coveragePercent}% task coverage
                  </span>
                </div>
                <p className="text-body-sm text-dark leading-relaxed max-w-[45ch]">
                  {milestone.catalyst}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protective factors */}
      {timeline.protectiveFactors.length > 0 && (
        <div>
          <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-2">
            Protective Factors
          </span>
          <p className="text-body-sm text-mid leading-relaxed max-w-[60ch]">
            {timeline.protectiveFactors.join(", ")} keep the ceiling at ~
            <span className="font-mono text-ink">
              {timeline.projectedCeiling}%
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}
