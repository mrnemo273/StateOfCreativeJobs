import Image from "next/image";

export default function AuthorBio() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_auto] gap-6 items-start">
      {/* Circular photo with newspaper multiply effect */}
      <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden bg-paper shrink-0">
        <div
          className="absolute inset-0 z-10 rounded-full"
          style={{ backgroundColor: "var(--color-paper)", mixBlendMode: "multiply" }}
        />
        <Image
          src="/images/author-bio.png"
          alt="Juan-Carlos Morales"
          width={200}
          height={200}
          className="w-full h-full object-cover rounded-full"
          style={{
            filter: "grayscale(100%) contrast(1.3) brightness(1.1)",
            mixBlendMode: "multiply",
            opacity: 0.75,
          }}
        />
      </div>

      {/* Bio text */}
      <div>
        <h3 className="font-mono text-label-sm text-mid uppercase tracking-widest mb-3">
          About the Author
        </h3>
        <p className="text-body-sm text-dark leading-relaxed max-w-[55ch]">
          <strong className="text-ink font-mono">Juan-Carlos Morales</strong> is a veteran creative
          leader with more than two decades of experience across advertising, consulting,
          and digital product design. Formerly Global Chief Creative Officer at PwC, he
          has led creative and innovation work for brands including Google, LEGO, Marriott,
          and Coca-Cola. His career across agencies and consultancies gives him a unique
          perspective on how AI is reshaping the future of creative work.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-row md:flex-col gap-3 md:pt-8">
        <a
          href="mailto:hello@jcmorales.com"
          className="font-mono text-label-sm text-ink uppercase tracking-widest border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors text-center whitespace-nowrap"
        >
          Email
        </a>
        <a
          href="https://linkedin.com/in/jcmorales"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-label-sm text-ink uppercase tracking-widest border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors text-center whitespace-nowrap"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
