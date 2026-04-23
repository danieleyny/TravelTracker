"use client";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [y, m, d] = value.split("-").map(Number);
  const thisYear = new Date().getFullYear();
  const years = [thisYear - 1, thisYear, thisYear + 1];
  const maxDay = daysInMonth(y || thisYear, (m || 1) - 1);

  function setPart(part: "y" | "m" | "d", v: number) {
    let ny = y, nm = m, nd = d;
    if (part === "y") ny = v;
    if (part === "m") nm = v;
    if (part === "d") nd = v;
    const cap = daysInMonth(ny, nm - 1);
    if (nd > cap) nd = cap;
    onChange(`${ny}-${pad(nm)}-${pad(nd)}`);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={m} onChange={(e) => setPart("m", Number(e.target.value))} aria-label="Month">
        {MONTHS.map((name, i) => (
          <option key={i} value={i + 1}>{name}</option>
        ))}
      </select>
      <select value={d} onChange={(e) => setPart("d", Number(e.target.value))} aria-label="Day">
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <select value={y} onChange={(e) => setPart("y", Number(e.target.value))} aria-label="Year">
        {years.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}
