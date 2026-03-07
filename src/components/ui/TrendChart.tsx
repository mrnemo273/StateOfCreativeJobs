'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Props = {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
};

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;

  const val = payload[0].value;
  const displayValue = formatter ? formatter(val) : val;

  return (
    <div className="bg-ink text-paper p-2 font-mono text-label-md">
      <p>{label}</p>
      <p>{displayValue}</p>
    </div>
  );
}

export default function TrendChart({
  data,
  height = 300,
  color,
  yAxisFormatter,
  tooltipFormatter,
}: Props) {
  const strokeColor = color || '#0A0A0A';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="var(--color-faint)"
        />
        <XAxis
          dataKey="date"
          tick={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fill: 'var(--color-mid)',
          }}
        />
        <YAxis
          width={50}
          tick={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fill: 'var(--color-mid)',
          }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          content={<CustomTooltip formatter={tooltipFormatter} />}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: strokeColor, stroke: 'none' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
