// Google Trends API client using SerpApi.
// API docs: https://serpapi.com/google-trends-api

type TrendPoint = {
  date: string;
  value: number;
};

type GoogleTrendsResult = {
  slug: string;
  query: string;
  interestOverTime: TrendPoint[];
  trend: "rising" | "falling" | "stable";
  yoyChange: number | null;
};

/**
 * Mapping of job slugs to Google Trends search queries.
 * Each query targets the job title + "jobs" to capture hiring interest.
 */
const SLUG_TO_TREND_QUERY: Record<string, string> = {
  "creative-director": "creative director jobs",
  "design-director": "design director jobs",
  "head-of-design": "head of design jobs",
  "vp-of-design": "vp of design jobs",
  cco: "chief creative officer jobs",
  "senior-product-designer": "senior product designer jobs",
  "ux-designer": "ux designer jobs",
  "product-designer": "product designer jobs",
  "ux-researcher": "ux researcher jobs",
  "design-systems-designer": "design systems designer jobs",
  "brand-designer": "brand designer jobs",
  "graphic-designer": "graphic designer jobs",
  "visual-designer": "visual designer jobs",
  "art-director": "art director jobs",
  "motion-designer": "motion designer jobs",
  copywriter: "copywriter jobs",
  "content-strategist": "content strategist jobs",
  "ux-writer": "ux writer jobs",
  "creative-copywriter": "creative copywriter jobs",
  "content-designer": "content designer jobs",
};

/**
 * Fetch 12 months of Google Trends search interest data for a job slug.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchGoogleTrends(
  slug: string,
): Promise<GoogleTrendsResult | null> {
  const key = process.env.SERPAPI_KEY;

  if (!key) {
    console.warn("[GoogleTrends] SERPAPI_KEY is not set");
    return null;
  }

  const query = SLUG_TO_TREND_QUERY[slug];
  if (!query) {
    console.warn(`[GoogleTrends] No query mapping for slug "${slug}"`);
    return null;
  }

  try {
    const params = new URLSearchParams({
      engine: "google_trends",
      q: query,
      date: "today 12-m",
      geo: "US",
      api_key: key,
    });
    const url = `https://serpapi.com/search?${params.toString()}`;

    const res = await fetch(url, {
      next: { revalidate: 604800 }, // Cache for 7 days
    });

    if (!res.ok) {
      console.error(
        `[GoogleTrends] HTTP ${res.status} for slug "${slug}": ${res.statusText}`,
      );
      return null;
    }

    const data = await res.json();

    const timeline =
      data?.interest_over_time?.timeline_data as
        | { date: string; values: { extracted_value: number }[] }[]
        | undefined;

    if (!timeline || timeline.length === 0) {
      console.error(
        `[GoogleTrends] No timeline data for slug "${slug}"`,
      );
      return null;
    }

    // Aggregate weekly data points into monthly averages.
    // SerpApi date format: "Mar 2 – 8, 2025" or "Mar 30 – Apr 5, 2025"
    const monthlyBuckets = new Map<string, number[]>();

    for (const entry of timeline) {
      const yearMonth = parseYearMonth(entry.date);
      if (!yearMonth) continue;
      const value = entry.values?.[0]?.extracted_value ?? 0;
      const bucket = monthlyBuckets.get(yearMonth) ?? [];
      bucket.push(value);
      monthlyBuckets.set(yearMonth, bucket);
    }

    const interestOverTime: TrendPoint[] = Array.from(monthlyBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date,
        value: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
      }));

    if (interestOverTime.length < 2) {
      console.error(
        `[GoogleTrends] Insufficient monthly data for slug "${slug}" (${interestOverTime.length} points)`,
      );
      return null;
    }

    // Compute trend: compare avg of last 3 months vs first 3 months
    const first3 = interestOverTime.slice(0, 3);
    const last3 = interestOverTime.slice(-3);
    const avgFirst = first3.reduce((s, p) => s + p.value, 0) / first3.length;
    const avgLast = last3.reduce((s, p) => s + p.value, 0) / last3.length;
    const changePct = avgFirst > 0 ? ((avgLast - avgFirst) / avgFirst) * 100 : 0;

    const trend: "rising" | "falling" | "stable" =
      changePct > 10 ? "rising" : changePct < -10 ? "falling" : "stable";

    // Compute YoY change: last month vs 12 months ago
    let yoyChange: number | null = null;
    if (interestOverTime.length >= 12) {
      const oldest = interestOverTime[0].value;
      const newest = interestOverTime[interestOverTime.length - 1].value;
      if (oldest > 0) {
        yoyChange = Math.round(((newest - oldest) / oldest) * 1000) / 10;
      }
    }

    return {
      slug,
      query,
      interestOverTime,
      trend,
      yoyChange,
    };
  } catch (error) {
    console.error(
      `[GoogleTrends] Failed to fetch trends for slug "${slug}":`,
      error,
    );
    return null;
  }
}

/**
 * Parse a SerpApi date string like "Mar 2 – 8, 2025" into YYYY-MM format.
 * Uses the start date of the range.
 */
function parseYearMonth(dateStr: string): string | null {
  // Formats: "Mar 2 – 8, 2025" or "Dec 29, 2024 – Jan 4, 2025"
  const MONTHS: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  // Try "Mon D – D, YYYY" (same month range)
  const sameMonth = dateStr.match(/^(\w{3})\s+\d+\s*[–—-]\s*\d+,\s*(\d{4})/);
  if (sameMonth) {
    const month = MONTHS[sameMonth[1]];
    if (month) return `${sameMonth[2]}-${month}`;
  }

  // Try "Mon D, YYYY – Mon D, YYYY" (cross-month range)
  const crossMonth = dateStr.match(/^(\w{3})\s+\d+,?\s*(\d{4})/);
  if (crossMonth) {
    const month = MONTHS[crossMonth[1]];
    if (month) return `${crossMonth[2]}-${month}`;
  }

  // Fallback: just find first "Mon" and "YYYY"
  const monthMatch = dateStr.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);
  const yearMatch = dateStr.match(/\b(20\d{2})\b/);
  if (monthMatch && yearMatch) {
    const month = MONTHS[monthMatch[1]];
    if (month) return `${yearMatch[1]}-${month}`;
  }

  return null;
}
