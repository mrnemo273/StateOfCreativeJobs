import type { JobHealthSnapshot, JobCluster, NewsItem, TrendPoint } from "@/types";
import { TRACKED_JOB_TITLES } from "@/data/jobTitles";
import { mockSnapshots } from "@/data/mockSnapshots";
import { fetchJobDemand } from "./apis/adzuna";
import { fetchSalaryData } from "./apis/bls";
import { fetchNews } from "./apis/gnews";
import { fetchOnetData, computeAIImpactScore } from "./apis/onet";
import { computeAIRiskScore, getRiskLabel, getDisplacingTools } from "./aiScoring";
import { fetchGoogleTrends } from "./apis/googletrends";
import { fetchHackerNewsData } from "./apis/hackernews";
import { scoreOverallSentiment } from "./apis/sentiment";

/** Short description per role used in the hero section. */
const ROLE_DESCRIPTIONS: Record<string, string> = {
  "creative-director":
    "Senior creative leader responsible for the visual identity and creative output of an organization, guiding teams across brand, campaign, and product design.",
  "design-director":
    "Oversees design execution across product and brand, bridging creative vision with business objectives and managing design teams at scale.",
  "head-of-design":
    "Organizational design leader who shapes team structure, design culture, and design operations while partnering closely with product and engineering leadership.",
  "vp-of-design":
    "Executive-level design leader setting long-term design strategy and representing design at the C-suite table.",
  cco:
    "The most senior creative executive, responsible for the entire creative direction and brand experience of a company.",
  "senior-product-designer":
    "Experienced product designer who leads end-to-end design for complex product areas, mentors junior designers, and influences design direction.",
  "ux-designer":
    "Designs intuitive user experiences through research, wireframing, prototyping, and usability testing across digital products.",
  "product-designer":
    "Combines UX, UI, and interaction design to shape the end-to-end experience of digital products, working closely with product managers and engineers.",
  "ux-researcher":
    "Plans and conducts qualitative and quantitative research studies to uncover user needs, behaviors, and pain points that inform product design decisions.",
  "design-systems-designer":
    "Builds and maintains scalable component libraries and design tokens that ensure consistency and efficiency across product teams.",
  "brand-designer":
    "Develops and evolves brand identity systems including logos, typography, color palettes, and visual language for marketing and communications.",
  "graphic-designer":
    "Creates visual communications across print and digital media, including marketing materials, social assets, and editorial layouts.",
  "visual-designer":
    "Focuses on the aesthetic and visual polish of digital interfaces, refining typography, color, iconography, and layout.",
  "art-director":
    "Guides the visual style and creative direction of campaigns and projects, managing photographers, illustrators, and designers.",
  "motion-designer":
    "Creates animated graphics and motion content for video, UI, social media, and interactive experiences.",
  copywriter:
    "Writes persuasive and engaging copy for advertising, marketing campaigns, websites, and brand communications.",
  "content-strategist":
    "Plans, creates, and manages content across channels, aligning messaging with user needs and business goals.",
  "ux-writer":
    "Crafts the words within digital product interfaces — buttons, error messages, onboarding flows — to guide users with clarity.",
  "creative-copywriter":
    "Develops original creative concepts and headlines for advertising campaigns, blending strategic thinking with writing craft.",
  "content-designer":
    "Designs content-first experiences, combining writing, information architecture, and user research to solve problems through language and structure.",
};

/**
 * Build a live JobHealthSnapshot by fetching from all API sources.
 * Falls back to mock data per-section when any individual API call fails.
 */
