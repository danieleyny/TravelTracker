import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewTripWizard from "./NewTripWizard";

export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  const recentDrivers = await prisma.trip.findMany({
    distinct: ["driverName"],
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { driverName: true },
  });

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">New trip</h1>
        <Link href="/" className="text-sm text-black/50">Cancel</Link>
      </header>
      <NewTripWizard
        vehicles={vehicles.map((v) => ({ id: v.id, title: v.title }))}
        recentDrivers={[...new Set(recentDrivers.map((d) => d.driverName))]}
      />
    </>
  );
}
