import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function DataFootnote({ children, className }: Props) {
  return (
    <p
      className={clsx(
        "text-label-sm text-mid leading-relaxed mt-4 max-w-[65ch]",
        className,
      )}
    >
      {children}
    </p>
  );
}
