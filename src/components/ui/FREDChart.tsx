"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

import type { TrendPoint } from "@/types";
import type { FREDRecessionBand } from "@/lib/enrichmentData";

type Props = {
  indexData: TrendPoint[];
  recessionBands: FREDRecessionBand[];
  height?: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-ink text-paper p-2 font-mono text-label-md">
      <p>{label}</p>
      <p>Index: {payload[0].value.toFixed(1)}</p>
    </div>
  );
}

export default function FREDChart({ indexData, recessionBands, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={indexData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-faint)"
        />
        <XAxis
          dataKey="date"
          tick={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fill: "var(--color-mid)",
          }}
        />
        <YAxis
          width={50}
          tick={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fill: "var(--color-mid)",
          }}
          tickFormatter={(v: number) => v.toFixed(0)}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Recession bands as shaded vertical areas */}
        {recessionBands.map((band) => (
          <ReferenceArea
            key={band.start}
            x1={band.start}
            x2={band.end}
            fill="var(--color-faint)"
            fillOpacity={0.8}
            label={{
              value: band.label,
              position: "insideTop",
              style: {
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fill: "var(--color-mid)",
              },
            }}
          />
        ))}

        <Line
          type="monotone"
          dataKey="value"
          stroke="#0A0A0A"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#0A0A0A", stroke: "none" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
