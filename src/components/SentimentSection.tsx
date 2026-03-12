"use client";

import { useState } from "react";
import type { JobHealthSnapshot } from "@/types";
import SectionLabel from "./ui/SectionLabel";
import DataValue from "./ui/DataValue";
import NewsCard from "./ui/NewsCard";

/* ── Tool / Trend context lookup ────────────────────────────────── */
interface ToolContext {
  synopsis: string;
  url: string;
}

const TOOL_CONTEXT: Record<string, ToolContext> = {
  Figma: {
    synopsis:
      "A collaborative interface design tool used by most product teams for UI/UX work. It runs in the browser and supports real-time multiplayer editing.",
    url: "https://www.figma.com",
  },
  Webflow: {
    synopsis:
      "A no-code website builder that lets designers create production sites visually. It bridges the gap between design and front-end development.",
    url: "https://webflow.com",
  },
  Framer: {
    synopsis:
      "A design-to-production tool for building interactive websites without code. It emphasizes motion, layout, and rapid publishing.",
    url: "https://www.framer.com",
  },
  "Design Systems": {
    synopsis:
      "Reusable component libraries and style guides that keep products visually consistent. They speed up design and development across large teams.",
    url: "https://www.designsystems.com",
  },
  "GitHub Copilot": {
    synopsis:
      "An AI pair-programmer from GitHub that suggests code as you type. It's changing how designers who code prototype and build.",
    url: "https://github.com/features/copilot",
  },
  Copilot: {
    synopsis:
      "An AI pair-programmer from GitHub that suggests code as you type. It's changing how designers who code prototype and build.",
    url: "https://github.com/features/copilot",
  },
  Claude: {
    synopsis:
      "An AI assistant built by Anthropic, increasingly used for writing, research, and code generation. Creative teams use it to accelerate ideation and content production.",
    url: "https://claude.ai",
  },
  Cursor: {
    synopsis:
      "An AI-native code editor built on VS Code that integrates language models directly into the development workflow. Popular with designers learning to code.",
    url: "https://cursor.com",
  },
  "Adobe XD": {
    synopsis:
      "Adobe's UI/UX design tool for wireframing and prototyping. Adobe has shifted focus to Figma since acquiring it, but XD still has users.",
    url: "https://helpx.adobe.com/xd/get-started.html",
  },
  Canva: {
    synopsis:
      "A drag-and-drop design platform used for marketing, social media, and presentations. It's democratized visual design for non-designers.",
    url: "https://www.canva.com",
  },
  Sketch: {
    synopsis:
      "A macOS design tool that pioneered modern UI design workflows. Still used by some teams, though many have migrated to Figma.",
    url: "https://www.sketch.com",
  },
  InVision: {
    synopsis:
      "A prototyping and collaboration platform that was once the industry standard. Its market share has declined significantly with Figma's rise.",
    url: "https://www.invisionapp.com",
  },
  "AI Prototyping": {
    synopsis:
      "The practice of using AI tools to rapidly generate UI mockups and interactive prototypes. It's compressing what used to take days into hours.",
    url: "https://www.nngroup.com/articles/ai-ux-getting-started/",
  },
  ChatGPT: {
    synopsis:
      "OpenAI's conversational AI, widely used for brainstorming, writing, and code. Creative professionals use it for rapid ideation and first drafts.",
    url: "https://openai.com/chatgpt",
  },
  Midjourney: {
    synopsis:
      "An AI image generator that creates visuals from text prompts. It's reshaping concept art, mood boards, and visual exploration workflows.",
    url: "https://www.midjourney.com",
  },
  "Stable Diffusion": {
    synopsis:
      "An open-source AI image generation model. Designers use it for concept exploration, texture generation, and rapid visual ideation.",
    url: "https://stability.ai",
  },
  Notion: {
    synopsis:
      "An all-in-one workspace for notes, docs, and project management. Many design teams use it for design specs, research, and documentation.",
    url: "https://www.notion.so",
  },
  "Design Tokens": {
    synopsis:
      "Platform-agnostic style variables (colors, spacing, type) that sync design decisions to code. They're central to scaling design systems.",
    url: "https://www.designtokens.org",
  },
  Accessibility: {
    synopsis:
      "The practice of designing products usable by people of all abilities. It's a growing requirement driven by regulation and user advocacy.",
    url: "https://www.w3.org/WAI/fundamentals/accessibility-intro/",
  },
  "Motion Design": {
    synopsis:
      "Animation and micro-interaction design that brings interfaces to life. Demand is growing as products compete on feel and polish.",
    url: "https://www.interaction-design.org/literature/topics/motion-design",
  },
  React: {
    synopsis:
      "A JavaScript library for building user interfaces, maintained by Meta. Many UX roles now expect familiarity with React-based prototyping.",
    url: "https://react.dev",
  },
  Tailwind: {
    synopsis:
      "A utility-first CSS framework that's become the default for rapidly styling web interfaces. Designers who code often prefer it for prototyping.",
    url: "https://tailwindcss.com",
  },
  WCAG: {
    synopsis:
      "Web Content Accessibility Guidelines — the international standard for making digital content accessible. Compliance is increasingly required by law.",
    url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
  },
  Outsourcing: {
    synopsis:
      "The practice of hiring external teams or freelancers for design work. It's reshaping in-house team structures as companies balance cost and quality.",
    url: "https://www.nngroup.com/articles/ux-outsourcing/",
  },
  Freelance: {
    synopsis:
      "Independent contract work without a long-term employer. A growing share of creative professionals work freelance, trading stability for flexibility.",
    url: "https://www.upwork.com/research/freelance-forward-2024",
  },
  "User Research": {
    synopsis:
      "The practice of studying real users to inform design decisions. It's a core UX skill, though AI is starting to assist with synthesis and analysis.",
    url: "https://www.nngroup.com/articles/ux-research-cheat-sheet/",
  },
  "Design Thinking": {
    synopsis:
      "A human-centered problem-solving framework popularized by IDEO and Stanford d.school. It's widely adopted in product development and innovation.",
    url: "https://www.interaction-design.org/literature/topics/design-thinking",
  },
  Prototyping: {
    synopsis:
      "Building interactive mockups to test ideas before development. AI tools are making prototyping faster, but human judgment on UX remains critical.",
    url: "https://www.nngroup.com/articles/prototyping-users/",
  },
  "Content Strategy": {
    synopsis:
      "Planning, creating, and managing useful content tied to user needs and business goals. It's increasingly intertwined with UX design practice.",
    url: "https://www.nngroup.com/articles/content-strategy/",
  },
};
type Props = {
  snapshot: JobHealthSnapshot;
};

