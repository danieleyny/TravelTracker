import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import VehicleForm from "./VehicleForm";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Vehicles</h1>
        <Link href="/" className="text-sm text-black/50">Back</Link>
      </header>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-black/50">Add vehicle</h2>
        <VehicleForm />
      </div>

      {vehicles.length === 0 ? (
        <div className="card px-5 py-10 text-center text-black/50">No vehicles yet.</div>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li key={v.id} className="card px-5 py-4">
              <Link href={`/vehicles/${v.id}`} className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">{v.title}</div>
                  <div className="text-xs text-black/50">
                    {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Details not set"}
                    {v.licensePlate ? ` · ${v.licensePlate}` : ""}
                  </div>
                </div>
                <span className="text-black/30">Edit ›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <NavBar />
    </>
  );
}
