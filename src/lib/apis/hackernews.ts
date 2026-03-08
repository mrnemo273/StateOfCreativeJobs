// Hacker News Algolia API client for community signal detection.
// No authentication required. Works from cloud servers (Vercel).
// Detects tools, trends, and industry shifts from practitioner discussions.

import type { JobCluster } from "@/types";
import { scoreSentiment } from "./sentiment";

export type CommunityResult = {
  slug: string;
  posts: {
    title: string;
    source: string;
    url: string;
    score: number;
    created: string;
  }[];
  quotes: { text: string; source: string; score: number }[];
  topWords: { word: string; count: number }[];
  layoffMentions: number;
  hiringMentions: number;
  aiMentions: number;
  sentimentSignal: "negative" | "neutral" | "positive";
};

const HN_BASE = "https://hn.algolia.com/api/v1";

// Fallback queries when the exact job title yields too few results.
const CLUSTER_FALLBACK_QUERIES: Record<JobCluster, string> = {
  "design-leadership": "creative director design",
  "product-ux": "UX design product design",
  "brand-visual": "graphic design visual design",
  "content-copy": "copywriting content strategy",
};

// Curated vocabulary of tools, platforms, and industry concepts.
// Matched case-insensitively against story titles and comments.
// Terms are ordered longest-first so multi-word matches take priority.
const INDUSTRY_SIGNALS: { term: string; label: string }[] = [
  // AI creative tools
  { term: "stable diffusion", label: "Stable Diffusion" },
  { term: "adobe firefly", label: "Adobe Firefly" },
  { term: "prompt engineering", label: "Prompt Engineering" },
  { term: "generative ai", label: "Generative AI" },
  { term: "machine learning", label: "Machine Learning" },
  { term: "artificial intelligence", label: "AI" },
  { term: "github copilot", label: "GitHub Copilot" },
  { term: "galileo ai", label: "Galileo AI" },
  { term: "midjourney", label: "Midjourney" },
  { term: "chatgpt", label: "ChatGPT" },
  { term: "dall-e", label: "DALL-E" },
  { term: "dalle", label: "DALL-E" },
  { term: "copilot", label: "Copilot" },
  { term: "claude", label: "Claude" },
  { term: "cursor", label: "Cursor" },
  { term: "runway", label: "Runway" },
  { term: "sora", label: "Sora" },
  { term: "gen ai", label: "Generative AI" },
  // Core design tools
  { term: "after effects", label: "After Effects" },
  { term: "adobe xd", label: "Adobe XD" },
  { term: "photoshop", label: "Photoshop" },
  { term: "illustrator", label: "Illustrator" },
  { term: "indesign", label: "InDesign" },
  { term: "invision", label: "InVision" },
  { term: "protopie", label: "ProtoPie" },
  { term: "webflow", label: "Webflow" },
  { term: "framer", label: "Framer" },
  { term: "figma", label: "Figma" },
  { term: "canva", label: "Canva" },
  { term: "figjam", label: "FigJam" },
  { term: "miro", label: "Miro" },
  // Emerging practices
  { term: "design system", label: "Design Systems" },
  { term: "design token", label: "Design Tokens" },
  { term: "design ops", label: "DesignOps" },
  { term: "designops", label: "DesignOps" },
  { term: "accessibility", label: "Accessibility" },
  { term: "wcag", label: "WCAG" },
  // Industry shifts
  { term: "return to office", label: "Return to Office" },
  { term: "automation", label: "Automation" },
  { term: "outsourc", label: "Outsourcing" },
  { term: "upskill", label: "Upskilling" },
  { term: "reskill", label: "Reskilling" },
  { term: "bootcamp", label: "Bootcamps" },
  { term: "freelanc", label: "Freelance" },
  // Dev/collab
  { term: "storybook", label: "Storybook" },
  { term: "notion", label: "Notion" },
];

// Pattern for selecting signal-rich quotes about tools, adaptation, change.
const SIGNAL_QUOTE_PATTERN =
  /tool|workflow|process|skill|learn|adapt|chang|automat|replac|ai |figma|portfolio|career|transition|pivot|client|freelanc/i;

/**
 * Strip HTML tags from HN Algolia comment text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch Hacker News community data for a job slug.
 * Uses the Algolia search API — 2 requests (stories + comments).
 * Returns null if requests fail — never throws.
 */
