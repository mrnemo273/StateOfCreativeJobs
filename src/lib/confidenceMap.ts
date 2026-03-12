export type ConfidenceLevel = "high" | "medium" | "low";

export interface SectionConfidence {
  level: ConfidenceLevel;
  dots: number;
  sources: string;
  note: string;
}

const SECTION_CONFIDENCE: Record<string, SectionConfidence> = {
  demand: {
    level: "high",
    dots: 3,
    sources: "Adzuna, Google Trends, Hacker News",
    note: "Adzuna covers ~60% of US postings",
  },
  salary: {
    level: "medium",
    dots: 2,
    sources: "BLS OES",
    note: "Annual survey data; 12\u201318 month lag",
  },
  aiImpact: {
    level: "high",
    dots: 3,
    sources: "O*NET tasks, Editorial TDI",
    note: "TDI scoring is editorial, not algorithmic",
  },
  skills: {
    level: "medium",
    dots: 2,
    sources: "O*NET, Adzuna postings",
    note: "Cross-referenced from task and posting data",
  },
  skillsGap: {
    level: "medium",
    dots: 2,
    sources: "Adzuna + O*NET cross-reference",
    note: "Derived from posting frequency vs. trend signals",
  },
  postingAnalysis: {
    level: "high",
    dots: 3,
    sources: "Adzuna, O*NET",
    note: "Aggregated from current job listings and task data",
  },
  sentiment: {
    level: "medium",
    dots: 2,
    sources: "GNews, Hacker News",
    note: "Keyword-based scoring; HN skews tech audience",
  },
  roleIntelligence: {
    level: "medium",
    dots: 2,
    sources: "Claude (Anthropic)",
    note: "AI-generated synthesis of snapshot data",
  },
  enrichment: {
    level: "medium",
    dots: 2,
    sources: "ACS Census, NEA, FRED",
    note: "Annual data; seeded, not weekly-refreshed",
  },
};

/**
 * Get confidence data for a section, optionally downgrading if data is stale.
 */
export function getConfidence(
  sectionKey: string,
  lastUpdated?: string,
): SectionConfidence | null {
  const entry = SECTION_CONFIDENCE[sectionKey];
  if (!entry) return null;

  // Dynamic downgrade: if snapshot is >7 days old, reduce dots by 1 (min 1)
  if (lastUpdated) {
    const age =
      (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (age > 7 && entry.dots > 1) {
      const newDots = entry.dots - 1;
      return {
        ...entry,
        dots: newDots,
        level: newDots === 1 ? "low" : "medium",
      };
    }
  }

  return entry;
}
