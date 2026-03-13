import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionLabel from "@/components/ui/SectionLabel";
import HairlineRule from "@/components/ui/HairlineRule";

export const metadata: Metadata = {
  title: "Privacy Policy | State of Creative Jobs",
  description:
    "How State of Creative Jobs collects, uses, and protects your data. Our commitment to transparency and privacy.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="font-mono text-body-sm text-mid max-w-[65ch] leading-relaxed">
            Last updated: March 13, 2026
          </p>
        </section>

        <HairlineRule />

        {/* Overview */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Overview</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            State of Creative Jobs is a data-driven index tracking demand,
            compensation, AI risk, and sentiment for creative roles. We are
            committed to being transparent about the limited data we collect
            and how we use it.
          </p>
          <p className="text-body-sm text-dark leading-relaxed">
            This policy applies to the State of Creative Jobs website and
            email digest service.
          </p>
        </section>

        <HairlineRule />

        {/* What We Collect */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">What We Collect</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-6">
            We collect only what is necessary to deliver the digest service.
          </p>

          <div className="space-y-6">
            <div className="border-b border-faint pb-4">
              <span className="font-mono text-label-md text-ink block mb-1">
                Email Address
              </span>
              <p className="text-body-sm text-dark leading-relaxed">
                Provided when you subscribe to the weekly digest. Used
                exclusively to send your personalized digest emails, welcome
                confirmation, and service-related communications.
              </p>
            </div>
            <div className="border-b border-faint pb-4">
              <span className="font-mono text-label-md text-ink block mb-1">
                Role Preferences
              </span>
              <p className="text-body-sm text-dark leading-relaxed">
                The creative roles you choose to track. Used to personalize
                your digest content with relevant snapshots and data.
              </p>
            </div>
            <div className="border-b border-faint pb-4">
              <span className="font-mono text-label-md text-ink block mb-1">
                Digest Frequency
              </span>
              <p className="text-body-sm text-dark leading-relaxed">
                Your preferred delivery cadence (weekly or monthly). Used to
                determine when to send your digest.
              </p>
            </div>
          </div>
        </section>

        <HairlineRule />

        {/* What We Don't Collect */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">What We Don&apos;t Collect</SectionLabel>
          <ul className="space-y-3 text-body-sm text-dark leading-relaxed">
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span>We do not use cookies for tracking or advertising.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span>We do not collect payment information or financial data.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span>We do not track your browsing behavior across other websites.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span>We do not sell, rent, or share your data with third parties for marketing purposes.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span>We do not use analytics platforms that create user profiles.</span>
            </li>
          </ul>
        </section>

        <HairlineRule />

        {/* How We Use Your Data */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">How We Use Your Data</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Your data is used for one purpose: delivering the digest service
            you subscribed to.
          </p>
          <div className="space-y-4">
            <div>
              <span className="font-mono text-label-md text-ink">Sending Digests</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                We use your email address and role preferences to generate
                and send personalized digest emails via Resend, our email
                delivery provider.
              </p>
            </div>
            <div>
              <span className="font-mono text-label-md text-ink">Subscription Management</span>
              <p className="text-body-sm text-dark leading-relaxed mt-1">
                We store a confirmation token during the double opt-in
                process. Once confirmed, the token is no longer needed but
                may be retained for audit purposes.
              </p>
            </div>
          </div>
        </section>

        <HairlineRule />

        {/* Data Storage */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Data Storage &amp; Security</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-4">
            Subscriber data is stored securely in a managed database hosted
            by Turso. Email delivery is handled by Resend. Both services
            maintain industry-standard security practices.
          </p>
          <p className="text-body-sm text-dark leading-relaxed">
            We do not store passwords &mdash; the digest service does not
            require an account or login.
          </p>
        </section>

        <HairlineRule />

        {/* Your Rights */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Your Rights</SectionLabel>
          <ul className="space-y-3 text-body-sm text-dark leading-relaxed">
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Unsubscribe anytime:</strong> Every email includes a one-click unsubscribe link. Your data will be removed from our mailing list immediately.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Data deletion:</strong> You may request complete deletion of your subscriber data by emailing us. We will process requests within 7 days.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-mid shrink-0">&bull;</span>
              <span><strong>Data access:</strong> You may request a copy of the data we hold about you at any time.</span>
            </li>
          </ul>
        </section>

        <HairlineRule />

        {/* Third-Party Services */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Third-Party Services</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed mb-6">
            We use a minimal set of third-party services to operate the site
            and digest.
          </p>
          <table className="w-full text-body-sm border-t border-ink">
            <thead>
              <tr className="border-b border-ink">
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Service</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2 pr-4">Purpose</th>
                <th className="text-left uppercase tracking-widest text-label-md text-mid py-2">Data Shared</th>
              </tr>
            </thead>
            <tbody className="text-dark">
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Vercel</td>
                <td className="py-2 pr-4">Hosting</td>
                <td className="py-2">Standard server logs</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Resend</td>
                <td className="py-2 pr-4">Email delivery</td>
                <td className="py-2">Email address</td>
              </tr>
              <tr className="border-b border-faint">
                <td className="py-2 pr-4 font-mono">Turso</td>
                <td className="py-2 pr-4">Database</td>
                <td className="py-2">Subscriber records</td>
              </tr>
            </tbody>
          </table>
        </section>

        <HairlineRule />

        {/* Contact */}
        <section className="py-10 md:py-14 max-w-[65ch]">
          <SectionLabel className="mb-6">Contact</SectionLabel>
          <p className="text-body-sm text-dark leading-relaxed">
            For privacy-related questions, data deletion requests, or
            concerns, contact us at{" "}
            <a
              href="mailto:privacy@juanemo.com"
              className="font-mono text-accent underline hover:opacity-70 transition-opacity"
            >
              privacy@juanemo.com
            </a>
            .
          </p>
        </section>
      </main>

      <Footer lastUpdated={undefined} />
    </div>
  );
}
