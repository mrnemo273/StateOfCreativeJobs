import clsx from 'clsx';

type Props = {
  headline: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

const sentimentStyles = {
  positive: 'text-up bg-up-bg',
  neutral: 'text-neutral bg-neutral-bg',
  negative: 'text-down bg-down-bg',
};

export default function NewsCard({ headline, source, date, sentiment }: Props) {
  return (
    <div className="border border-light p-4">
      <p className="text-body-sm font-sans font-medium">{headline}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-label-sm text-mid font-mono">
          {source} &middot; {date}
        </span>
        <span
          className={clsx(
            'inline-flex items-center px-2 py-0.5 text-label-sm font-mono uppercase',
            sentimentStyles[sentiment]
          )}
        >
          {sentiment}
        </span>
      </div>
    </div>
  );
}
