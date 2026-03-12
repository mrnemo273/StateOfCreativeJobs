'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

type AnnotationData = {
  date: string;
  label: string;
};

type Props = {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  annotations?: AnnotationData[];
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
  annotations,
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
        {annotations?.slice(0, 3).map((a) => (
          <ReferenceLine
            key={a.date}
            x={a.date}
            stroke="var(--color-mid)"
            strokeDasharray="4 4"
            label={{
              value: a.label,
              position: 'top',
              fill: 'var(--color-mid)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
