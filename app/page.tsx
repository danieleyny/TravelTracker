import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function Home() {
  const trips = await prisma.trip.findMany({
    orderBy: [{ tripDate: "desc" }, { createdAt: "desc" }],
    include: { vehicle: true },
    take: 200,
  });

  const year = new Date().getFullYear();
  const ytdMiles = trips
    .filter((t) => t.tripDate.getFullYear() === year)
    .reduce((s, t) => s + t.distanceMiles, 0);

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Trips</h1>
          <p className="mt-1 text-sm text-black/50">
            {year} total: <span className="font-medium text-ink">{ytdMiles.toFixed(1)} mi</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export?year=${year}`} className="btn-ghost text-sm">
            Export {year}
          </a>
        </div>
      </header>

      <Link
        href="/trips/new"
        className="card mb-4 flex items-center justify-between px-5 py-4 hover:bg-black/[.02]"
      >
        <span className="text-base font-medium">+ Log a new trip</span>
        <span className="text-black/30">›</span>
      </Link>

      {trips.length === 0 ? (
        <div className="card px-5 py-10 text-center text-black/50">
          No trips yet. Tap above to log your first drive.
        </div>
      ) : (
        <ul className="space-y-2">
          {trips.map((t) => (
            <li key={t.id} className="card px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-black/40">{fmtDate(t.tripDate)} · {t.driverName} · {t.vehicle.title}</div>
                  <div className="mt-1 truncate text-sm font-medium">{t.fromAddress}</div>
                  <div className="truncate text-sm text-black/60">→ {t.toAddress}</div>
                  <div className="mt-1 text-xs text-black/50">{t.purposeCategory}{t.purposeNotes ? ` — ${t.purposeNotes}` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold">{t.distanceMiles.toFixed(1)}</div>
                  <div className="text-xs text-black/40">miles</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <NavBar />
    </>
  );
}
