interface Props {
  sources: string;
  isNew?: boolean;
  className?: string;
}

export default function SourceBadge({ sources, isNew, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="border border-light px-2 py-0.5 font-mono text-label-sm text-mid">
        {sources}
      </span>
      {isNew && (
        <span className="bg-ink text-white px-1.5 py-0.5 text-label-sm font-mono uppercase tracking-widest leading-none">
          NEW
        </span>
      )}
    </span>
  );
}
