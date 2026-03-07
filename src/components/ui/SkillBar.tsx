import clsx from 'clsx';

type Props = {
  skill: string;
  value: number;
  isRising?: boolean;
};

export default function SkillBar({ skill, value, isRising = false }: Props) {
  const displayValue = value > 0 ? `+${value}%` : `${value}%`;
  const barWidth = Math.min(Math.abs(value), 100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-sans text-body-sm">{skill}</span>
        <span className="font-mono text-data-sm tabular-nums">{displayValue}</span>
      </div>
      <div className="mt-1 w-full h-1 bg-faint">
        <div
          className={clsx('h-full', isRising ? 'bg-up' : 'bg-down')}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
