"use client";

import { useState, useEffect, useCallback } from "react";
import { getSnapshot, getAllTitles } from "@/lib/dataService";
import type { JobHealthSnapshot, JobTitle } from "@/types";
import Header from "@/components/Header";
import HealthScoreSummary from "@/components/HealthScoreSummary";
import DemandSection from "@/components/DemandSection";
import SalarySection from "@/components/SalarySection";
import AIImpactSection from "@/components/AIImpactSection";
import SkillsSignalSection from "@/components/SkillsSignalSection";
import SentimentSection from "@/components/SentimentSection";
import PostingAnalysisSection from "@/components/PostingAnalysisSection";
import HairlineRule from "@/components/ui/HairlineRule";

export default function Home() {
  const [selectedSlug, setSelectedSlug] = useState("creative-director");
  const [snapshot, setSnapshot] = useState<JobHealthSnapshot | null>(() =>
    getSnapshot(selectedSlug),
  );
  const [loading, setLoading] = useState(false);
  const allTitles = getAllTitles();

  const fetchLiveData = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snapshot/${slug}`);
      if (res.ok) {
        const data: JobHealthSnapshot = await res.json();
        setSnapshot(data);
      } else {
        // API failed — fall back to mock
        const mock = getSnapshot(slug);
        setSnapshot(mock);
      }
    } catch {
      const mock = getSnapshot(slug);
      setSnapshot(mock);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData(selectedSlug);
  }, [selectedSlug, fetchLiveData]);

  if (!snapshot && !loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-mid">No data available for this title.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main
        className="grid grid-cols-12 gap-[var(--grid-gutter)] max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        {/* Job title selector */}
        <div className="col-span-12 mb-2">
          <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-2">
            Select Role
          </span>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="border border-ink bg-paper px-4 py-2 font-mono text-body text-ink cursor-pointer hover:bg-faint transition-colors duration-75 appearance-none pr-10 uppercase tracking-widest"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%230A0A0A' stroke-width='1.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            {allTitles.map((t: JobTitle) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="col-span-12 py-16 flex items-center justify-center">
            <span className="font-mono text-label-md text-mid uppercase tracking-widest animate-pulse">
              Loading live data...
            </span>
          </div>
        )}

        {/* Dashboard content */}
        {snapshot && !loading && (
          <>
            {/* Hero title */}
            <div className="col-span-12 mb-4">
              <span className="text-label-md text-mid uppercase tracking-widest font-mono block mb-2">
                {snapshot.cluster.replace("-", " ")}
              </span>
              <h2 className="font-mono text-display-lg text-ink leading-none">
                {snapshot.title}
              </h2>
              <p className="text-body-sm text-mid mt-3 max-w-[65ch] leading-relaxed">
                {snapshot.description}
              </p>
            </div>

            {/* Health Score Summary — 4-up stat cards */}
            <div className="col-span-12 mb-2">
              <HealthScoreSummary snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* Demand Section */}
            <div className="col-span-12">
              <DemandSection snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* Salary Section */}
            <div className="col-span-12">
              <SalarySection snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* AI Impact Section */}
            <div className="col-span-12">
              <AIImpactSection snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* Skills Signal Section */}
            <div className="col-span-12">
              <SkillsSignalSection snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* Sentiment & News */}
            <div className="col-span-12">
              <SentimentSection snapshot={snapshot} />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* Posting Analysis */}
            <div className="col-span-12">
              <PostingAnalysisSection snapshot={snapshot} />
            </div>

            {/* Footer */}
            <div className="col-span-12 mt-8 mb-4">
              <HairlineRule />
              <p className="text-label-sm text-mid font-mono mt-4">
                Design Job Health Tracker — Data sourced from Adzuna, BLS, GNews
                &amp; O*NET. Falls back to illustrative data when API keys are not
                configured.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
