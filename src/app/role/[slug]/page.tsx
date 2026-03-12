"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSnapshot, getAllTitles } from "@/lib/dataService";
import type { JobHealthSnapshot, JobTitle } from "@/types";
import type { RoleEnrichment, MarketEnrichment } from "@/lib/enrichmentData";
import Header from "@/components/Header";
import RoleVerdict from "@/components/RoleVerdict";
import DemandSection from "@/components/DemandSection";
import SalarySection from "@/components/SalarySection";
import AIImpactSection from "@/components/AIImpactSection";
import SkillsSignalSection from "@/components/SkillsSignalSection";
import RoleIntelligence from "@/components/RoleIntelligence";
import SentimentSection from "@/components/SentimentSection";
import PostingAnalysisSection from "@/components/PostingAnalysisSection";
import MarketView from "@/components/MarketView";
import HairlineRule from "@/components/ui/HairlineRule";
import Footer from "@/components/Footer";

export default function RoleDeepDive() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [snapshot, setSnapshot] = useState<JobHealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrichment, setEnrichment] = useState<RoleEnrichment | null>(null);
  const [marketEnrichment, setMarketEnrichment] = useState<MarketEnrichment | null>(null);
  const allTitles = getAllTitles();

  const fetchLiveData = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snapshot/${s}`);
      if (res.ok) {
        const data: JobHealthSnapshot = await res.json();
        setSnapshot(data);
      } else {
        const mock = getSnapshot(s);
        setSnapshot(mock);
      }
    } catch {
      const mock = getSnapshot(s);
      setSnapshot(mock);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData(slug);
  }, [slug, fetchLiveData]);

  // Phase 4: Enrichment data (static cache, loaded once per slug)
  useEffect(() => {
    fetch(`/api/enrichment/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setEnrichment)
      .catch(() => setEnrichment(null));

    fetch(`/api/enrichment/market`)
      .then((r) => r.ok ? r.json() : null)
      .then(setMarketEnrichment)
      .catch(() => setMarketEnrichment(null));
  }, [slug]);

  if (!snapshot && !loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="font-mono text-mid">No data available for this title.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Header lastUpdated={snapshot?.lastUpdated} />

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
            value={slug}
            onChange={(e) => router.push(`/role/${e.target.value}`)}
            className="border border-ink bg-paper px-4 py-2 font-mono text-body text-ink cursor-pointer hover:bg-faint transition-colors duration-75 appearance-none pr-10 uppercase tracking-widest w-full md:w-auto"
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
              <h2 className="font-mono text-ink leading-none" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
                {snapshot.title}
              </h2>
              <p className="text-body-sm text-mid mt-3 max-w-[65ch] leading-relaxed">
                {snapshot.description}
              </p>
            </div>

            {/* Verdict banner — Phase 4 */}
            <div className="col-span-12">
              <RoleVerdict
                yoyChange={snapshot.demand.yoyChange}
                fredIndexChangeYoY={marketEnrichment?.fred.indexChangeYoY}
                openingsCount={snapshot.demand.openingsCount}
                medianSalaryUSD={snapshot.salary.medianUSD}
                salaryYoYChange={snapshot.salary.yoyChange}
                aiScore={snapshot.aiImpact.score}
                aiScoreLabel={snapshot.aiImpact.scoreLabel}
              />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* 1. Demand */}
            <div className="col-span-12">
              <DemandSection
                snapshot={snapshot}
                fredMacro={marketEnrichment?.fred}
              />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* 2. Salary */}
            <div className="col-span-12">
              <SalarySection
                snapshot={snapshot}
                acsDemographics={enrichment?.acs}
              />
            </div>

            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>

            {/* 3. Beyond the Job Posting — competitive landscape */}
            {marketEnrichment && (
              <>
                <div className="col-span-12">
                  <MarketView
                    market={marketEnrichment}
                    roleNEA={enrichment?.nea}
                    roleUpwork={enrichment?.upwork}
                    roleTitle={snapshot.title}
                  />
                </div>
                <div className="col-span-12 my-4">
                  <HairlineRule />
                </div>
              </>
            )}

            {/* 4. AI Impact — future threat */}
            <div className="col-span-12">
              <AIImpactSection snapshot={snapshot} />
            </div>

            {/* 5. Skills Signal — what's changing */}
            {(snapshot.skills.rising.length > 0 || snapshot.skills.declining.length > 0) && (
              <>
                <div className="col-span-12 my-4">
                  <HairlineRule />
                </div>
                <div className="col-span-12">
                  <SkillsSignalSection snapshot={snapshot} />
                </div>
              </>
            )}

            {/* 6. Posting Analysis — what employers want */}
            {(snapshot.postingAnalysis.topSkills.length > 0 || snapshot.postingAnalysis.commonResponsibilities.length > 0) && (
              <>
                <div className="col-span-12 my-4">
                  <HairlineRule />
                </div>
                <div className="col-span-12">
                  <PostingAnalysisSection snapshot={snapshot} />
                </div>
              </>
            )}

            {/* 7. Role Intelligence — editorial synthesis */}
            <div className="col-span-12 my-4">
              <HairlineRule />
            </div>
            <div className="col-span-12">
              <RoleIntelligence slug={slug} />
            </div>

            {/* 8. Sentiment & News — closing color */}
            {(snapshot.sentiment.recentHeadlines.length > 0 || snapshot.sentiment.communityPosts.length > 0 || snapshot.sentiment.score !== 0) && (
              <>
                <div className="col-span-12 my-4">
                  <HairlineRule />
                </div>
                <div className="col-span-12">
                  <SentimentSection snapshot={snapshot} />
                </div>
              </>
            )}

          </>
        )}
      </main>

      {snapshot && !loading && <Footer />}
    </div>
  );
}
