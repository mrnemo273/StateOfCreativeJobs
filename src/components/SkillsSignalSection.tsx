"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import SkillBar from "./ui/SkillBar";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function SkillsSignalSection({ snapshot }: Props) {
  const { skills } = snapshot;

  return (
    <section>
      <SectionLabel className="mb-6">Skills Signal</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-6">
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
        <div className="col-span-6">
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
