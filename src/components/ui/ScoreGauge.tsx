'use client';

import DataValue from './DataValue';
import SectionLabel from './SectionLabel';

type Props = {
  score: number;
  label: string;
};

function getFillColor(score: number): string {
  if (score <= 25) return 'var(--color-up)';
  if (score <= 50) return '#B8860B';
  if (score <= 75) return '#C85A1A';
  return 'var(--color-down)';
}

export default function ScoreGauge({ score, label }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const fillColor = getFillColor(clampedScore);

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <DataValue value={clampedScore} className="text-data-lg" />
      <div className="mt-2 w-full h-2 bg-faint">
        <div
          className="h-full"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}
