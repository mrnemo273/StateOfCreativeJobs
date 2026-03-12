import clsx from "clsx";

export type SkillClassification =
  | "invest"
  | "watch"
  | "core"
  | "shed"
  | "emerging";

type Props = {
  skill: string;
  frequencyPercent: number;
  changePercent?: number;
  classification: SkillClassification;
  plain?: boolean;
};

const CLASS_CONFIG: Record<
  SkillClassification,
  { bg: string; text: string; arrow: string }
> = {
  invest: { bg: "bg-up-bg", text: "text-up", arrow: "\u2191" },
  emerging: { bg: "bg-up-bg/50", text: "text-up", arrow: "\u2191" },
  core: { bg: "bg-faint", text: "text-mid", arrow: "\u2192" },
  watch: { bg: "bg-neutral-bg", text: "text-neutral", arrow: "\u2193" },
  shed: { bg: "bg-down-bg", text: "text-down", arrow: "\u2193" },
};

export default function SkillGapBar({
  skill,
  frequencyPercent,
  changePercent,
  classification,
  plain,
}: Props) {
  const cfg = CLASS_CONFIG[classification];
  const barWidth = Math.min(frequencyPercent, 100);

  return (
    <div className={clsx("px-3 py-2", !plain && cfg.bg)}>
      <div className="flex items-center justify-between">
        <span className="font-sans text-body-sm text-dark">{skill}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-data-sm tabular-nums text-mid">
            {frequencyPercent}%
          </span>
          {changePercent != null && (
            <span
              className={clsx(
                "font-mono text-label-sm tabular-nums",
                cfg.text,
              )}
            >
              {cfg.arrow}{" "}
              {changePercent > 0 ? `+${changePercent}` : changePercent}%
            </span>
          )}
        </div>
      </div>
      <div className="mt-1 w-full h-1 bg-black/10">
        <div
          className="h-full bg-black/15"
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
