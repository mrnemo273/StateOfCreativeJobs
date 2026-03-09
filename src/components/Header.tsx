"use client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface HeaderProps {
  lastUpdated?: string; // ISO date string e.g. "2026-03-09"
}

export default function Header({ lastUpdated }: HeaderProps) {
  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();
  const day = now.getDate();
  const dateStr = `${month} ${day}, ${year}`;

  // Format the snapshot timestamp for display
  let dataDateStr = dateStr; // fallback to today
  if (lastUpdated) {
    const d = new Date(lastUpdated + "T00:00:00");
    dataDateStr = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  return (
    <header className="border-b border-ink">
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          {dateStr}
        </span>
        <span className="font-mono text-label-lg text-ink uppercase tracking-widest font-bold">
          State of Creative Jobs
        </span>
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          Data from {dataDateStr}
        </span>
      </div>
      <div className="flex md:hidden flex-col items-center gap-1 px-4 py-3">
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          {dateStr}
        </span>
        <span className="font-mono text-label-lg text-ink uppercase tracking-widest font-bold text-center">
          State of Creative Jobs
        </span>
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          Data from {dataDateStr}
        </span>
      </div>
    </header>
  );
}
