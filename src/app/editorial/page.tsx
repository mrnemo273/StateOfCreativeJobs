import fs from "fs";
import path from "path";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HairlineRule from "@/components/ui/HairlineRule";

interface EditorialEntry {
  month: string;
  monthLabel: string;
  headline: string;
  body: string;
  generatedAt: string;
  dataAsOf: string;
}

function getAllEditorials(): EditorialEntry[] {
  const dir = path.join(process.cwd(), "src", "data", "editorials");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const editorials: EditorialEntry[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      editorials.push(JSON.parse(raw));
    } catch {
      // skip malformed files
    }
  }

  // Newest first
  return editorials.sort((a, b) => b.month.localeCompare(a.month));
}

function getExcerpt(body: string): string {
  // First two sentences
  const sentences = body.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 2).join(" ").trim();
}

export default function EditorialArchivePage() {
  const editorials = getAllEditorials();

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main
        className="max-w-[1440px] mx-auto"
        style={{ padding: "var(--grid-margin)" }}
      >
        <section className="pt-12 md:pt-16 mb-8 md:mb-12">
          <span className="font-mono text-label-sm text-mid uppercase tracking-widest block mb-4">
            Research Index
          </span>
          <h1
            className="font-mono text-ink leading-none mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Monthly Editorial
          </h1>
          <p className="font-mono text-body-sm text-mid max-w-[55ch] leading-relaxed">
            A monthly synthesis of patterns across all 20 tracked creative roles.
            Cross-cluster analysis, emerging trends, and the data behind the narrative.
          </p>
        </section>

        <HairlineRule />

        {editorials.length === 0 && (
          <section className="py-16 text-center">
            <p className="font-mono text-mid text-label-md uppercase tracking-widest">
              No editorials published yet. Check back after the next monthly analysis.
            </p>
          </section>
        )}

        {editorials.length > 0 && (
          <section className="mt-8 md:mt-12">
            <ul className="space-y-0">
              {editorials.map((editorial, i) => (
                <li key={editorial.month}>
                  {i > 0 && (
                    <div className="border-t border-light" />
                  )}
                  <Link
                    href={`/editorial/${editorial.month}`}
                    className="block py-8 md:py-10 group"
                  >
                    <div className="grid grid-cols-12 gap-x-6 items-start">
                      <div className="col-span-12 md:col-span-3 mb-2 md:mb-0">
                        <span className="font-mono text-data-sm text-mid uppercase tracking-widest">
                          {editorial.monthLabel}
                        </span>
                      </div>
                      <div className="col-span-12 md:col-span-9">
                        <h2
                          className="font-mono text-ink leading-tight mb-3 group-hover:text-accent transition-colors"
                          style={{ fontSize: "var(--text-display-md)" }}
                        >
                          {editorial.headline}
                        </h2>
                        <p className="text-body-sm text-dark leading-relaxed max-w-[60ch]">
                          {getExcerpt(editorial.body)}
                        </p>
                        <span className="inline-block mt-3 font-mono text-label-md text-mid uppercase tracking-widest group-hover:text-ink transition-colors">
                          Read &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
