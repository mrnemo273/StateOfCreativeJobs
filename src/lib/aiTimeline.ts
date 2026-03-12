/**
 * AI Displacement Timeline — curated data for all 20 tracked roles.
 *
 * Each role has projected milestones, a velocity label, protective factors
 * that cap displacement, and a projected ceiling. This is editorial data
 * maintained in the same pattern as TDI scores in aiScoring.ts.
 *
 * When updating: edit this file directly.
 */

export interface TimelineMilestone {
  date: string; // "2026-Q3" format
  coveragePercent: number; // Projected % of tasks automatable
  catalyst: string; // What drives this milestone
}

export interface RoleTimeline {
  currentCoverage: number; // % automatable today
  projectedCeiling: number; // Max % automatable (protective factors cap)
  milestones: TimelineMilestone[];
  protectiveFactors: string[];
  velocityLabel: "slow" | "moderate" | "fast" | "accelerating";
}

export const ROLE_TIMELINES: Record<string, RoleTimeline> = {
  // ─── Cluster A — Design Leadership ───────────────────────────

  "creative-director": {
    currentCoverage: 22,
    projectedCeiling: 45,
    milestones: [
      {
        date: "2027-Q4",
        coveragePercent: 35,
        catalyst:
          "AI handles mood boards, reference gathering, initial concepting",
      },
      {
        date: "2029-Q1",
        coveragePercent: 45,
        catalyst:
          "Multi-modal AI covers presentation and pitch deck generation",
      },
    ],
    protectiveFactors: [
      "Leadership & team management",
      "Client relationship ownership",
      "Strategic vision",
      "Taste arbitration",
    ],
    velocityLabel: "slow",
  },

  "design-director": {
    currentCoverage: 20,
    projectedCeiling: 40,
    milestones: [
      {
        date: "2027-Q3",
        coveragePercent: 30,
        catalyst: "AI design review tools automate QA and consistency checks",
      },
      {
        date: "2029-Q2",
        coveragePercent: 40,
        catalyst:
          "Design systems auto-generation reduces standards-setting work",
      },
    ],
    protectiveFactors: [
      "Cross-functional leadership",
      "Organizational design strategy",
      "Mentoring & team development",
      "Stakeholder navigation",
    ],
    velocityLabel: "slow",
  },

  "head-of-design": {
    currentCoverage: 18,
    projectedCeiling: 35,
    milestones: [
      {
        date: "2028-Q1",
        coveragePercent: 25,
        catalyst: "AI-assisted portfolio reviews and team performance tracking",
      },
      {
        date: "2030-Q1",
        coveragePercent: 35,
        catalyst: "Strategic planning tools incorporate design operations",
      },
    ],
    protectiveFactors: [
      "Hiring & org building",
      "Executive communication",
      "Budget ownership",
      "Culture setting",
    ],
    velocityLabel: "slow",
  },

  "vp-of-design": {
    currentCoverage: 15,
    projectedCeiling: 30,
    milestones: [
      {
        date: "2028-Q2",
        coveragePercent: 22,
        catalyst: "AI-driven design metrics dashboards reduce reporting burden",
      },
      {
        date: "2030-Q2",
        coveragePercent: 30,
        catalyst: "Strategic AI tools assist with roadmap planning",
      },
    ],
    protectiveFactors: [
      "C-suite relationship management",
      "Business strategy integration",
      "P&L accountability",
      "Organizational influence",
    ],
    velocityLabel: "slow",
  },

  cco: {
    currentCoverage: 12,
    projectedCeiling: 28,
    milestones: [
      {
        date: "2028-Q4",
        coveragePercent: 20,
        catalyst: "AI-generated campaign concepts reach viable quality",
      },
      {
        date: "2030-Q4",
        coveragePercent: 28,
        catalyst: "Multi-channel creative orchestration tools mature",
      },
    ],
    protectiveFactors: [
      "Brand vision & stewardship",
      "Board-level communication",
      "Industry reputation",
      "Creative culture definition",
    ],
    velocityLabel: "slow",
  },

  // ─── Cluster B — Product & UX Design ─────────────────────────

  "senior-product-designer": {
    currentCoverage: 32,
    projectedCeiling: 60,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 42,
        catalyst:
          "Figma AI and similar tools handle wireframing and component design",
      },
      {
        date: "2028-Q1",
        coveragePercent: 55,
        catalyst: "AI prototyping tools generate interactive flows from briefs",
      },
    ],
    protectiveFactors: [
      "Systems thinking",
      "Cross-functional collaboration",
      "User research synthesis",
      "Product strategy input",
    ],
    velocityLabel: "moderate",
  },

  "ux-designer": {
    currentCoverage: 38,
    projectedCeiling: 65,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 48,
        catalyst: "AI wireframing and user flow generation reach production quality",
      },
      {
        date: "2027-Q3",
        coveragePercent: 60,
        catalyst: "Automated usability testing and heuristic evaluation tools",
      },
    ],
    protectiveFactors: [
      "Qualitative research skills",
      "Stakeholder workshop facilitation",
      "Accessibility expertise",
      "Complex interaction design",
    ],
    velocityLabel: "fast",
  },

  "product-designer": {
    currentCoverage: 35,
    projectedCeiling: 62,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 45,
        catalyst: "AI-assisted design tools handle routine UI patterns",
      },
      {
        date: "2027-Q4",
        coveragePercent: 58,
        catalyst: "End-to-end design-to-code pipelines reduce implementation gap",
      },
    ],
    protectiveFactors: [
      "Product thinking",
      "Business metric alignment",
      "User interview synthesis",
      "Design system governance",
    ],
    velocityLabel: "moderate",
  },

  "ux-researcher": {
    currentCoverage: 25,
    projectedCeiling: 50,
    milestones: [
      {
        date: "2027-Q1",
        coveragePercent: 35,
        catalyst: "AI survey analysis and automated transcript coding",
      },
      {
        date: "2028-Q3",
        coveragePercent: 48,
        catalyst: "Synthetic user testing and AI-moderated research sessions",
      },
    ],
    protectiveFactors: [
      "Study design methodology",
      "Participant rapport building",
      "Insight storytelling",
      "Organizational advocacy",
    ],
    velocityLabel: "moderate",
  },

  "design-systems-designer": {
    currentCoverage: 30,
    projectedCeiling: 55,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 40,
        catalyst: "AI generates component variants and documentation automatically",
      },
      {
        date: "2028-Q1",
        coveragePercent: 52,
        catalyst: "Design token management and cross-platform consistency automated",
      },
    ],
    protectiveFactors: [
      "Architecture decisions",
      "Cross-team governance",
      "Performance optimization",
      "Adoption strategy",
    ],
    velocityLabel: "moderate",
  },

  // ─── Cluster C — Brand & Visual Design ───────────────────────

  "brand-designer": {
    currentCoverage: 35,
    projectedCeiling: 65,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 45,
        catalyst: "AI brand identity generators produce viable logo and system options",
      },
      {
        date: "2027-Q4",
        coveragePercent: 60,
        catalyst: "End-to-end brand guideline generation from brief to deliverable",
      },
    ],
    protectiveFactors: [
      "Cultural context reading",
      "Brand narrative crafting",
      "Client presentation skills",
      "Competitive positioning",
    ],
    velocityLabel: "fast",
  },

  "graphic-designer": {
    currentCoverage: 43,
    projectedCeiling: 75,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 50,
        catalyst: "Midjourney v7 + Figma AI handle layout + asset generation",
      },
      {
        date: "2027-Q2",
        coveragePercent: 65,
        catalyst: "End-to-end brand asset generation tools mature",
      },
    ],
    protectiveFactors: [
      "Client relationships",
      "Brand strategy",
      "Taste & curation",
      "Cross-channel consistency",
    ],
    velocityLabel: "fast",
  },

  "visual-designer": {
    currentCoverage: 40,
    projectedCeiling: 72,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 50,
        catalyst: "AI image generation tools produce production-ready visual assets",
      },
      {
        date: "2027-Q3",
        coveragePercent: 65,
        catalyst: "Automated visual system generation across touchpoints",
      },
    ],
    protectiveFactors: [
      "Art direction judgment",
      "Photography direction",
      "Print production knowledge",
      "Tactile material expertise",
    ],
    velocityLabel: "fast",
  },

  "art-director": {
    currentCoverage: 28,
    projectedCeiling: 52,
    milestones: [
      {
        date: "2027-Q1",
        coveragePercent: 38,
        catalyst: "AI concepting tools generate campaign visual directions",
      },
      {
        date: "2028-Q2",
        coveragePercent: 50,
        catalyst: "Multi-modal AI handles mood boarding through final comp",
      },
    ],
    protectiveFactors: [
      "Talent direction (photographers, illustrators)",
      "Conceptual thinking",
      "Production oversight",
      "Cultural sensitivity",
    ],
    velocityLabel: "moderate",
  },

  "motion-designer": {
    currentCoverage: 38,
    projectedCeiling: 70,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 48,
        catalyst: "Runway and Pika produce broadcast-quality motion from prompts",
      },
      {
        date: "2027-Q2",
        coveragePercent: 62,
        catalyst: "AI handles complex animation sequences and transitions",
      },
    ],
    protectiveFactors: [
      "Narrative pacing",
      "Sound design integration",
      "3D pipeline expertise",
      "Live-action compositing",
    ],
    velocityLabel: "fast",
  },

  // ─── Cluster D — Content & Copy ──────────────────────────────

  copywriter: {
    currentCoverage: 55,
    projectedCeiling: 82,
    milestones: [
      {
        date: "2026-Q2",
        coveragePercent: 62,
        catalyst: "LLMs handle first drafts of most marketing and product copy",
      },
      {
        date: "2027-Q1",
        coveragePercent: 75,
        catalyst: "AI writes in brand voice with minimal human editing",
      },
    ],
    protectiveFactors: [
      "Brand voice development",
      "Regulatory compliance writing",
      "Emotional storytelling",
      "Cultural nuance",
    ],
    velocityLabel: "accelerating",
  },

  "content-strategist": {
    currentCoverage: 30,
    projectedCeiling: 55,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 38,
        catalyst: "AI content auditing and gap analysis tools reach maturity",
      },
      {
        date: "2028-Q1",
        coveragePercent: 52,
        catalyst: "Automated content modeling and governance frameworks",
      },
    ],
    protectiveFactors: [
      "Information architecture",
      "Stakeholder alignment",
      "Content governance design",
      "Measurement framework design",
    ],
    velocityLabel: "moderate",
  },

  "ux-writer": {
    currentCoverage: 48,
    projectedCeiling: 78,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 58,
        catalyst: "AI generates contextual microcopy and error messages at scale",
      },
      {
        date: "2027-Q2",
        coveragePercent: 72,
        catalyst: "AI maintains voice consistency across entire product surfaces",
      },
    ],
    protectiveFactors: [
      "User research integration",
      "Accessibility writing",
      "Legal/compliance review",
      "Voice & tone system design",
    ],
    velocityLabel: "fast",
  },

  "creative-copywriter": {
    currentCoverage: 45,
    projectedCeiling: 72,
    milestones: [
      {
        date: "2026-Q3",
        coveragePercent: 55,
        catalyst: "AI produces viable campaign concepts and taglines",
      },
      {
        date: "2027-Q3",
        coveragePercent: 68,
        catalyst: "Multi-modal AI generates copy-visual pairs for campaigns",
      },
    ],
    protectiveFactors: [
      "Conceptual originality",
      "Cultural reference fluency",
      "Humor and wordplay",
      "Art director collaboration",
    ],
    velocityLabel: "fast",
  },

  "content-designer": {
    currentCoverage: 35,
    projectedCeiling: 60,
    milestones: [
      {
        date: "2026-Q4",
        coveragePercent: 42,
        catalyst: "AI handles content pattern creation and documentation",
      },
      {
        date: "2028-Q1",
        coveragePercent: 55,
        catalyst: "Automated content testing and optimization across user flows",
      },
    ],
    protectiveFactors: [
      "Service design thinking",
      "Cross-discipline facilitation",
      "Content ops design",
      "Inclusive design practices",
    ],
    velocityLabel: "moderate",
  },
};

/** Get timeline data for a role, returns null if not found. */
export function getRoleTimeline(slug: string): RoleTimeline | null {
  return ROLE_TIMELINES[slug] ?? null;
}
