"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/methodology", label: "Methodology" },
  { href: "/benchmarks", label: "Benchmarks" },
];

const ANIM_DURATION = 250; // ms — keep in sync with CSS

const SCROLL_THRESHOLD = 80; // px before hide/show kicks in

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // controls DOM presence
  const [animIn, setAnimIn] = useState(false); // controls CSS class for enter
  const [isDesktop, setIsDesktop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Track desktop breakpoint (md = 768px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Show/hide header on scroll direction
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < SCROLL_THRESHOLD) {
        // Always show near the top
        setHeaderVisible(true);
      } else if (currentY < lastScrollY.current) {
        // Scrolling up → show
        setHeaderVisible(true);
      } else if (currentY > lastScrollY.current) {
        // Scrolling down → hide (unless menu is open)
        if (!open) setHeaderVisible(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // --- open/close orchestration ---
  useEffect(() => {
    if (open) {
      // Mount → next frame trigger enter animation
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      // Trigger exit animation → unmount after duration
      setAnimIn(false);
      timeoutRef.current = setTimeout(() => setMounted(false), ANIM_DURATION);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [open, handleKey]);

  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const y = String(now.getFullYear()).slice(-2);
  const dateStr = `${m}/${d}/${y}`;

  return (
    <>
      <header
        className="border-b border-ink sticky top-0 z-[70] bg-paper transition-transform duration-300"
        style={{ transform: headerVisible ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div className="grid grid-cols-3 items-center px-6 py-3">
          <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
            {dateStr}
          </span>
          <Link
            href="/"
            className="font-mono text-label-sm text-ink uppercase tracking-widest font-bold hover:opacity-70 transition-opacity text-center leading-tight md:whitespace-nowrap"
          >
            State Of<br className="md:hidden" /> Creative Jobs
          </Link>
          <button
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="p-1 hover:opacity-70 transition-opacity justify-self-end focus:outline-none"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              className={open && isDesktop ? "text-paper" : "text-ink"}
              style={{ transform: open && isDesktop ? "translateY(5px)" : "none" }}
            >
              {/* Top line → rotates to first leg of ✕ on desktop */}
              <line
                x1="3" y1="5" x2="17" y2="5"
                style={{
                  transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                  transformOrigin: "10px 10px",
                  transform: open && isDesktop ? "rotate(45deg) translateY(5px)" : "rotate(0) translateY(0)",
                }}
              />
              {/* Middle line → fades out on desktop */}
              <line
                x1="3" y1="10" x2="17" y2="10"
                style={{
                  transition: "opacity 150ms ease",
                  opacity: open && isDesktop ? 0 : 1,
                }}
              />
              {/* Bottom line → rotates to second leg of ✕ on desktop */}
              <line
                x1="3" y1="15" x2="17" y2="15"
                style={{
                  transition: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
                  transformOrigin: "10px 10px",
                  transform: open && isDesktop ? "rotate(-45deg) translateY(-5px)" : "rotate(0) translateY(0)",
                }}
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop — fade (below header) */}
      {mounted && (
        <div
          className="fixed inset-0 z-[75] transition-opacity"
          style={{
            backgroundColor: "rgba(10,10,10,0.4)",
            opacity: animIn ? 1 : 0,
            transitionDuration: `${ANIM_DURATION}ms`,
          }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        />
      )}

      {/* Desktop panel — top-right drop-in (above header) */}
      {mounted && (
        <nav
          className="hidden md:block fixed top-3 right-3 z-[80] bg-ink px-6 pt-4 pb-6 min-w-[220px] rounded-lg transition-all"
          style={{
            opacity: animIn ? 1 : 0,
            transform: animIn ? "translateY(0)" : "translateY(-12px)",
            transitionDuration: `${ANIM_DURATION}ms`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex justify-end mb-1" style={{ marginRight: "-10px", marginTop: "-5px" }}>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-1 hover:opacity-70 transition-opacity focus:outline-none"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
                className="text-paper"
              >
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
          </div>
          <ul className="space-y-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-mono text-label-md uppercase tracking-widest transition-opacity ${
                    pathname === link.href
                      ? "text-paper font-bold opacity-100"
                      : "text-paper opacity-50 hover:opacity-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Mobile tray — slides up from bottom (above header) */}
      {mounted && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-ink rounded-t-xl p-6 pt-4 transition-transform"
          style={{
            transform: animIn ? "translateY(0)" : "translateY(100%)",
            transitionDuration: `${ANIM_DURATION}ms`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Pull-down indicator */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 rounded-full" style={{ backgroundColor: "rgba(245,243,238,0.5)" }} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="font-mono text-label-sm uppercase tracking-widest" style={{ color: "rgba(245,243,238,0.6)" }}>
              Menu
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-1 hover:opacity-70 transition-opacity focus:outline-none"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
                className="text-paper"
              >
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
          </div>
          <ul className="space-y-5 pb-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-mono text-label-lg uppercase tracking-widest transition-opacity ${
                    pathname === link.href
                      ? "text-paper font-bold opacity-100"
                      : "text-paper opacity-50 hover:opacity-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
