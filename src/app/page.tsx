import { getRoleSummaries } from "@/lib/landingData.server";
import { computeMarketConditions } from "@/lib/landingData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HairlineRule from "@/components/ui/HairlineRule";
import MarketConditionsBar from "@/components/landing/MarketConditionsBar";
import RoleLeaderboard from "@/components/landing/RoleLeaderboard";


export default function LandingPage() {
  const roles = getRoleSummaries();
  const conditions = roles.length > 0 ? computeMarketConditions(roles) : null;
  const lastUpdated = conditions?.mostRecent ?? undefined;

  return (
    <div className="min-h-screen bg-paper">
      <Header lastUpdated={lastUpdated} />

      <main
        className="max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        {/* Section 1 — Masthead + Essay (stacked, full-width headline) */}
        <section className="pt-12 md:pt-16 mb-8 md:mb-12">
          {/* Headline — SVG scales to fill the content column width */}
          <h1 className="mb-4 md:mb-6 w-full" aria-label="State of Creative Jobs">
            <svg
              viewBox="-10 0 720 200"
              className="w-full h-auto block"
              role="img"
              aria-hidden="true"
            >
              <text
                x="350"
                y="78"
                textAnchor="middle"
                className="font-mono"
                style={{
                  fontSize: "88px",
                  fontFamily: "var(--font-mono)",
                  fill: "var(--color-ink)",
                  fontWeight: 400,
                }}
              >
                State Of
              </text>
              <text
                x="350"
                y="178"
                textAnchor="middle"
                className="font-mono"
                style={{
                  fontSize: "88px",
                  fontFamily: "var(--font-mono)",
                  fill: "var(--color-ink)",
                  fontWeight: 400,
                }}
              >
                Creative Jobs
              </text>
            </svg>
          </h1>

          {/* Subhead + byline + date */}
          <div className="mb-10 md:mb-12 text-center">
            <p className="font-mono text-ink font-medium leading-relaxed" style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)" }}>
              An ongoing study of AI displacement in the creative workforce.
            </p>
          </div>

          {/* Body copy — two columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <p className="font-mono text-body-sm text-ink leading-[1.75]">
              This project tracks 20 creative roles across the job market &mdash; from
              copywriters and graphic designers to product designers and creative
              directors. Each week, we pull fresh posting data and score every role
              for AI disruption risk based on volume trends, salary shifts, and
              tooling overlap.
            </p>
            <p className="font-mono text-body-sm text-ink leading-[1.75]">
              The goal is simple: make the invisible shift visible. There is no
              single dataset that captures how AI is reshaping creative work. Job
              boards tell part of the story. Practitioner sentiment tells another.
              We combine both into a living index, updated weekly, so the people
              closest to these changes can see them clearly.
            </p>
            <p className="font-mono text-body-sm text-ink leading-[1.75] md:col-span-1">
              Below you&rsquo;ll find a market snapshot, a sortable leaderboard of all 20
              roles, and deep-dive dashboards for each. The data speaks for itself
              &mdash; some roles are growing, others are contracting, and a few are
              being fundamentally redefined.
            </p>
          </div>
        </section>

        <div className="mb-8 md:mb-12">
          <HairlineRule />
        </div>

        {/* Section 3 — Market Conditions Bar */}
        {roles.length > 0 && (
          <section className="mb-8 md:mb-12">
            <MarketConditionsBar roles={roles} />
          </section>
        )}

        <div className="mb-8 md:mb-12">
          <HairlineRule />
        </div>

        {/* Section 4 — The Index (Leaderboard) */}
        {roles.length > 0 && (
          <section className="mb-8 md:mb-12">
            <h2 className="font-mono text-ink mb-4 md:mb-6" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
              The Index
            </h2>
            <RoleLeaderboard roles={roles} />
          </section>
        )}

        {roles.length === 0 && (
          <section className="mb-12 py-16 text-center">
            <p className="font-mono text-mid text-label-md uppercase tracking-widest">
              No role data available yet. Run the refresh script to populate.
            </p>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
