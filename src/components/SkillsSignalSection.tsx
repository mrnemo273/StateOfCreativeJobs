"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import SkillBar from "./ui/SkillBar";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function SkillsSignalSection({ snapshot }: Props) {
  const { skills } = snapshot;

  if (skills.rising.length === 0 && skills.declining.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionLabel className="mb-6">Skills Signal</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12 md:col-span-6">
          <span className="text-label-sm text-up uppercase tracking-widest block mb-4 font-medium">
            Rising Skills
          </span>
          <div className="space-y-3">
            {skills.rising.map((s) => (
              <SkillBar
                key={s.skill}
                skill={s.skill}
                value={s.changePercent}
                isRising
              />
            ))}
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 mt-6 md:mt-0">
          <span className="text-label-sm text-down uppercase tracking-widest block mb-4 font-medium">
            Declining Skills
          </span>
          <div className="space-y-3">
            {skills.declining.map((s) => (
              <SkillBar
                key={s.skill}
                skill={s.skill}
                value={s.changePercent}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
