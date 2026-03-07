'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

type Props = {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
};

export default function Sparkline({ data, color, height = 40 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color || '#0A0A0A'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
