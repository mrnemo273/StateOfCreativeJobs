"use client";

import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import ConfidenceBadge from "./ui/ConfidenceBadge";

type Props = {
  snapshot: JobHealthSnapshot;
};

export default function PostingAnalysisSection({ snapshot }: Props) {
  const { postingAnalysis } = snapshot;

  if (postingAnalysis.topSkills.length === 0 && postingAnalysis.commonResponsibilities.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <SectionLabel>Posting Analysis</SectionLabel>
        <ConfidenceBadge sectionKey="postingAnalysis" lastUpdated={snapshot.lastUpdated} />
      </div>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        {/* Skills frequency table */}
        <div className="col-span-12 md:col-span-6">
          <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
            Top Skills in Postings
          </span>
          {postingAnalysis.topSkills.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink">
                  <th className="text-left text-label-md text-mid uppercase tracking-widest py-2 font-medium">
                    Skill
                  </th>
                  <th className="text-right text-label-md text-mid uppercase tracking-widest py-2 font-medium">
                    Frequency
                  </th>
                </tr>
              </thead>
              <tbody>
                {postingAnalysis.topSkills.map((s) => (
                  <tr
                    key={s.skill}
                    className="border-b border-faint hover:bg-faint transition-colors duration-75"
                  >
                    <td className="py-2 text-body-sm text-dark">{s.skill}</td>
                    <td className="py-2 text-right">
                      <DataValue
                        value={`${s.frequencyPercent}%`}
                        className="text-data-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="text-label-sm text-mid font-mono">N/A</span>
          )}
        </div>

        {/* Responsibilities + role definition */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-6 mt-6 md:mt-0">
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
              Common Responsibilities
            </span>
            {postingAnalysis.commonResponsibilities.length > 0 ? (
              <ul className="space-y-2">
                {postingAnalysis.commonResponsibilities.map((r, i) => (
                  <li key={i} className="text-body-sm text-dark flex gap-2">
                    <span className="text-mid font-mono text-label-md mt-0.5 shrink-0">
                      —
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-label-sm text-mid font-mono">N/A</span>
            )}
          </div>
          <div>
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-3">
              Role Definition
            </span>
            <p className="text-body-sm text-dark leading-relaxed max-w-[65ch]">
              {postingAnalysis.roleDefinition}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