export default function SentimentSection({ snapshot }: Props) {
  const { sentiment } = snapshot;
  const [newsOpen, setNewsOpen] = useState(false);

  const hasHeadlines = sentiment.recentHeadlines.length > 0;
  const hasCommunity = sentiment.communityPosts.length > 0;

  if (!hasHeadlines && !hasCommunity && sentiment.score === 0) {
    return null;
  }

  const normalized = (sentiment.score + 100) / 2; // -100..+100 → 0..100

  return (
    <section>
      <SectionLabel className="mb-6">Industry Signals</SectionLabel>
      <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
        <div className="col-span-12">
          {/* Sentiment bar */}
          <div className="flex items-center gap-4 mb-6">
            <DataValue
              value={sentiment.score >= 0 ? `+${sentiment.score}` : `${sentiment.score}`}
              className="text-data-lg font-display"
            />
            <span
              className={`text-label-md font-mono uppercase tracking-widest px-2 py-0.5 ${
                sentiment.score > 0
                  ? "text-up bg-up-bg"
                  : sentiment.score < 0
                    ? "text-down bg-down-bg"
                    : "text-neutral bg-neutral-bg"
              }`}
            >
              {sentiment.label}
            </span>
          </div>
          <div className="relative h-2 bg-faint w-full mb-2">
            <div
              className="absolute top-0 h-full"
              style={{
                left: 0,
                width: `${normalized}%`,
                backgroundColor:
                  sentiment.score > 0
                    ? "var(--color-up)"
                    : sentiment.score < 0
                      ? "var(--color-down)"
                      : "var(--color-neutral)",
              }}
            />
          </div>
          <div className="flex justify-between text-label-sm text-mid font-mono mb-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
          {sentiment.sources.length > 0 && (
            <p className="text-label-sm text-mid mt-1">
              Based on {sentiment.sources.join(", ")}
            </p>
          )}
        </div>

        {/* Community data — Hacker News */}
        {hasCommunity && (
          <div className="col-span-12 mt-8">
            <span className="text-label-sm text-mid uppercase tracking-widest block mb-4 font-medium">
              What Practitioners Are Saying
            </span>

            {/* Signal pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              {sentiment.layoffMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>Layoffs</span>
                  <span className="tabular-nums">{sentiment.layoffMentions}</span>
                </span>
              )}
              {sentiment.hiringMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>Hiring</span>
                  <span className="tabular-nums">{sentiment.hiringMentions}</span>
                </span>
              )}
              {sentiment.aiMentions > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-label-sm font-mono uppercase bg-black/10">
                  <span>AI</span>
                  <span className="tabular-nums">{sentiment.aiMentions}</span>
                </span>
              )}
            </div>

            {/* Quote cards */}
            {sentiment.communityQuotes.length > 0 && (
              <div className="grid grid-cols-12 gap-[var(--grid-gutter)] mb-6">
                {sentiment.communityQuotes.map((q, i) => (
                  <div key={i} className="col-span-12 md:col-span-6">
                    <div className="border border-light p-4 h-full flex flex-col">
                      <p className="text-body-sm font-sans italic flex-1">{q.text}</p>
                      <div className="mt-2">
                        <span className="text-label-sm text-mid font-mono">
                          {q.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Keyword cards */}
            {sentiment.communityKeywords.length > 0 && (
              <div>
                <span className="text-label-sm text-mid uppercase tracking-widest block mb-4 font-medium">
                  Tools &amp; Trends Detected
                </span>
                <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
                  {sentiment.communityKeywords.map((kw) => {
                    const ctx = TOOL_CONTEXT[kw.word];
                    return (
                      <div
                        key={kw.word}
                        className="col-span-12 sm:col-span-6 md:col-span-4 border border-light p-4 flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-label-md font-medium text-ink">
                            {kw.word}
                          </span>
                          <span className="text-label-sm text-mid font-mono tabular-nums bg-black/10 px-2 py-0.5">
                            {kw.count}
                          </span>
                        </div>
                        {ctx ? (
                          <>
                            <p className="text-body-sm text-mid leading-relaxed flex-1">
                              {ctx.synopsis}
                            </p>
                            <a
                              href={ctx.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-label-sm font-mono text-ink underline underline-offset-2 mt-3 hover:text-mid transition-colors"
                            >
                              Learn more &rarr;
                            </a>
                          </>
                        ) : (
                          <p className="text-body-sm text-mid leading-relaxed flex-1 italic">
                            A tool or trend mentioned in community discussions about this role.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* News Sources — collapsible accordion */}
        {hasHeadlines && (
          <div className="col-span-12 mt-6">
            <button
              onClick={() => setNewsOpen(!newsOpen)}
              className="flex items-center gap-2 text-label-sm text-mid uppercase tracking-widest font-medium cursor-pointer hover:text-ink transition-colors"
            >
              <span
                className="inline-block transition-transform duration-200"
                style={{ transform: newsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                &#9654;
              </span>
              News Sources ({sentiment.recentHeadlines.length})
            </button>
            {newsOpen && (
              <div className="mt-4">
                <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
                  {sentiment.recentHeadlines.map((item, i) => (
                    <div key={i} className="col-span-12 md:col-span-4">
                      <NewsCard
                        headline={item.headline}
                        source={item.source}
                        date={item.date}
                        sentiment={item.sentiment}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
