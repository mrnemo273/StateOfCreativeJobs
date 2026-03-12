"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import ConfidenceBadge from "./ui/ConfidenceBadge";
import SkillGapBar from "./ui/SkillGapBar";
import type { SkillClassification } from "./ui/SkillGapBar";
import HairlineRule from "./ui/HairlineRule";

type Props = {
  snapshot: JobHealthSnapshot;
};

interface ClassifiedSkill {
  skill: string;
  frequencyPercent: number;
  changePercent?: number;
  classification: SkillClassification;
}

/** Normalize skill name for fuzzy matching */
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
}

const CLASS_ORDER: SkillClassification[] = [
  "invest",
  "emerging",
  "core",
  "watch",
  "shed",
];

const CLASS_LABELS: Record<SkillClassification, string> = {
  invest: "Invest \u2014 High Demand + Rising",
  emerging: "Emerging \u2014 Low Demand + Rising",
  core: "Core \u2014 High Demand + Stable",
  watch: "Watch \u2014 High Demand + Declining",
  shed: "Shed \u2014 Low Demand + Declining",
};

export default function SkillsGapSection({ snapshot }: Props) {
  const { postingAnalysis, skills } = snapshot;

  // Build lookup maps
  const risingMap = new Map(
    skills.rising.map((s) => [normalize(s.skill), s.changePercent]),
  );
  const decliningMap = new Map(
    skills.declining.map((s) => [normalize(s.skill), s.changePercent]),
  );

  // Median frequency for "high demand" threshold
  const frequencies = postingAnalysis.topSkills.map(
    (s) => s.frequencyPercent,
  );
  const medianFreq =
    frequencies.length > 0
      ? frequencies.sort((a, b) => a - b)[Math.floor(frequencies.length / 2)]
      : 0;

  const classified: ClassifiedSkill[] = [];

  // Classify skills that appear in postings
  for (const ts of postingAnalysis.topSkills) {
    const key = normalize(ts.skill);
    const isHighDemand = ts.frequencyPercent >= medianFreq;
    const risingChange = risingMap.get(key);
    const decliningChange = decliningMap.get(key);

    let classification: SkillClassification;
    let changePercent: number | undefined;

    if (risingChange != null) {
      classification = isHighDemand ? "invest" : "emerging";
      changePercent = risingChange;
    } else if (decliningChange != null) {
      classification = isHighDemand ? "watch" : "shed";
      changePercent = decliningChange;
    } else {
      classification = isHighDemand ? "core" : "core";
      changePercent = undefined;
    }

    classified.push({
      skill: ts.skill,
      frequencyPercent: ts.frequencyPercent,
      changePercent,
      classification,
    });
  }

  // Add rising/declining skills not in postings
  for (const rs of skills.rising) {
    const key = normalize(rs.skill);
    if (!postingAnalysis.topSkills.some((ts) => normalize(ts.skill) === key)) {
      classified.push({
        skill: rs.skill,
        frequencyPercent: 0,
        changePercent: rs.changePercent,
        classification: "emerging",
      });
    }
  }
  for (const ds of skills.declining) {
    const key = normalize(ds.skill);
    if (!postingAnalysis.topSkills.some((ts) => normalize(ts.skill) === key)) {
      classified.push({
        skill: ds.skill,
        frequencyPercent: 0,
        changePercent: ds.changePercent,
        classification: "shed",
      });
    }
  }

  // Count cross-referenced skills (those with a changePercent)
  const crossReferenced = classified.filter(
    (s) => s.changePercent != null,
  ).length;
  if (crossReferenced < 3) return null;

  // Sort by classification priority, then by frequency
  classified.sort((a, b) => {
    const orderDiff =
      CLASS_ORDER.indexOf(a.classification) -
      CLASS_ORDER.indexOf(b.classification);
    if (orderDiff !== 0) return orderDiff;
    return b.frequencyPercent - a.frequencyPercent;
  });

  // Group by classification
  const groups = CLASS_ORDER.map((cls) => ({
    classification: cls,
    label: CLASS_LABELS[cls],
    skills: classified.filter((s) => s.classification === cls),
  })).filter((g) => g.skills.length > 0);

  return (
    <>
      <HairlineRule />
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-2">
          <SectionLabel>Skills Gap Analysis</SectionLabel>
          <ConfidenceBadge
            sectionKey="skillsGap"
            lastUpdated={snapshot.lastUpdated}
          />
        </div>
        <p className="text-body-sm text-mid mb-6 max-w-[65ch]">
          Skills employers want most, filtered by market direction. Cross-references
          posting frequency with rising and declining skill signals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[var(--grid-gutter)] gap-y-6">
          {groups.map((group) => (
            <div key={group.classification}>
              <span className="text-label-sm text-mid uppercase tracking-widest block mb-3 font-medium">
                {group.label}
              </span>
              <div className="space-y-2">
                {group.skills.map((s) => (
                  <SkillGapBar
                    key={s.skill}
                    skill={s.skill}
                    frequencyPercent={s.frequencyPercent}
                    changePercent={s.changePercent}
                    classification={s.classification}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
