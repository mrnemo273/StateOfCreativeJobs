import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HairlineRule from "@/components/ui/HairlineRule";

interface EditorialData {
  month: string;
  monthLabel: string;
  headline: string;
  body: string;
  generatedAt: string;
  dataAsOf: string;
}

function getEditorial(month: string): EditorialData | null {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "editorials",
    `${month}.json`,
  );
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function EditorialPage({
  params,
}: {
  params: { month: string };
}) {
  const editorial = getEditorial(params.month);
  if (!editorial) notFound();

  // Split body into paragraphs
  const paragraphs = editorial.body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main
        className="max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        {/* Back link */}
        <div className="pt-8 md:pt-12 mb-8 md:mb-12">
          <Link
            href="/editorial"
            className="font-mono text-label-md text-mid uppercase tracking-widest hover:text-ink transition-colors"
          >
            &larr; All Editorials
          </Link>
        </div>

        {/* Byline */}
        <section className="mb-6 md:mb-8">
          <span className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-4">
            Monthly Market Analysis
          </span>
          <h1
            className="font-mono text-ink leading-none mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            {editorial.headline}
          </h1>
          <p className="font-mono text-label-md text-mid tracking-wide">
            Analysis by State of Creative Jobs Index &middot;{" "}
            {editorial.monthLabel}
          </p>
        </section>

        <HairlineRule />

        {/* Editorial body — magazine reading layout */}
        <article className="mt-8 md:mt-12 mb-12 md:mb-16">
          <div className="max-w-[65ch] mx-auto">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-body text-ink leading-[1.75] mb-6 last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>
        </article>

        <HairlineRule />

        {/* Footer metadata */}
        <div className="mt-6 md:mt-8 mb-12 md:mb-16 flex flex-col md:flex-row md:justify-between gap-4">
          <p className="font-mono text-label-sm text-mid">
            Data sourced from the State of Creative Jobs Index.{" "}
            <Link
              href="/methodology"
              className="underline hover:text-ink transition-colors"
            >
              Methodology &rarr;
            </Link>
          </p>
          <p className="font-mono text-label-sm text-mid">
            Data as of{" "}
            <span className="text-ink">{formatDate(editorial.dataAsOf)}</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