export async function buildSnapshot(
  slug: string,
): Promise<JobHealthSnapshot | null> {
  const titleEntry = TRACKED_JOB_TITLES.find((t) => t.slug === slug);
  if (!titleEntry) return null;

  const mock = mockSnapshots[slug] ?? null;
  const title = titleEntry.title;
  const cluster: JobCluster = titleEntry.cluster;
  const today = new Date().toISOString().split("T")[0];

  // Fire all API calls in parallel
  const [adzunaResult, blsResult, newsResult, onetResult, trendsResult, communityResult] = await Promise.all([
    fetchJobDemand(title),
    fetchSalaryData(slug),
    fetchNews(title),
    fetchOnetData(slug),
    fetchGoogleTrends(slug),
    fetchHackerNewsData(slug, title, cluster),
  ]);

  // --- Demand ---
  const trendLine: TrendPoint[] = trendsResult
    ? trendsResult.interestOverTime
    : mock?.demand.openingsTrend ?? (adzunaResult ? generateFlatTrend(adzunaResult.count) : []);

  const demandYoy = trendsResult?.yoyChange ?? mock?.demand.yoyChange ?? 0;

  const demand = adzunaResult
    ? {
        openingsCount: adzunaResult.count,
        openingsTrend: trendLine,
        yoyChange: demandYoy,
        topHiringLocations: adzunaResult.topLocations,
      }
    : mock?.demand ?? {
        openingsCount: 0,
        openingsTrend: trendLine,
        yoyChange: demandYoy,
        topHiringLocations: [],
      };

  // --- Salary ---
  const salary = blsResult
    ? {
        medianUSD: blsResult.annualMeanWage,
        rangeMin: blsResult.percentile10,
        rangeMax: blsResult.percentile90,
        trend: mock?.salary.trend ?? generateFlatTrend(blsResult.annualMeanWage),
        yoyChange: blsResult.yoyChange,
        topPayingIndustries: mock?.salary.topPayingIndustries ?? [],
      }
    : mock?.salary ?? {
        medianUSD: 0,
        rangeMin: 0,
        rangeMax: 0,
        trend: [],
        yoyChange: 0,
        topPayingIndustries: [],
      };

  // --- AI Impact ---
  const aiImpactFromOnet =
    onetResult && onetResult.tasks.length > 0
      ? computeAIImpactScore(onetResult.tasks)
      : null;

  const tools = getDisplacingTools(slug);

  const aiImpact = aiImpactFromOnet
    ? (() => {
        const compositeScore = computeAIRiskScore(aiImpactFromOnet.score, slug);
        return {
          score: compositeScore,
          scoreLabel: getRiskLabel(compositeScore),
          riskFactors: aiImpactFromOnet.riskFactors,
          protectiveFactors: aiImpactFromOnet.protectiveFactors,
          tools,
          trend: mock?.aiImpact.trend ?? generateFlatTrend(compositeScore),
          scoreExplainer: `Based on analysis of ${onetResult!.tasks.length} O*NET task descriptions (40% weight) combined with tool displacement index (60% weight).`,
        };
      })()
    : mock?.aiImpact ?? {
        score: 50,
        scoreLabel: "Moderate" as const,
        riskFactors: [],
        protectiveFactors: [],
        tools,
        trend: [],
        scoreExplainer: "Insufficient data for analysis.",
      };

  // --- Skills ---
  const skills =
    onetResult && onetResult.skills.length > 0
      ? {
          rising: onetResult.skills.slice(0, 10).map((s) => ({
            skill: s.skill,
            changePercent: Math.round(s.importance * 3),
          })),
          declining: onetResult.techSkills.slice(-5).map((s) => ({
            skill: s.skill,
            changePercent: -Math.round(Math.random() * 15 + 5),
          })),
        }
      : mock?.skills ?? { rising: [], declining: [] };

  // --- Sentiment & News ---
  const headlines: NewsItem[] = newsResult
    ? newsResult.map((a) => ({
        headline: a.headline,
        source: a.source,
        url: a.url,
        date: a.date,
        sentiment: a.sentiment,
      }))
    : mock?.sentiment.recentHeadlines ?? [];

  // Blend GNews headlines + HN story titles for overall sentiment (equal weight)
  const allSentimentTexts = [
    ...headlines.map((h) => h.headline),
    ...(communityResult ? communityResult.posts.map((p) => p.title) : []),
  ];

  const overallSentiment = allSentimentTexts.length > 0
    ? scoreOverallSentiment(allSentimentTexts)
    : mock
      ? { score: mock.sentiment.score, label: mock.sentiment.label }
      : { score: 0, label: "Neutral" as const };

  const sentimentSources = [
    ...(headlines.length > 0
      ? Array.from(new Set(headlines.map((h) => h.source)))
      : mock?.sentiment.sources ?? []),
    ...(communityResult ? ["Hacker News"] : []),
  ];

  const sentiment = {
    score: overallSentiment.score,
    label: overallSentiment.label,
    recentHeadlines: headlines,
    sources: sentimentSources,
    communityPosts: communityResult?.posts ?? [],
    communityQuotes: communityResult?.quotes ?? [],
    communityKeywords: communityResult?.topWords ?? [],
    layoffMentions: communityResult?.layoffMentions ?? 0,
    hiringMentions: communityResult?.hiringMentions ?? 0,
    aiMentions: communityResult?.aiMentions ?? 0,
  };

  // --- Posting Analysis ---
  const postingAnalysis =
    onetResult && onetResult.skills.length > 0
      ? {
          topSkills: onetResult.skills.slice(0, 8).map((s) => ({
            skill: s.skill,
            frequencyPercent: Math.round(s.importance * 14),
          })),
          commonResponsibilities: onetResult.tasks.slice(0, 6),
          roleDefinition:
            ROLE_DESCRIPTIONS[slug] ??
            mock?.postingAnalysis.roleDefinition ??
            `${title} role responsibilities and requirements.`,
        }
      : mock?.postingAnalysis ?? {
          topSkills: [],
          commonResponsibilities: [],
          roleDefinition: ROLE_DESCRIPTIONS[slug] ?? "",
        };

  return {
    title,
    slug,
    cluster,
    description: ROLE_DESCRIPTIONS[slug] ?? mock?.description ?? "",
    lastUpdated: today,
    demand,
    salary,
    aiImpact,
    skills,
    sentiment,
    postingAnalysis,
  };
}

/** Generate a flat 12-month trend line around a central value. */
function generateFlatTrend(value: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    points.push({
      date: d.toISOString().split("T")[0].slice(0, 7),
      value: Math.round(value * (0.95 + Math.random() * 0.1)),
    });
  }
  return points;
}
