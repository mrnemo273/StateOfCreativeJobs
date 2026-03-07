import clsx from 'clsx';

type Props = {
  value: string | number;
  className?: string;
};

export default function DataValue({ value, className }: Props) {
  return (
    <span className={clsx('font-mono tabular-nums', className)}>
      {value}
    </span>
  );
}
