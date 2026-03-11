import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "var(--font-display)",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "Helvetica Neue",
          "Helvetica",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        white: "var(--color-white)",
        dark: "var(--color-dark)",
        mid: "var(--color-mid)",
        light: "var(--color-light)",
        faint: "var(--color-faint)",
        up: "var(--color-up)",
        "up-bg": "var(--color-up-bg)",
        down: "var(--color-down)",
        "down-bg": "var(--color-down-bg)",
        neutral: "var(--color-neutral)",
        "neutral-bg": "var(--color-neutral-bg)",
        accent: "var(--color-accent)",
        "accent-bg": "var(--color-accent-bg)",
        "up-muted": "var(--color-up-muted)",
        "down-muted": "var(--color-down-muted)",
      },
      spacing: {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
        "24": "6rem",
      },
      fontSize: {
        "display-xl": "clamp(3rem, 6vw, 6rem)",
        "display-lg": "clamp(2rem, 4vw, 3.5rem)",
        "display-md": "clamp(1.5rem, 2.5vw, 2rem)",
        "data-xl": "clamp(2.5rem, 5vw, 5rem)",
        "data-hero": "clamp(2.25rem, 4.5vw, 3.75rem)",
        "data-lg": "clamp(1.5rem, 3vw, 2.5rem)",
        "data-md": "1.125rem",
        "data-sm": "0.875rem",
        "label-lg": "0.875rem",
        "label-md": "0.75rem",
        "label-sm": "0.625rem",
        body: "1rem",
        "body-sm": "0.875rem",
      },
      gridTemplateColumns: {
        "dashboard": "repeat(12, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
export default config;
