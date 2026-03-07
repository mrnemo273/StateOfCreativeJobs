import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionLabel({ children, className }: Props) {
  return (
    <h3
      className={clsx(
        'uppercase tracking-widest text-mid text-label-lg font-sans font-medium',
        className
      )}
    >
      {children}
    </h3>
  );
}
