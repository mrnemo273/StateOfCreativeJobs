export interface ChartAnnotation {
  date: string; // ISO date — position on X axis
  label: string; // Short label for the marker
  detail: string; // Tooltip/expanded text
  scope: "market" | "cluster" | string[]; // Which roles it applies to
}

/**
 * Curated event annotations for trend charts.
 * Add entries here when significant market events affect creative roles.
 */
export const ANNOTATIONS: ChartAnnotation[] = [
  {
    date: "2025-03-14",
    label: "GPT-4o launch",
    detail:
      "GPT-4o multimodal release correlated with industry-wide demand recalibration. Not role-specific.",
    scope: "market",
  },
  {
    date: "2025-06-20",
    label: "Figma AI",
    detail:
      "Figma ships AI-powered auto-layout and design generation. Visible demand shift in Product & UX cluster.",
    scope: [
      "product-designer",
      "senior-product-designer",
      "ux-designer",
      "design-systems-designer",
    ],
  },
];

/**
 * Get annotations that apply to a given role slug and section.
 * Returns annotations scoped to "market", or specifically to this role.
 */
export function getAnnotationsForRole(
  slug: string,
): ChartAnnotation[] {
  return ANNOTATIONS.filter((a) => {
    if (a.scope === "market") return true;
    if (a.scope === "cluster") return true;
    if (Array.isArray(a.scope)) return a.scope.includes(slug);
    return false;
  });
}

/**
 * Generate a freshness note based on how old the data is.
 * Returns null if data is fresh (<= 7 days).
 */
export function freshnessNote(lastUpdated: string): string | null {
  const age = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (age > 14) return `Data is ${age} days old. Refresh pending.`;
  if (age > 7) return `Data last refreshed ${age} days ago.`;
  return null;
}
