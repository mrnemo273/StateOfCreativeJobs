// O*NET Web Services API client for skills data and AI impact scoring.
// API: https://services.onetcenter.org/ws/

type OnetSkillsResult = {
  skills: { skill: string; importance: number }[];
  tasks: string[];
  techSkills: { skill: string; importance: number }[];
};

// Map our URL slugs to O*NET-SOC codes
export const SLUG_TO_ONET: Record<string, string> = {
  "creative-director": "27-1011.00",
  "design-director": "27-1011.00",
  "head-of-design": "11-2021.00",
  "vp-of-design": "11-2021.00",
  cco: "11-2011.00",
  "senior-product-designer": "27-1021.00",
  "ux-designer": "15-1255.00",
  "product-designer": "27-1021.00",
  "ux-researcher": "19-3022.00",
  "design-systems-designer": "15-1255.00",
  "brand-designer": "27-1024.00",
  "graphic-designer": "27-1024.00",
  "visual-designer": "27-1024.00",
  "art-director": "27-1011.00",
  "motion-designer": "27-1014.00",
  copywriter: "27-3043.00",
  "content-strategist": "27-3043.00",
  "ux-writer": "27-3043.00",
  "creative-copywriter": "27-3043.00",
  "content-designer": "15-1255.00",
};

const ONET_BASE = "https://services.onetcenter.org/ws/online/occupations";

/**
 * Fetch skills, tasks, and technology skills from O*NET for a given job slug.
 * Returns null if credentials are missing, the slug is unknown, or the request fails.
 */
export async function fetchOnetData(
  slug: string,
): Promise<OnetSkillsResult | null> {
  const username = process.env.ONET_USERNAME;
  const password = process.env.ONET_PASSWORD;

  if (!username || !password) {
    console.error("[O*NET] ONET_USERNAME or ONET_PASSWORD is not set");
    return null;
  }

  const socCode = SLUG_TO_ONET[slug];

  if (!socCode) {
    console.error(`[O*NET] No SOC code mapping found for slug: ${slug}`);
    return null;
  }

  const authHeader = `Basic ${btoa(username + ":" + password)}`;
  const headers = {
    Authorization: authHeader,
    Accept: "application/json",
  };
  const fetchOptions = {
    headers,
    next: { revalidate: 604800 } as { revalidate: number }, // Cache for 7 days
  };

  // Fetch skills
  let skills: { skill: string; importance: number }[] = [];
  try {
    const res = await fetch(
      `${ONET_BASE}/${socCode}/summary/skills`,
      fetchOptions,
    );

    if (res.ok) {
      const data = await res.json();
      if (data.element && Array.isArray(data.element)) {
        skills = data.element
          .map(
            (el: { name: string; score: { value: number } }) => ({
              skill: el.name,
              importance: el.score?.value ?? 0,
            }),
          )
          .sort(
            (a: { importance: number }, b: { importance: number }) =>
              b.importance - a.importance,
          );
      }
    } else {
      console.error(
        `[O*NET] Skills fetch returned ${res.status}: ${res.statusText}`,
      );
    }
  } catch (error) {
    console.error("[O*NET] Failed to fetch skills:", error);
  }

  // Fetch tasks
  let tasks: string[] = [];
  try {
    const res = await fetch(
      `${ONET_BASE}/${socCode}/summary/tasks`,
      fetchOptions,
    );

    if (res.ok) {
      const data = await res.json();
      if (data.task && Array.isArray(data.task)) {
        tasks = data.task.map(
          (t: { statement: string }) => t.statement,
        );
      }
    } else {
      console.error(
        `[O*NET] Tasks fetch returned ${res.status}: ${res.statusText}`,
      );
    }
  } catch (error) {
    console.error("[O*NET] Failed to fetch tasks:", error);
  }

  // Fetch technology skills
  let techSkills: { skill: string; importance: number }[] = [];
  try {
    const res = await fetch(
      `${ONET_BASE}/${socCode}/summary/technology_skills`,
      fetchOptions,
    );

    if (res.ok) {
      const data = await res.json();
      if (data.category && Array.isArray(data.category)) {
        techSkills = data.category.map(
          (cat: { title: { name: string }; example: { name: string }[] }) => ({
            skill: cat.title?.name ?? "Unknown",
            importance: cat.example?.length ?? 0,
          }),
        );
      }
    } else {
      console.error(
        `[O*NET] Tech skills fetch returned ${res.status}: ${res.statusText}`,
      );
    }
  } catch (error) {
    console.error("[O*NET] Failed to fetch technology skills:", error);
  }

  // If all three fetches failed, return null
  if (skills.length === 0 && tasks.length === 0 && techSkills.length === 0) {
    console.error("[O*NET] All data fetches returned empty results");
    return null;
  }

  return { skills, tasks, techSkills };
}

