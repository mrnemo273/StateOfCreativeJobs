export type JobCluster =
  | "design-leadership"
  | "product-ux"
  | "brand-visual"
  | "content-copy";

export type JobTitle = {
  title: string;
  slug: string;
  cluster: JobCluster;
};

export type TrendPoint = {
  date: string;
  value: number;
};

export type SkillSignal = {
  skill: string;
  changePercent: number;
};

export type NewsItem = {
  headline: string;
  source: string;
  url: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
};

export type PostingAnalysis = {
  topSkills: { skill: string; frequencyPercent: number }[];
  commonResponsibilities: string[];
  roleDefinition: string;
};

export type JobHealthSnapshot = {
  title: string;
  slug: string;
  cluster: JobCluster;
  description: string;
  lastUpdated: string;

  demand: {
    openingsCount: number;
    openingsTrend: TrendPoint[];
    yoyChange: number;
    topHiringLocations: string[];
  };

  salary: {
    medianUSD: number;
    rangeMin: number;
    rangeMax: number;
    trend: TrendPoint[];
    yoyChange: number;
    topPayingIndustries: string[];
  };

  aiImpact: {
    score: number;
    scoreLabel: "Low" | "Moderate" | "Elevated" | "High";
    riskFactors: string[];
    protectiveFactors: string[];
    trend: TrendPoint[];
    scoreExplainer: string;
  };

  skills: {
    rising: SkillSignal[];
    declining: SkillSignal[];
  };

  sentiment: {
    score: number;
    label: "Negative" | "Mixed" | "Neutral" | "Positive";
    recentHeadlines: NewsItem[];
    sources: string[];
  };

  postingAnalysis: PostingAnalysis;
};
