"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { JobCluster } from "@/types";

type DataItem = {
  title: string;
  slug: string;
  cluster: JobCluster;
  value: number;
};

type Props = {
  data: DataItem[];
  label: string;
  formatType?: "risk" | "demand" | "salary";
  colorByValue?: "risk" | "demand" | "salary";
};

function getBarColor(value: number, colorMode?: string): string {
  if (colorMode === "risk") {
    if (value >= 70) return "var(--color-down)";
    if (value >= 50) return "#C85A1A";
    if (value >= 25) return "#B8860B";
    return "var(--color-up)";
  }
  if (colorMode === "demand") {
    if (value > 0) return "var(--color-up)";
    if (value < 0) return "var(--color-down)";
    return "var(--color-neutral)";
  }
  return "var(--color-ink)";
}

function formatValue(v: number, formatType?: string): string {
  if (formatType === "risk") return String(v);
  if (formatType === "demand") return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
  if (formatType === "salary") return `$${(v / 1000).toFixed(0)}k`;
  return String(v);
}

function CustomTooltip({
  active,
  payload,
  formatType,
}: {
  active?: boolean;
  payload?: { payload: DataItem; value: number }[];
  formatType?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-ink text-paper p-2 font-mono text-label-md">
      <p>{item.payload.title}</p>
      <p>{formatValue(item.value, formatType)}</p>
    </div>
  );
}

export default function RankingChart({
  data,
  label,
  formatType,
  colorByValue,
}: Props) {
  return (
    <div>
      <span className="text-label-sm text-mid uppercase tracking-widest block mb-3 font-medium">
        {label}
      </span>
      <ResponsiveContainer width="100%" height={data.length * 50 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fill: "var(--color-mid)",
            }}
            tickFormatter={(v) => formatValue(v, formatType)}
          />
          <YAxis
            type="category"
            dataKey="title"
            width={140}
            tick={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fill: "var(--color-ink)",
            }}
          />
          <Tooltip content={<CustomTooltip formatType={formatType} />} />
          <Bar dataKey="value" barSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={getBarColor(entry.value, colorByValue)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
