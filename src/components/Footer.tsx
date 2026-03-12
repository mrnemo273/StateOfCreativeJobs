"use client";

import AuthorBio from "@/components/landing/AuthorBio";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink mt-8 md:mt-12">
      <div
        className="max-w-[1440px] mx-auto py-8 md:py-10"
        style={{ padding: "var(--grid-margin)" }}
      >
        <h2
          className="font-mono text-ink leading-none mb-6 md:mb-10"
          style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
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
              Each role is scored across four dimensions &mdash; demand,
              compensation, AI exposure, and sentiment &mdash; using publicly
              available data refreshed weekly. Job posting volume and location
              data are aggregated from active listings via Adzuna. Salary
              figures combine median reported compensation with Census ACS
              metro-level wage data and income distribution percentiles.
            </p>
            <p className="text-body-sm text-dark leading-relaxed max-w-[55ch] mt-3">
              AI impact scores are derived from O*NET occupation task analysis,
              weighting automation potential against each role&apos;s core
              responsibilities. Market context layers in FRED macro employment
              indicators, NEA workforce supply estimates (including
              moonlighting multipliers), and Upwork freelance employment
              structure to show the full picture beyond job postings alone.
              Sentiment is computed from industry news coverage and
              practitioner discussions on Hacker News.
            </p>
          </div>

          {/* Data Sources */}
          <div className="col-span-12 md:col-span-3 mb-8 md:mb-0">
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
                <span className="font-mono text-label-md text-ink">FRED</span>
                <span className="text-mid block text-label-sm">Macro employment context</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">U.S. Census (ACS)</span>
                <span className="text-mid block text-label-sm">Metro wages &amp; income distribution</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">NEA</span>
                <span className="text-mid block text-label-sm">Artists in the Workforce supply data</span>
              </li>
              <li className="text-body-sm text-dark">
                <span className="font-mono text-label-md text-ink">Upwork</span>
                <span className="text-mid block text-label-sm">Freelance employment structure</span>
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
        <div className="border-t border-light mt-6 md:mt-8 pt-6 md:pt-8">
          <AuthorBio />
        </div>

        {/* Copyright */}
        <div className="border-t border-light mt-6 md:mt-8 pt-4 flex justify-between items-center">
          <span className="text-label-sm text-mid font-mono uppercase tracking-widest">
            &copy; {year} STATE OF CREATIVE JOBS
          </span>
          <a
            href="https://creative-jobs.juanemo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-sm text-mid font-mono uppercase tracking-widest hover:text-ink transition-colors"
          >
            CREATIVE-JOBS.JUANEMO.COM
          </a>
        </div>
      </div>
    </footer>
  );
}
