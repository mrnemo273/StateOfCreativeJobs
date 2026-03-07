// GNews API client for fetching news headlines related to creative job titles.
// API docs: https://gnews.io/docs/v4

import { scoreSentiment } from "./sentiment";

type GNewsArticle = {
  headline: string;
  source: string;
  url: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
};

/**
 * Fetch up to 6 recent news articles about a given job title.
 * Returns null if the API key is missing or the request fails.
 */
export async function fetchNews(
  title: string,
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