export async function fetchHackerNewsData(
  slug: string,
  title: string,
  cluster: JobCluster,
): Promise<CommunityResult | null> {
  try {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    // --- Fetch stories ---
    let stories = await fetchStories(title, thirtyDaysAgo);

    // Fallback to broader cluster query if too few results
    if (stories.length < 3) {
      const fallbackQuery = CLUSTER_FALLBACK_QUERIES[cluster];
      if (fallbackQuery !== title) {
        console.warn(
          `[HackerNews] Only ${stories.length} stories for "${title}", trying fallback: "${fallbackQuery}"`,
        );
        const fallbackStories = await fetchStories(fallbackQuery, thirtyDaysAgo);
        // Merge, deduplicate by objectID
        const seen = new Set(stories.map((s) => s.objectID));
        for (const s of fallbackStories) {
          if (!seen.has(s.objectID)) {
            stories.push(s);
            seen.add(s.objectID);
          }
        }
      }
    }

    if (stories.length === 0) {
      console.warn(`[HackerNews] No stories found for slug "${slug}"`);
      return null;
    }

    // Sort by points descending, take top 10
    stories.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    stories = stories.slice(0, 10);

    const posts = stories.map((s) => ({
      title: s.title ?? "",
      source: "Hacker News",
      url: `https://news.ycombinator.com/item?id=${s.objectID}`,
      score: s.points ?? 0,
      created: s.created_at ? s.created_at.split("T")[0] : "",
    }));

    // --- Fetch comments ---
    const comments = await fetchComments(title, thirtyDaysAgo);

    // Strip HTML, filter by length
    type CleanComment = { text: string; score: number };
    const cleanComments: CleanComment[] = [];
    for (const c of comments) {
      const text = stripHtml(c.comment_text ?? "");
      if (text.length > 80 && text.length < 1000) {
        cleanComments.push({
          text,
          score: c.points ?? 0,
        });
      }
    }

    // --- Select quotes ---
    const signalIds = new Set<number>();
    const signalComments = cleanComments
      .filter((c, idx) => {
        const lower = c.text.toLowerCase();
        const hasSignal =
          INDUSTRY_SIGNALS.some((s) => lower.includes(s.term)) ||
          SIGNAL_QUOTE_PATTERN.test(c.text);
        if (hasSignal) signalIds.add(idx);
        return hasSignal;
      })
      .sort((a, b) => b.score - a.score);

    const fallbackComments = cleanComments
      .filter((_, idx) => !signalIds.has(idx))
      .sort((a, b) => b.score - a.score);

    const selectedComments = [...signalComments, ...fallbackComments].slice(0, 4);
    const quotes = selectedComments.map((c) => ({
      text: c.text.length > 280 ? c.text.slice(0, 277) + "..." : c.text,
      source: "Hacker News",
      score: c.score,
    }));

    // --- Detect industry signals ---
    const allText = [
      ...stories.map((s) => s.title ?? ""),
      ...cleanComments.map((c) => c.text),
    ]
      .join(" ")
      .toLowerCase();

    const signalCounts = new Map<string, number>();
    for (const signal of INDUSTRY_SIGNALS) {
      let count = 0;
      let idx = allText.indexOf(signal.term);
      while (idx !== -1) {
        count++;
        idx = allText.indexOf(signal.term, idx + signal.term.length);
      }
      if (count > 0) {
        const existing = signalCounts.get(signal.label) ?? 0;
        signalCounts.set(signal.label, existing + count);
      }
    }

    const topWords = Array.from(signalCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // --- Count theme mentions ---
    const layoffMentions = countMatches(allText, [
      "layoff", "layoffs", "laid off", "rif", "let go", "fired", "downsiz",
    ]);
    const hiringMentions = countMatches(allText, [
      "hiring", "hire", "job opening", "recruiting", "new role", "new position",
    ]);
    const aiMentions = countMatches(allText, [
      " ai ", "artificial intelligence", "chatgpt", "copilot", "generative",
      "machine learning", "midjourney", "dall-e", "stable diffusion",
    ]);

    // --- Sentiment ---
    const sentimentSignal = scoreSentiment(
      stories.map((s) => s.title ?? "").join(". "),
    );

    return {
      slug,
      posts,
      quotes,
      topWords,
      layoffMentions,
      hiringMentions,
      aiMentions,
      sentimentSignal,
    };
  } catch (error) {
    console.error(
      `[HackerNews] Failed to fetch data for slug "${slug}":`,
      error,
    );
    return null;
  }
}

// --- Algolia API helpers ---

type HNStory = {
  objectID: string;
  title: string | null;
  url: string | null;
  points: number | null;
  created_at: string;
  num_comments: number | null;
};

type HNComment = {
  objectID: string;
  comment_text: string | null;
  points: number | null;
  created_at: string;
  story_title: string | null;
};

async function fetchStories(
  query: string,
  afterTimestamp: number,
): Promise<HNStory[]> {
  try {
    const params = new URLSearchParams({
      query,
      tags: "story",
      numericFilters: `created_at_i>${afterTimestamp}`,
      hitsPerPage: "25",
    });
    const url = `${HN_BASE}/search?${params.toString()}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[HackerNews] Stories API returned ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.hits ?? []) as HNStory[];
  } catch (err) {
    console.warn("[HackerNews] Failed to fetch stories:", err);
    return [];
  }
}

async function fetchComments(
  query: string,
  afterTimestamp: number,
): Promise<HNComment[]> {
  try {
    const params = new URLSearchParams({
      query,
      tags: "comment",
      numericFilters: `created_at_i>${afterTimestamp}`,
      hitsPerPage: "50",
    });
    const url = `${HN_BASE}/search?${params.toString()}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.warn(`[HackerNews] Comments API returned ${res.status}: ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.hits ?? []) as HNComment[];
  } catch (err) {
    console.warn("[HackerNews] Failed to fetch comments:", err);
    return [];
  }
}

function countMatches(text: string, terms: string[]): number {
  let count = 0;
  for (const term of terms) {
    let idx = text.indexOf(term);
    while (idx !== -1) {
      count++;
      idx = text.indexOf(term, idx + term.length);
    }
  }
  return count;
}
