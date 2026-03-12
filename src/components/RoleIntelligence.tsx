"use client";

import { useEffect, useState } from "react";
import SectionLabel from "./ui/SectionLabel";

interface ComparableRole {
  slug: string;
  title: string;
  aiRiskScore: number;
  aiRiskLabel: string;
  demandYoY: string;
  salary: string;
}

interface SkillPivotItem {
  headline: string;
  body: string;
}

interface InsightCard {
  id: "contraction" | "salary-reality" | "supply-picture";
  title: string;
  body: string;
  source: string;
}

interface RoleIntelligenceData {
  outlook: string | null;
  insightCards?: InsightCard[];
  skillPivots: SkillPivotItem[];
  comparableRoles: ComparableRole[];
}

interface Props {
  slug: string;
}

function getRiskColor(label: string): string {
  switch (label) {
    case "Low":
      return "var(--color-up)";
    case "Moderate":
      return "#B8860B";
    case "Elevated":
      return "#C85A1A";
    case "High":
      return "var(--color-down)";
    default:
      return "var(--color-neutral)";
  }
}

export default function RoleIntelligence({ slug }: Props) {
  const [data, setData] = useState<RoleIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);
    fetch(`/api/role-intelligence/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <section>
        <SectionLabel className="mb-6">What the Data Actually Tells Us</SectionLabel>
        <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
          <div className="col-span-12 md:col-span-8">
            <div className="h-4 bg-faint animate-pulse mb-3 w-3/4" />
            <div className="h-4 bg-faint animate-pulse mb-3 w-full" />
            <div className="h-4 bg-faint animate-pulse mb-3 w-5/6" />
            <div className="h-4 bg-faint animate-pulse mb-6 w-2/3" />
            <div className="h-4 bg-faint animate-pulse mb-3 w-full" />
            <div className="h-4 bg-faint animate-pulse mb-3 w-4/5" />
            <div className="h-4 bg-faint animate-pulse mb-3 w-full" />
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="h-4 bg-faint animate-pulse mb-3 w-1/2" />
            <div className="h-12 bg-faint animate-pulse mb-2" />
            <div className="h-12 bg-faint animate-pulse mb-2" />
            <div className="h-12 bg-faint animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const isEmpty = !data || (!data.outlook && (!data.skillPivots || data.skillPivots.length === 0) && data.comparableRoles.length === 0);

  if (error || isEmpty) {
    return (
      <section>
        <SectionLabel className="mb-6">What the Data Actually Tells Us</SectionLabel>
        <p className="text-body-sm text-mid">
          Analysis unavailable for this role.
        </p>
      </section>
    );
  }

  // Split outlook into headline (first sentence) and body
  const firstSentenceMatch = data.outlook?.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  const outlookHeadline = firstSentenceMatch ? firstSentenceMatch[1] : data.outlook;
  const outlookBody = firstSentenceMatch ? firstSentenceMatch[2] : null;

  return (
    <section>
      <SectionLabel className="mb-6">What the Data Actually Tells Us</SectionLabel>

      {/* Insight Cards — 3-up bordered grid */}
      {data.insightCards && data.insightCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--grid-gutter)] mb-8">
          {data.insightCards.map((card) => (
            <div key={card.id} className="border border-light p-6">
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
                {card.title}
              </span>
              <p className="text-body-sm text-dark leading-relaxed">
                {card.body}
              </p>
              <span className="text-label-sm text-mid block mt-3">
                {card.source}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        {/* Left column: Outlook + Strategic Recommendations */}
        <div className="col-span-12 md:col-span-8 flex flex-col gap-8">
          {/* Outlook (shown when no insight cards) */}
          {data.outlook && !(data.insightCards && data.insightCards.length > 0) && (
            <div>
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-3 font-medium">
                Role Outlook
              </span>
              <p className="font-mono text-ink leading-tight max-w-[65ch]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
                {outlookHeadline}
              </p>
              {outlookBody && (
                <p className="text-body text-dark leading-relaxed max-w-[65ch] mt-6">
                  {outlookBody}
                </p>
              )}
            </div>
          )}

          {/* Strategic Recommendations */}
          {data.skillPivots?.length > 0 && (
            <div>
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-3 font-medium">
                Strategic Recommendations
              </span>
              <div className="space-y-5">
                {data.skillPivots.map((item, i) => (
                  <div key={i} className="max-w-[65ch]">
                    <span className="text-body-sm text-ink font-semibold block mb-1">
                      {i + 1}. {item.headline}
                    </span>
                    <p className="text-body-sm text-dark leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Comparable Roles */}
        <div className="col-span-12 md:col-span-4">
          {data.comparableRoles.length > 0 && (
            <div>
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-3 font-medium">
                Lower-Risk Alternatives
              </span>
              <div className="space-y-2">
                {data.comparableRoles.map((role) => (
                  <div
                    key={role.slug}
                    className="border border-light p-4 flex flex-col gap-2"
                  >
                    <span className="text-label-md font-mono text-ink">
                      {role.title}
                    </span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-label-sm font-mono uppercase px-2 py-0.5"
                        style={{
                          color: getRiskColor(role.aiRiskLabel),
                          backgroundColor: `color-mix(in srgb, ${getRiskColor(role.aiRiskLabel)} 10%, transparent)`,
                        }}
                      >
                        {role.aiRiskLabel} {role.aiRiskScore}
                      </span>
                      <span className="text-label-sm font-mono text-mid">
                        {role.salary}
                      </span>
                      <span className="text-label-sm font-mono text-mid">
                        {role.demandYoY} YoY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