// ---------------------------------------------------------------------------
// AI Impact Scoring
// ---------------------------------------------------------------------------

const AUTOMATABLE_KEYWORDS = [
  "write",
  "draft",
  "create content",
  "produce",
  "layout",
  "resize",
  "retouch",
  "template",
  "format",
  "transcribe",
  "translate",
  "schedule",
  "compile",
  "generate",
  "copy",
  "edit text",
  "proofread",
  "data entry",
];

const PROTECTED_KEYWORDS = [
  "lead",
  "manage",
  "negotiate",
  "present",
  "mentor",
  "strategy",
  "stakeholder",
  "client relationship",
  "team",
  "decision",
  "vision",
  "culture",
  "judgment",
  "ethics",
  "empathy",
  "persuade",
  "collaborate",
];

/**
 * Analyze task descriptions to estimate AI automation risk.
 * Returns a score (0-100), a label, and lists of risk/protective factors.
 */
export function computeAIImpactScore(tasks: string[]): {
  score: number;
  scoreLabel: "Low" | "Moderate" | "Elevated" | "High";
  riskFactors: string[];
  protectiveFactors: string[];
} {
  if (tasks.length === 0) {
    return {
      score: 50,
      scoreLabel: "Moderate",
      riskFactors: [],
      protectiveFactors: [],
    };
  }

  const riskTasks: string[] = [];
  const protectedTasks: string[] = [];
  let automatableCount = 0;
  let protectedCount = 0;

  for (const task of tasks) {
    const lower = task.toLowerCase();

    let isAutomatable = false;
    for (const keyword of AUTOMATABLE_KEYWORDS) {
      if (lower.includes(keyword)) {
        isAutomatable = true;
        if (riskTasks.length < 3) {
          riskTasks.push(task);
        }
        break;
      }
    }

    let isProtected = false;
    for (const keyword of PROTECTED_KEYWORDS) {
      if (lower.includes(keyword)) {
        isProtected = true;
        if (protectedTasks.length < 3) {
          protectedTasks.push(task);
        }
        break;
      }
    }

    if (isAutomatable) automatableCount++;
    if (isProtected) protectedCount++;
  }

  // Calculate base ratio from automatable tasks
  const baseRatio = (automatableCount / tasks.length) * 100;

  // Apply protective factor: reduce score based on how many tasks are protected
  const protectiveFactor = (protectedCount / tasks.length) * 0.5;
  const adjustedScore = baseRatio * (1 - protectiveFactor);

  // Clamp to 0-100
  const score = Math.round(Math.max(0, Math.min(100, adjustedScore)));

  // Determine label
  let scoreLabel: "Low" | "Moderate" | "Elevated" | "High";
  if (score <= 25) {
    scoreLabel = "Low";
  } else if (score <= 50) {
    scoreLabel = "Moderate";
  } else if (score <= 75) {
    scoreLabel = "Elevated";
  } else {
    scoreLabel = "High";
  }

  return {
    score,
    scoreLabel,
    riskFactors: riskTasks,
    protectiveFactors: protectedTasks,
  };
}
