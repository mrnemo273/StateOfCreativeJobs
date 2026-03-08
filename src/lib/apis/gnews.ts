// GNews API client for fetching industry news relevant to creative roles.
// API docs: https://gnews.io/docs/v4

import type { JobCluster } from "@/types";
import { scoreSentiment } from "./sentiment";

type GNewsArticle = {
  headline: string;
  source: string;
  url: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
};

// On GNews free plan, complex boolean queries return 0 recent articles.
// We fall back to the job title as the query — it returns results, though
// some may be tangentially related (celebrity mentions, etc.).
// A paid plan would allow industry-context queries like:
//   "creative director" AND (design OR agency OR AI)

/**
 * Fetch up to 6 recent news articles relevant to a job role's industry context.
 * Uses cluster-based queries to surface industry trends rather than name mentions.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchNews(
  title: string,
  cluster: JobCluster,
): Promise<GNewsArticle[] | null> {
  const key = process.env.GNEWS_API_KEY;

  if (!key) {
    console.error("[GNews] GNEWS_API_KEY is not set");
    return null;
  }

  const query = encodeURIComponent(title);
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&country=us&max=6&apikey=${key}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) {
      console.error(`[GNews] API returned ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      console.error("[GNews] Unexpected response structure");
      return null;
    }

    // Free plan strips historical articles, sometimes leaving an empty array
    if (data.articles.length === 0) {
      console.warn("[GNews] No recent articles returned (free plan limitation)");
      return null;
    }

    const articles: GNewsArticle[] = data.articles.map(
      (article: {
        title: string;
        source: { name: string };
        url: string;
        publishedAt: string;
      }) => ({
        headline: article.title,
        source: article.source.name,
        url: article.url,
        date: formatDate(article.publishedAt),
        sentiment: scoreSentiment(article.title),
      }),
    );

    return articles;
  } catch (error) {
    console.error("[GNews] Failed to fetch news:", error);
    return null;
  }
}

/**
 * Format an ISO date string to YYYY-MM-DD.
 */
function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toISOString().split("T")[0];
  } catch {
    return isoDate;
  }
}
