"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { RoleSummary } from "@/lib/landingData";
import InlineSparkline from "./InlineSparkline";

const CLUSTER_LABELS: Record<string, string> = {
  "design-leadership": "Design Leadership",
  "product-ux": "Product & UX",
  "brand-visual": "Brand & Visual",
  "content-copy": "Content & Copy",
};

const RISK_STYLES: Record<string, string> = {
  Low: "bg-[#f3f4f6] text-[#4b5563]",
  Moderate: "bg-[#fef3c7] text-[#b45309]",
  Elevated: "bg-[#ffedd5] text-[#c2410c]",
  High: "bg-[#fee2e2] text-[#991b1b]",
};

type SortField = "title" | "cluster" | "openingsCount" | "yoyChange" | "medianSalary" | "aiScore";
type SortDir = "asc" | "desc";

function formatSalary(v: number) {
  if (v === 0) return "—";
  return `$${v.toLocaleString("en-US")}`;
}

function formatYoY(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v}%`;
}

export default function RoleLeaderboard({ roles }: { roles: RoleSummary[] }) {
  const [sortField, setSortField] = useState<SortField>("yoyChange");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    return [...roles].sort((a, b) => {
      let cmp: number;
      if (sortField === "title" || sortField === "cluster") {
        cmp = a[sortField].localeCompare(b[sortField]);
      } else {
        cmp = a[sortField] - b[sortField];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [roles, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortHeader({ field, label, align }: { field: SortField; label: string; align?: string }) {
    const active = sortField === field;
    const arrow = active ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";
    return (
      <th
        className={`py-3 px-2 text-label-sm text-mid uppercase tracking-widest font-mono font-normal cursor-pointer select-none whitespace-nowrap ${align === "right" ? "text-right" : "text-left"} ${active ? "text-ink" : ""}`}
        onClick={() => handleSort(field)}
      >
        {label}{arrow}
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-light">
            <SortHeader field="title" label="Role" />
            <SortHeader field="cluster" label="Cluster" />
            <SortHeader field="openingsCount" label="Open Roles" align="right" />
            <SortHeader field="yoyChange" label="YoY Change" align="right" />
            <th className="py-3 px-2 text-label-sm text-mid uppercase tracking-widest font-mono font-normal text-left">
              Trend
            </th>
            <SortHeader field="medianSalary" label="Median Salary" align="right" />
            <SortHeader field="aiScore" label="AI Risk" align="right" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((role) => (
            <tr
              key={role.slug}
              className="border-b border-faint hover:bg-faint/50 transition-colors duration-75"
              style={{ height: 48 }}
            >
              {/* Role */}
              <td className="py-2 px-2">
                <Link
                  href={`/role/${role.slug}`}
                  className="font-mono text-body-sm text-ink hover:underline"
                >
                  {role.title}
                </Link>
              </td>

              {/* Cluster */}
              <td className="py-2 px-2 hidden md:table-cell">
                <span className="text-label-sm text-mid font-mono">
                  {CLUSTER_LABELS[role.cluster] ?? role.cluster}
                </span>
              </td>

              {/* Open Roles */}
              <td className="py-2 px-2 text-right font-mono text-body-sm text-ink">
                {role.openingsCount.toLocaleString("en-US")}
              </td>

              {/* YoY Change */}
              <td className="py-2 px-2 text-right">
                <span
                  className={`font-mono text-body-sm font-semibold ${
                    role.yoyChange < 0 ? "text-[#9b2335]" : role.yoyChange > 0 ? "text-[#4a7c59]" : "text-mid"
                  }`}
                >
                  {role.yoyChange < 0 ? "\u2193" : role.yoyChange > 0 ? "\u2191" : ""}{" "}
                  {formatYoY(role.yoyChange)}
                </span>
              </td>

              {/* Sparkline */}
              <td className="py-2 px-2 hidden sm:table-cell">
                <InlineSparkline values={role.sparkline} positive={role.yoyChange >= 0} />
              </td>

              {/* Median Salary */}
              <td className="py-2 px-2 text-right font-mono text-body-sm text-ink hidden md:table-cell">
                {formatSalary(role.medianSalary)}
              </td>

              {/* AI Risk */}
              <td className="py-2 px-2 text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-label-sm font-mono ${
                    RISK_STYLES[role.aiLabel] ?? ""
                  }`}
                >
                  {role.aiScore} · {role.aiLabel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
