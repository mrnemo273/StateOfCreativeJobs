"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

export default function AuthorBio() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("juan@chameleon.co");
    } catch {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement("textarea");
      ta.value = "juan@chameleon.co";
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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
        <button
          type="button"
          onClick={handleCopy}
          className="font-mono text-label-sm text-ink uppercase tracking-widest border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors text-center whitespace-nowrap cursor-pointer"
        >
          {copied ? "Copied!" : "Email"}
        </button>

        {/* Toast */}
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 font-mono text-label-sm bg-ink text-paper px-5 py-3 tracking-widest uppercase transition-all duration-300 ${
            copied
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          juan@chameleon.co copied to clipboard
        </div>
        <a
          href="https://www.linkedin.com/in/jmorales273/"
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
