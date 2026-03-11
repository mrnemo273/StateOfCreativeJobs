import type { RoleSummary } from "@/lib/landingData";
import { computeMarketConditions } from "@/lib/landingData";

type Props = {
  roles: RoleSummary[];
};

export default function MarketConditionsBar({ roles }: Props) {
  const conditions = computeMarketConditions(roles);

  const stats = [
    { label: "Roles Tracked", value: "20" },
    {
      label: "Total Open Positions",
      value: conditions.totalOpenings.toLocaleString("en-US"),
    },
    { label: "Avg AI Risk Score", value: String(conditions.avgAiScore) },
    { label: "Roles in YoY Decline", value: String(conditions.inDecline) },
    {
      label: "Highest Risk Role",
      value: conditions.highestRisk
        ? `${conditions.highestRisk.title} — ${conditions.highestRisk.aiScore}`
        : "—",
    },
  ];

  return (
    <div className="py-4 md:py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`${i > 0 ? "md:border-l md:border-light md:pl-6" : ""} ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <span className="text-label-sm text-mid uppercase tracking-widest font-mono block mb-1">
              {stat.label}
            </span>
            <span className="font-mono text-data-md text-ink">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
