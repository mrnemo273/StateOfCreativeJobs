"use client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Header() {
  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();
  const day = now.getDate();
  const dateStr = `${month} ${day}, ${year}`;

  return (
    <header className="border-b border-ink">
      <div className="flex items-center justify-between px-6 py-3">
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          {dateStr}
        </span>
        <span className="font-mono text-label-lg text-ink uppercase tracking-widest font-bold">
          {year} State of Creative Jobs Report
        </span>
        <span className="font-mono text-label-sm text-mid uppercase tracking-widest">
          Last updated {dateStr}
        </span>
      </div>
    </header>
  );
}
