import clsx from 'clsx';

type Props = {
  value: number;
  format?: 'percent' | 'currency' | 'number';
};

export default function TrendBadge({ value, format = 'percent' }: Props) {
  const isUp = value > 0;
  const isDown = value < 0;

  const arrow = isUp ? '\u2191' : isDown ? '\u2193' : '\u2192';
  const displayValue = isUp ? `+${value}` : `${value}`;

  const suffix = format === 'percent' ? '%' : format === 'currency' ? '$' : '';
  const label =
    format === 'currency'
      ? `${arrow} ${isUp ? '+' : ''}${suffix}${Math.abs(value)}`
      : `${arrow} ${displayValue}${suffix}`;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 font-mono text-label-md',
        isUp && 'text-up bg-up-bg',
        isDown && 'text-down bg-down-bg',
        !isUp && !isDown && 'text-neutral bg-neutral-bg'
      )}
    >
      {label}
    </span>
  );
}
