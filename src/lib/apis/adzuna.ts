type AdzunaResult = {
  count: number;
  topLocations: string[];
};

/**
 * Fetches job count and top locations for a given job title from the Adzuna API.
 * API docs: https://developer.adzuna.com/activedocs
 *
 * Returns null if credentials are missing or the request fails (graceful fallback).
 */
export async function fetchJobDemand(
  title: string,
): Promise<AdzunaResult | null> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("[Adzuna] Missing ADZUNA_APP_ID or ADZUNA_APP_KEY");
    return null;
  }

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: title,
      "content-type": "application/json",
    });

    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params.toString()}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      console.error(
        `[Adzuna] HTTP ${res.status} for title "${title}": ${res.statusText}`,
      );
      return null;
    }

    const data = (await res.json()) as {
      count: number;
      results: { location: { area: string[] } }[];
    };

    // Count occurrences of each city-level location (area[1])
    const locationCounts = new Map<string, number>();

    for (const result of data.results) {
      const city = result.location?.area?.[1];
      if (city) {
        locationCounts.set(city, (locationCounts.get(city) ?? 0) + 1);
      }
    }

    // Sort by frequency descending and take top 5
    const topLocations = [...locationCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location]) => location);

    return {
      count: data.count,
      topLocations,
    };
  } catch (error) {
    console.error(`[Adzuna] Failed to fetch job demand for "${title}":`, error);
    return null;
  }
}
