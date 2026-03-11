"use client";

import AuthorBio from "@/components/landing/AuthorBio";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink mt-12">
      <div
        className="max-w-[1440px] mx-auto py-10"
        style={{ padding: "var(--grid-margin)" }}
      >
        <h2
          className="font-mono text-ink leading-none mb-10"
          style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
        >
          State of Creative Jobs
        </h2>

        <div className="grid grid-cols-12 gap-[var(--grid-gutter)]">
          {/* Methodology */}
          <div className="col-span-12 md:col-span-6 mb-8 md:mb-0">
            <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-3">
              Methodology
            </span>
            <p className="text-body-sm text-dark leading-relaxed max-w-[55ch]">
              Each role is scored across four dimensions — demand, compensation,
              AI exposure, and sentiment — using publicly available data refreshed
              daily. Job posting volume and location data are aggregated from
              active listings. Salary figures reflect median reported compensation
              across seniority bands. AI impact scores are derived from
              occupation task analysis, weighting automation potential against
              each role&apos;s core responsibilities. Sentiment is computed from
              recent industry news coverage using natural language analysis.
            </p>
          </div>

          {/* Data Sources */}
          <div className="col-span-12 md:col-span-3">
            <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-3">
              Data Sources
            </span>
            <ul className="space-y-2">
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">Adzuna</span>
                <span className="text-mid block text-label-sm">Job postings &amp; demand</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">Bureau of Labor Statistics</span>
                <span className="text-mid block text-label-sm">Salary &amp; compensation</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">O*NET</span>
                <span className="text-mid block text-label-sm">Skills &amp; AI impact analysis</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">GNews</span>
                <span className="text-mid block text-label-sm">Industry news &amp; sentiment</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="col-span-12 md:col-span-3">
            <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-3">
              Disclaimer
            </span>
            <p className="text-label-sm text-mid leading-relaxed">
              This report is for informational purposes only and does not
              constitute career, financial, or investment advice. Data is
              sourced from third-party APIs and may not reflect all market
              conditions. Scores and trends are algorithmic estimates, not
              definitive assessments.
            </p>
          </div>
        </div>

        {/* About the Author */}
        <div className="border-t border-light mt-8 pt-8">
          <AuthorBio />
        </div>

        {/* Copyright */}
        <div className="border-t border-light mt-8 pt-4">
          <span className="text-label-sm text-mid font-mono">
            &copy; {year} State of Creative Jobs
          </span>
        </div>
      </div>
    </footer>
  );
}
