type Props = {
  values: number[];
  positive: boolean;
};

export default function InlineSparkline({ values, positive }: Props) {
  if (values.length < 2) return null;

  const w = 80;
  const h = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / range) * h,
  ]);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={d}
        fill="none"
        stroke={positive ? "#4a7c59" : "#9b2335"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
