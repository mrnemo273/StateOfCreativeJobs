type BLSResult = {
  annualMeanWage: number;
  percentile10: number;
  percentile90: number;
  yoyChange: number;
};

/**
 * Mapping of job slugs to BLS Standard Occupational Classification (SOC) codes.
 * These are used to build OES series IDs for the BLS timeseries API.
 *
 * Source: https://www.bls.gov/oes/current/oes_stru.htm
 */
export const SLUG_TO_SOC: Record<string, string> = {
  "creative-director": "27-1011", // Art Directors
  "design-director": "27-1011", // Art Directors
  "head-of-design": "11-1021", // General and Operations Managers (closest)
  "vp-of-design": "11-2021", // Marketing Managers
  "cco": "11-2011", // Advertising and Promotions Managers
  "senior-product-designer": "27-1021", // Commercial and Industrial Designers
  "ux-designer": "15-1255", // Web and Digital Interface Designers
  "product-designer": "27-1021", // Commercial and Industrial Designers
  "ux-researcher": "19-3022", // Survey Researchers (closest match)
  "design-systems-designer": "15-1255", // Web and Digital Interface Designers
  "brand-designer": "27-1024", // Graphic Designers
  "graphic-designer": "27-1024", // Graphic Designers
  "visual-designer": "27-1024", // Graphic Designers
  "art-director": "27-1011", // Art Directors
  "motion-designer": "27-1014", // Special Effects Artists and Animators
  "copywriter": "27-3043", // Writers and Authors
  "content-strategist": "27-3043", // Writers and Authors
  "ux-writer": "27-3043", // Writers and Authors
  "creative-copywriter": "27-3043", // Writers and Authors
  "content-designer": "15-1255", // Web and Digital Interface Designers
};

/**
 * Builds a BLS OES national annual mean wage series ID from a SOC code.
 *
 * Format: OEUN + area (0000000) + area_type (00) + industry (000000) + SOC (6 digits) + data_type (0000013)
 * Prefix "OEUN" = OES, U = annual, N = national
 * Data type 13 = annual mean wage
 *
 * Example: SOC 27-1011 -> OEUN0000000000002710110000013
 */
function buildSeriesId(soc: string, dataType: string): string {
  const socNoDash = soc.replace("-", "");
  return `OEUN0000000000000${socNoDash}${dataType}`;
}

/**
 * Fetches salary data for a job slug from the Bureau of Labor Statistics API v2.
 *
 * Uses OES (Occupational Employment and Wage Statistics) national data.
 * API docs: https://www.bls.gov/developers/
 *
 * The BLS_API_KEY environment variable is optional. Without it, requests are
 * limited to 25 per day and 10-year date ranges. With a key, limits increase
 * to 500 requests/day and 20-year ranges.
 *
 * Returns null if the slug has no SOC mapping or the request fails.
 */
export async function fetchSalaryData(
  slug: string,
): Promise<BLSResult | null> {
  const soc = SLUG_TO_SOC[slug];
  if (!soc) {
    console.warn(`[BLS] No SOC code mapping for slug "${slug}"`);
    return null;
  }

  try {
    // Data type suffixes for OES national series (2-digit codes):
    // 04 = annual mean wage
    // 12 = annual 10th percentile wage
    // 15 = annual 75th percentile wage
    const seriesIds = [
      buildSeriesId(soc, "04"), // annual mean wage
      buildSeriesId(soc, "12"), // 10th percentile
      buildSeriesId(soc, "15"), // 75th percentile
    ];

    const body: Record<string, unknown> = {
      seriesid: seriesIds,
      startyear: "2023",
      endyear: "2024",
    };

    const apiKey = process.env.BLS_API_KEY;
    if (apiKey) {
      body.registrationkey = apiKey;
    }

    const res = await fetch(
      "https://api.bls.gov/publicAPI/v2/timeseries/data/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: 604800 },
      },
    );

    if (!res.ok) {
      console.error(
        `[BLS] HTTP ${res.status} for slug "${slug}": ${res.statusText}`,
      );
      return null;
    }

    const json = (await res.json()) as {
      status: string;
      message: string[];
      Results?: {
        series: {
          seriesID: string;
          data: { year: string; period: string; value: string }[];
        }[];
      };
    };

    if (json.status !== "REQUEST_SUCCEEDED" || !json.Results) {
      console.error(
        `[BLS] API error for slug "${slug}": ${json.status}`,
        json.message,
      );
      return null;
    }

    const { series } = json.Results;
    if (series.length < 3) {
      console.error(
        `[BLS] Expected 3 series but got ${series.length} for slug "${slug}"`,
      );
      return null;
    }

    // Extract value for a specific year from a series, or the latest if year is omitted.
    const getValue = (
      s: { data: { year: string; value: string }[] } | undefined,
      year?: string,
    ): number | null => {
      if (!s || s.data.length === 0) return null;
      const entry = year
        ? s.data.find((d) => d.year === year)
        : s.data[0];
      if (!entry) return null;
      const val = parseFloat(entry.value);
      return isNaN(val) ? null : val;
    };

    // Match series by their IDs to ensure correct assignment
    const meanSeries = series.find(
      (s) => s.seriesID === seriesIds[0],
    );
    const p10Series = series.find(
      (s) => s.seriesID === seriesIds[1],
    );
    const p90Series = series.find(
      (s) => s.seriesID === seriesIds[2],
    );

    const annualMeanWage = getValue(meanSeries);
    const percentile10 = getValue(p10Series);
    const percentile90 = getValue(p90Series);

    if (annualMeanWage === null || percentile10 === null || percentile90 === null) {
      console.error(
        `[BLS] Missing wage data for slug "${slug}": mean=${annualMeanWage}, p10=${percentile10}, p90=${percentile90}`,
      );
      return null;
    }

    // Compute YoY change from 2023 → 2024 mean wage
    const mean2024 = getValue(meanSeries, "2024");
    const mean2023 = getValue(meanSeries, "2023");
    const yoyChange =
      mean2024 !== null && mean2023 !== null && mean2023 !== 0
        ? Math.round(((mean2024 - mean2023) / mean2023) * 1000) / 10
        : 0;

    return {
      annualMeanWage,
      percentile10,
      percentile90,
      yoyChange,
    };
  } catch (error) {
    console.error(
      `[BLS] Failed to fetch salary data for slug "${slug}":`,
      error,
    );
    return null;
  }
}
