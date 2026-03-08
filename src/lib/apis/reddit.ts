// Reddit public JSON API client for community signal detection.
// No authentication required — uses public .json endpoints.
// Detects tools, trends, and industry shifts from practitioner discussions.

import type { JobCluster } from "@/types";
import { scoreSentiment } from "./sentiment";

export type RedditResult = {
  slug: string;
  posts: {
    title: string;
    subreddit: string;
    url: string;
    score: number;
    created: string;
  }[];
  quotes: { text: string; subreddit: string; score: number }[];
  topWords: { word: string; count: number }[];
  layoffMentions: number;
  hiringMentions: number;
  aiMentions: number;
  sentimentSignal: "negative" | "neutral" | "positive";
};

const CLUSTER_SUBREDDITS: Record<JobCluster, string[]> = {
  "design-leadership": ["design", "graphic_design"],
  "product-ux": ["UXDesign", "userexperience"],
  "brand-visual": ["design", "graphic_design"],
  "content-copy": ["copywriting", "content_strategy"],
};

const UNIVERSAL_SUBREDDITS = ["layoffs", "jobs"];

const USER_AGENT = "StateOfCreativeJobs/1.0 (labor market research)";

// Curated vocabulary of tools, platforms, and industry concepts.
// Matched case-insensitively against post titles and comments.
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch Reddit community data for a job slug.
 * Uses unbiased search (just the role title) to capture what practitioners
 * are actually discussing, then detects tools, trends, and signals.
 * Returns null if requests fail — never throws.
 */
export async function fetchRedditData(
  slug: string,
  title: string,
  cluster: JobCluster,
): Promise<RedditResult | null> {
  try {
    const subreddits = [
      ...CLUSTER_SUBREDDITS[cluster],
      ...UNIVERSAL_SUBREDDITS,
    ];

    // Unbiased query — just the role title, no layoff/hiring/AI priming
    const query = title;

    type RawPost = {
      title: string;
      subreddit: string;
      permalink: string;
      score: number;
      created: number;
    };

    const allPosts: RawPost[] = [];

    for (let i = 0; i < subreddits.length; i++) {
      if (i > 0) await sleep(2000);

      const sub = subreddits[i];
      const params = new URLSearchParams({
        q: query,
        sort: "relevance",
        t: "month",
        restrict_sr: "1",
        limit: "25",
      });
      const url = `https://www.reddit.com/r/${sub}/search.json?${params.toString()}`;

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT },
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn(
            `[Reddit] HTTP ${res.status} for r/${sub}: ${res.statusText}`,
          );
          continue;
        }

        const data = await res.json();
        const children = data?.data?.children ?? [];

        for (const child of children) {
          if (child.kind !== "t3") continue;
          const d = child.data;
          allPosts.push({
            title: d.title,
            subreddit: d.subreddit,
            permalink: d.permalink,
            score: d.score ?? 0,
            created: d.created ?? 0,
          });
        }
      } catch (err) {
        console.warn(`[Reddit] Failed to fetch r/${sub}:`, err);
      }
    }

    if (allPosts.length === 0) {
      console.warn(`[Reddit] No posts found for slug "${slug}"`);
      return null;
    }

    // Deduplicate by permalink, sort by score descending
    const seen = new Set<string>();
    const uniquePosts = allPosts.filter((p) => {
      if (seen.has(p.permalink)) return false;
      seen.add(p.permalink);
      return true;
    });
    uniquePosts.sort((a, b) => b.score - a.score);

    // Format posts for output (top 10)
    const posts = uniquePosts.slice(0, 10).map((p) => ({
      title: p.title,
      subreddit: p.subreddit,
      url: `https://www.reddit.com${p.permalink}`,
      score: p.score,
      created: new Date(p.created * 1000).toISOString().split("T")[0],
    }));

    // Fetch comments from top 3 posts for richer signal detection + quotes
    type CommentData = { body: string; subreddit: string; score: number };
    const allComments: CommentData[] = [];

    const topPostsForComments = uniquePosts.slice(0, 3);
    for (let i = 0; i < topPostsForComments.length; i++) {
      await sleep(2000);
      const post = topPostsForComments[i];
      try {
        const commentsUrl = `https://www.reddit.com${post.permalink}.json?limit=15`;
        const commentsRes = await fetch(commentsUrl, {
          headers: { "User-Agent": USER_AGENT },
          cache: "no-store",
        });

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          const commentChildren = commentsData?.[1]?.data?.children ?? [];

          for (const c of commentChildren) {
            if (c.kind !== "t1") continue;
            const body: string = c.data.body ?? "";
            if (body.length > 80 && body.length < 1000) {
              allComments.push({
                body,
                subreddit: post.subreddit,
                score: c.data.score ?? 0,
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[Reddit] Failed to fetch comments:`, err);
      }
    }

    // Select quotes: prioritize signal-rich comments about tools/adaptation/change,
    // fall back to highest-scored comments for remaining slots.
    const signalCommentIds = new Set<number>();
    const signalComments = allComments
      .filter((c, idx) => {
        const lower = c.body.toLowerCase();
        const hasSignal =
          INDUSTRY_SIGNALS.some((s) => lower.includes(s.term)) ||
          SIGNAL_QUOTE_PATTERN.test(c.body);
        if (hasSignal) signalCommentIds.add(idx);
        return hasSignal;
      })
      .sort((a, b) => b.score - a.score);

    const fallbackComments = allComments
      .filter((_, idx) => !signalCommentIds.has(idx))
      .sort((a, b) => b.score - a.score);

    const selectedComments = [...signalComments, ...fallbackComments].slice(0, 4);
    const quotes = selectedComments.map((c) => ({
      text: c.body.length > 280 ? c.body.slice(0, 277) + "..." : c.body,
      subreddit: c.subreddit,
      score: c.score,
    }));

    // Detect industry signals from all text (titles + comments)
    const allText = [
      ...uniquePosts.map((p) => p.title),
      ...allComments.map((c) => c.body),
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
        // Merge duplicate labels (e.g., "dall-e" and "dalle" both → "DALL-E")
        const existing = signalCounts.get(signal.label) ?? 0;
        signalCounts.set(signal.label, existing + count);
      }
    }

    const topWords = Array.from(signalCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Count theme mentions across all text (titles + comments)
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

    // Compute overall sentiment signal from post titles
    const sentimentSignal = scoreSentiment(
      uniquePosts.map((p) => p.title).join(". "),
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
      `[Reddit] Failed to fetch data for slug "${slug}":`,
      error,
    );
    return null;
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
