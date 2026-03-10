import Anthropic from "@anthropic-ai/sdk";
import type { JobHealthSnapshot } from "@/types";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY from env

export interface ComparableRole {
  slug: string;
  title: string;
  aiRiskScore: number;
  aiRiskLabel: string;
  demandYoY: string;
  salary: string;
}

export interface SkillPivotItem {
  headline: string;
  body: string;
}

export interface RoleIntelligence {
  outlook: string;
  skillPivots: SkillPivotItem[];
  comparableRoles: ComparableRole[];
}

export async function getRoleIntelligence(
  snapshot: JobHealthSnapshot,
  allSnapshots: JobHealthSnapshot[],
): Promise<RoleIntelligence> {
  const risingSkills =
    snapshot.skills?.rising
      ?.slice(0, 3)
      .map((s) => s.skill)
      .join(", ") || "N/A";
  const decliningSkills =
    snapshot.skills?.declining
      ?.slice(0, 3)
      .map((s) => s.skill)
      .join(", ") || "N/A";
  const aiTools = snapshot.aiImpact?.tools?.join(", ") || "N/A";
  const aiMentions = snapshot.sentiment?.aiMentions ?? 0;
  const layoffMentions = snapshot.sentiment?.layoffMentions ?? 0;
  const hiringMentions = snapshot.sentiment?.hiringMentions ?? 0;

  const yoy = snapshot.demand?.yoyChange ?? 0;
  const trendDescription =
    yoy > 5
      ? "growing demand over past 12 months"
      : yoy < -5
        ? "declining demand over past 12 months"
        : "flat demand over past 12 months";

  const formatSalary = (n: number) =>
    n > 0 ? `$${Math.round(n / 1000)}k` : "N/A";
  const formatYoY = (n: number) =>
    n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;

  // Call 1 — Role Outlook
  const outlookResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: `You are a labor market analyst writing for a report called "State of Creative Jobs".
Your audience is creative and design professionals who want to understand how their role is evolving.
Write in a clear, direct, practitioner voice. No fluff. No hedging.
Use specific numbers from the data provided. Do not use bullet points.
Write 3–5 sentences. Do not start with "The data shows" or "According to".`,
    messages: [
      {
        role: "user",
        content: `Write a role outlook paragraph for: ${snapshot.title}

Data:
- Open roles: ${snapshot.demand?.openingsCount ?? "N/A"} (${formatYoY(yoy)} vs last year)
- Median salary: ${formatSalary(snapshot.salary?.medianUSD ?? 0)}
- AI risk score: ${snapshot.aiImpact?.score ?? "N/A"}/100 (${snapshot.aiImpact?.scoreLabel ?? "N/A"})
- Community signals: ${aiMentions} AI mentions, ${layoffMentions} layoff mentions, ${hiringMentions} hiring mentions
- Demand trend: ${trendDescription}
- Top rising skills: ${risingSkills}
- Top declining skills: ${decliningSkills}
- Primary AI tools displacing this role: ${aiTools}

Write one paragraph only. Be specific to this role's data.`,
      },
    ],
  });

  const outlook =
    outlookResponse.content[0].type === "text"
      ? outlookResponse.content[0].text
      : "Analysis unavailable.";

  // Call 2 — Skill Pivot (structured JSON)
  const pivotResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    system: `You are a career advisor for creative and design professionals.
Give exactly three specific, actionable recommendations based on the data.
Be concrete — reference the specific skills and tools in the data.
Do not give generic advice like "learn AI" or "stay curious".

Return ONLY a JSON array with exactly 3 objects, each having:
- "headline": a short 3–6 word summary (e.g. "Master cross-functional design leadership")
- "body": 1–2 sentences with the full actionable recommendation

Return raw JSON only. No markdown, no code fences, no commentary.`,
    messages: [
      {
        role: "user",
        content: `Give 3 skill pivot recommendations for a ${snapshot.title} based on:

- Rising skills in job postings: ${risingSkills}
- Declining skills in job postings: ${decliningSkills}
- AI risk score: ${snapshot.aiImpact?.score ?? "N/A"}/100
- Primary displacing tools: ${aiTools}
- Demand trend: ${trendDescription}
- Role cluster: ${snapshot.cluster ?? "N/A"}`,
      },
    ],
  });

  let skillPivots: SkillPivotItem[] = [];
  try {
    const raw = pivotResponse.content[0].type === "text" ? pivotResponse.content[0].text : "[]";
    skillPivots = JSON.parse(raw) as SkillPivotItem[];
  } catch {
    skillPivots = [];
  }

  // Comparable Roles — computed, no API call
  const currentScore = snapshot.aiImpact?.score ?? 100;
  const currentSalary = snapshot.salary?.medianUSD ?? 0;

  const comparableRoles: ComparableRole[] = allSnapshots
    .filter(
      (s) =>
        s.slug !== snapshot.slug &&
        s.aiImpact?.score != null &&
        s.aiImpact.score < currentScore &&
        (s.demand?.openingsCount > 0 ||
          (s.salary?.medianUSD ?? 0) > currentSalary),
    )
    .sort((a, b) => (b.salary?.medianUSD ?? 0) - (a.salary?.medianUSD ?? 0))
    .slice(0, 3)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      aiRiskScore: s.aiImpact.score,
      aiRiskLabel: s.aiImpact.scoreLabel,
      demandYoY: formatYoY(s.demand?.yoyChange ?? 0),
      salary: formatSalary(s.salary?.medianUSD ?? 0),
    }));

  return { outlook, skillPivots, comparableRoles };
}
