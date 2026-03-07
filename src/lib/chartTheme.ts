export const chartTheme = {
  line: {
    strokeWidth: 1.5,
    dot: false,
    activeDot: {
      r: 4,
      stroke: "none",
    },
  },
  grid: {
    horizontal: true,
    vertical: false,
    stroke: "var(--color-faint)",
  },
  axis: {
    tick: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      fill: "var(--color-mid)",
    },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "var(--color-ink)",
      color: "var(--color-paper)",
      border: "none",
      borderRadius: 0,
      fontFamily: "var(--font-mono)",
      fontSize: "0.75rem",
      padding: "8px",
    },
    itemStyle: {
      color: "var(--color-paper)",
    },
  },
  colors: {
    primary: "#0A0A0A",
    up: "var(--color-up)",
    down: "var(--color-down)",
    neutral: "var(--color-neutral)",
    accent: "var(--color-accent)",
  },
};
