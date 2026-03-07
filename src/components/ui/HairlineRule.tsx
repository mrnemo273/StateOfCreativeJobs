import clsx from 'clsx';

type Props = {
  className?: string;
};

export default function HairlineRule({ className }: Props) {
  return <hr className={clsx('border-t border-ink w-full', className)} />;
}
