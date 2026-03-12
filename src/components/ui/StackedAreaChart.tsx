"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { UpworkSplitPoint } from "@/lib/enrichmentData";

type Props = {
  data: UpworkSplitPoint[];
  height?: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-ink text-paper p-2 font-mono text-label-md">
      <p>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name}>
          {entry.name === "staffPct" ? "Staff" : "Freelance"}: {entry.value}%
        </p>
      ))}
    </div>
  );
}

export default function StackedAreaChart({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-faint)"
        />
        <XAxis
          dataKey="year"
          tick={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fill: "var(--color-mid)",
          }}
        />
        <YAxis
          width={50}
          domain={[0, 100]}
          tick={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fill: "var(--color-mid)",
          }}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="staffPct"
          stackId="1"
          stroke="#0A0A0A"
          fill="#0A0A0A"
          fillOpacity={0.8}
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="freelancePct"
          stackId="1"
          stroke="var(--color-accent)"
          fill="var(--color-accent)"
          fillOpacity={0.6}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
