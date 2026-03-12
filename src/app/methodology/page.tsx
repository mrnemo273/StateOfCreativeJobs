import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionLabel from "@/components/ui/SectionLabel";
import HairlineRule from "@/components/ui/HairlineRule";

export const metadata: Metadata = {
  title: "Methodology | State of Creative Jobs",
  description:
    "How every number on the State of Creative Jobs index is calculated. Data sources, scoring models, refresh cadence, and known limitations.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main
        className="max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        {/* Page title */}
        <section className="pt-12 md:pt-16 mb-10 md:mb-14">
          <h1
            className="font-mono text-ink leading-none mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Methodology
          </h1>
          <p className="font-mono text-body-sm text-mid max-w-[65ch] leading-relaxed">
            How the index works. Every data source, scoring formula, and known
            limitation documented for verification.
          </p>
        </section>

        <HairlineRule />

        {/* Section 1 — Overview */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Overview</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            State of Creative Jobs tracks 20 creative and design job titles
            across four industry clusters: Design Leadership, Product &amp; UX,
            Brand &amp; Visual, and Content &amp; Copy. For each role, the index
            measures demand volume, compensation trends, AI displacement risk,
            and practitioner sentiment.
          </p>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Data is aggregated weekly from multiple public APIs, combined with
            curated editorial scoring for AI risk, and synthesized into
            per-role snapshots. The index refreshes every Monday at 6:00 AM UTC
            via an automated pipeline.
          </p>
          <p className="text-body-sm text-dark leading-relaxed">
            The goal is transparency: every number on the site should be
            traceable to a source, a formula, or an editorial decision
            documented on this page.
          </p>
        </section>

        <HairlineRule />

        {/* Section 2 — Data Sources */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Data Sources</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-6">
            The index draws from eight external data sources and one AI
            synthesis layer. Each source has different strengths, refresh
            cadences, and coverage gaps.
          </p>

          <div className="space-y-6">
            <DataSourceEntry
              name="Adzuna"
              description="Job posting counts and top hiring locations from active US listings."
              refresh="Weekly"
              limitations="Covers approximately 60% of US job postings. Skews toward publicly posted roles; excludes internal hiring and referral-only positions."
            />
            <DataSourceEntry
              name="Bureau of Labor Statistics (OES)"
              description="Median salary, 10th and 90th percentile ranges, and year-over-year wage change from the Occupational Employment and Wage Statistics survey."
              refresh="Weekly refresh (annual underlying data)"
              limitations="Survey data lags 12&ndash;18 months behind current market conditions. Based on employer-reported wages, not actual compensation including equity or bonuses."
            />
            <DataSourceEntry
              name="Google Trends (via SerpAPI)"
              description="Interest-over-time index (0&ndash;100 scale) for each job title, used as a demand proxy alongside posting data."
              refresh="Weekly"
              limitations="Measures search interest, not direct job demand. A relative index &mdash; values are normalized to the peak within the time range, not absolute volume."
            />
            <DataSourceEntry
              name="GNews"
              description="Recent news headlines mentioning each role, used for sentiment scoring and news feed display."
              refresh="Weekly"
              limitations="English-language coverage only. Headline selection varies by news cycle and may over-represent sensational stories."
            />
            <DataSourceEntry
              name="O*NET"
              description="Task descriptions, skill requirements, and technology skills for each role's SOC (Standard Occupational Classification) code. Used for AI risk base scoring and skills signal."
              refresh="Weekly"
              limitations="SOC code mapping is imperfect &mdash; one SOC code may cover multiple distinct roles. Task descriptions reflect typical duties, not emerging responsibilities."
            />
            <DataSourceEntry
              name="Hacker News"
              description="Community posts, discussion quotes, keyword frequency, and mention counts (AI, layoff, hiring) from Algolia search API."
              refresh="Weekly"
              limitations="Audience skews heavily toward technology workers. Not representative of all creative practitioners, especially those outside tech-adjacent industries."
            />
            <DataSourceEntry
              name="Anthropic (Claude)"
              description="AI-synthesized Role Intelligence: a market outlook paragraph and three skill pivot recommendations per role, generated from snapshot data."
              refresh="24-hour cache per role"
              limitations="AI-generated analysis reflects the model's interpretation of input data, not independent research. Outputs may not capture nuances visible to practitioners."
            />
            <DataSourceEntry
              name="FRED (Federal Reserve)"
              description="Knowledge-work employment index and recession band indicators. Provides macro context for demand trends &mdash; helps distinguish role-specific shifts from economy-wide patterns."
              refresh="Weekly (government release schedule)"
              limitations="Macro indicators apply broadly; correlation with specific creative roles is inferred, not direct."
            />
          </div>

          <p className="text-body-sm text-dark leading-relaxed mt-6">
            Additionally, three seeded datasets provide structural context:
            <span className="font-mono text-label-md"> U.S. Census ACS </span>
            (metro-level wages and income distribution),
            <span className="font-mono text-label-md"> NEA Artists in the Workforce </span>
            (creative workforce supply and moonlighting ratios), and
            <span className="font-mono text-label-md"> Upwork Freelance Forward </span>
            (staff vs. freelance employment structure). These are loaded
            annually, not weekly.
          </p>
        </section>

        <HairlineRule />

        {/* Section 3 — AI Risk Scoring */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">AI Risk Scoring</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            The AI risk score is a composite of two axes, each measuring a
            different dimension of displacement exposure.
          </p>

          <h4 className="font-mono text-label-md text-ink uppercase tracking-widest mb-2 mt-6">
            Axis 1 &mdash; O*NET Task Automability (40% weight)
          </h4>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Each role maps to an O*NET SOC code. The system analyzes the
            role&apos;s task descriptions and classifies each task as either
            automatable (risk factor) or human-centric (protective factor)
            based on keywords and task characteristics. The proportion of
            automatable tasks is normalized to a 0&ndash;100 scale.
          </p>

          <h4 className="font-mono text-label-md text-ink uppercase tracking-widest mb-2 mt-6">
            Axis 2 &mdash; Tool Displacement Index (60% weight)
          </h4>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            A manually curated score per role reflecting how directly named
            AI tools (Midjourney, DALL-E, Figma AI, Claude, Runway, etc.)
            target the role&apos;s primary output. This is editorial judgment,
            not algorithmic &mdash; scores are assigned based on the
            specificity and maturity of AI tools competing with each role&apos;s
            core deliverables.
          </p>

          <h4 className="font-mono text-label-md text-ink uppercase tracking-widest mb-2 mt-6">
            Composite Formula
          </h4>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            <code className="font-mono text-label-md bg-faint px-2 py-1">
              score = round((onetScore &times; 0.4) + (tdiScore &times; 0.6))
            </code>
          </p>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            The result is clamped to 0&ndash;100 and mapped to a four-tier
            risk label:
          </p>
          <table className="w-full text-body-sm border-t border-ink">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Score Range</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Label</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2">Meaning</th>
              </tr>
            </thead>
            <tbody className="text-dark">
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">0&ndash;24</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2">Minimal direct AI tool competition</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">25&ndash;49</td>
                <td className="py-2 pr-4">Moderate</td>
                <td className="py-2">Some AI overlap but significant human-centric tasks remain</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">50&ndash;69</td>
                <td className="py-2 pr-4">Elevated</td>
                <td className="py-2">Substantial AI tool coverage of core deliverables</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">70&ndash;100</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2">Mature AI tools directly targeting primary role output</td>
              </tr>
            </tbody>
          </table>
        </section>

        <HairlineRule />

        {/* Section 4 — Sentiment Scoring */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Sentiment Scoring</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Sentiment is computed from a keyword-based scoring model applied to
            two sources: GNews headlines and Hacker News community discussions.
          </p>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Headlines and post titles are scanned for positive keywords
            (hiring, growth, demand, opportunity) and negative keywords
            (layoff, cut, decline, replaced, eliminated). The net score ranges
            from &minus;100 to +100.
          </p>
          <table className="w-full text-body-sm border-t border-ink">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Score Range</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2">Label</th>
              </tr>
            </thead>
            <tbody className="text-dark">
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">&lt; &minus;25</td>
                <td className="py-2">Negative</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">&minus;25 to 0</td>
                <td className="py-2">Mixed</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">0 to 25</td>
                <td className="py-2">Neutral</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">&gt; 25</td>
                <td className="py-2">Positive</td>
              </tr>
            </tbody>
          </table>
          <p className="text-body-sm text-mid leading-relaxed mt-4">
            This is keyword-based scoring, not NLP or machine learning.
            It captures broad directional sentiment but may miss nuance,
            sarcasm, or context-dependent meaning.
          </p>
        </section>

        <HairlineRule />

        {/* Section 5 — Enrichment Data */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Enrichment Data</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Four additional data layers provide structural context beyond
            weekly job posting metrics. These answer deeper questions about
            the creative labor market.
          </p>
          <div className="space-y-4">
            <div>
              <span className="font-mono text-label-md text-ink">U.S. Census (ACS S2401)</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                Metro-level wage data, income distribution percentiles, and
                self-employment rates. Answers: what does compensation look like
                beyond the BLS national median?
              </p>
            </div>
            <div>
              <span className="font-mono text-label-md text-ink">NEA Artists in the Workforce</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                Creative workforce supply estimates and moonlighting ratios.
                Answers: how many people actually hold these jobs, including
                those who do creative work as a secondary occupation?
              </p>
            </div>
            <div>
              <span className="font-mono text-label-md text-ink">Upwork Freelance Forward</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                Staff vs. freelance employment structure and wage gap analysis.
                Answers: is this role trending toward freelance, and what does
                that mean for compensation?
              </p>
            </div>
            <div>
              <span className="font-mono text-label-md text-ink">FRED (Federal Reserve)</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                Knowledge-work employment index and recession band indicators.
                Answers: is a demand shift role-specific, or is the entire
                economy moving?
              </p>
            </div>
          </div>
          <p className="text-body-sm text-mid leading-relaxed mt-4">
            Enrichment data is seeded annually, not refreshed weekly.
            It provides structural context rather than real-time signals.
          </p>
        </section>

        <HairlineRule />

        {/* Section 6 — Refresh Pipeline */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Refresh Pipeline</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            The index refreshes automatically every Monday at 6:00 AM UTC via
            a GitHub Actions workflow. The pipeline:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-body-sm text-dark leading-relaxed mb-4">
            <li>Calls the snapshot API for all 20 tracked roles in sequence</li>
            <li>Each snapshot aggregates data from Adzuna, BLS, Google Trends, GNews, O*NET, and Hacker News in parallel</li>
            <li>Results are written to individual JSON files per role</li>
            <li>Updated files are committed and pushed to the main branch</li>
            <li>Vercel auto-deploys the updated site from the push</li>
          </ol>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            The landing page uses pre-cached static data generated at build time.
            Role deep-dive pages fetch live snapshot data on load, falling back
            to cached JSON files if the API is unavailable.
          </p>
          <p className="text-body-sm text-dark leading-relaxed">
            Role Intelligence (AI-generated analysis) is cached for 24 hours per
            role. If the Anthropic API is unreachable, the section displays a
            graceful fallback rather than breaking the page.
          </p>
        </section>

        <HairlineRule />

        {/* Section 7 — Known Limitations */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Known Limitations</SectionLabel>
          <ul className="space-y-3 text-body-sm text-dark leading-relaxed">
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>BLS salary lag:</strong> Compensation data reflects employer surveys conducted 12&ndash;18 months prior. Current market salaries may differ significantly.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Partial posting coverage:</strong> Adzuna indexes approximately 60% of US job postings. Internal hiring, referral-only roles, and some niche job boards are not captured.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Search interest as proxy:</strong> Google Trends measures search volume for job titles, which correlates with but is not equivalent to actual hiring demand.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Editorial AI risk scores:</strong> The Tool Displacement Index (60% of the AI risk composite) is manually curated editorial judgment, not an algorithmic measurement.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Keyword-based sentiment:</strong> Sentiment scoring uses keyword matching without NLP or contextual understanding. It captures broad trends but may miss nuance.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Tech-skewed community signal:</strong> Hacker News discussion data over-represents tech-adjacent practitioners and under-represents traditional creative industries.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>AI-generated synthesis:</strong> Role Intelligence sections are produced by Claude (Anthropic). They reflect the model&apos;s interpretation of data, not independent expert analysis.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>US-only scope:</strong> All data sources are US-focused. International markets may show different patterns.</span>
            </li>
          </ul>
        </section>

        <HairlineRule />

        {/* Section 8 — Data Freshness */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Data Freshness</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-6">
            Each data source has a different refresh cadence. The
            &ldquo;last updated&rdquo; date shown on each role page reflects
            when the snapshot was last rebuilt, not necessarily when upstream
            data changed.
          </p>
          <table className="w-full text-body-sm border-t border-ink">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Source</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Refresh</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2">Upstream Lag</th>
              </tr>
            </thead>
            <tbody className="text-dark">
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Adzuna</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">Real-time postings</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">BLS OES</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">12&ndash;18 months</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Google Trends</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">~3 days</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">GNews</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">Real-time headlines</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">O*NET</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">Annual updates</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Hacker News</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">Real-time posts</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Claude (Role Intel)</td>
                <td className="py-2 pr-4">24-hour cache</td>
                <td className="py-2">Model knowledge cutoff</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">FRED</td>
                <td className="py-2 pr-4">Weekly</td>
                <td className="py-2">Monthly releases</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Census ACS</td>
                <td className="py-2 pr-4">Annual seed</td>
                <td className="py-2">1&ndash;2 years</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">NEA</td>
                <td className="py-2 pr-4">Annual seed</td>
                <td className="py-2">2&ndash;3 years</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Upwork</td>
                <td className="py-2 pr-4">Annual seed</td>
                <td className="py-2">Annual report cycle</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <Footer lastUpdated={undefined} />
    </div>
  );
}

/* --- Helper component for data source entries --- */

function DataSourceEntry({
  name,
  description,
  refresh,
  limitations,
}: {
  name: string;
  description: string;
  refresh: string;
  limitations: string;
}) {
  return (
    <div className="border-b border-faint pb-4">
      <span className="font-mono text-label-md text-ink block mb-1">{name}</span>
      <p
        className="text-body-sm text-dark leading-relaxed mb-1"
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <p className="text-label-sm text-mid leading-relaxed">
        <span className="font-mono">Refresh:</span> {refresh}
      </p>
      <p
        className="text-label-sm text-mid leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: `<span class="font-mono">Limitations:</span> ${limitations}`,
        }}
      />
    </div>
  );
}
