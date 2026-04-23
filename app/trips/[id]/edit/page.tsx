import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditTripForm from "./EditTripForm";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const trip = await prisma.trip.findUnique({ where: { id: params.id } });
  if (!trip) notFound();
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit trip</h1>
        <Link href="/" className="text-sm text-black/50">Back</Link>
      </header>
      <EditTripForm
        trip={{
          id: trip.id,
          driverName: trip.driverName,
          vehicleId: trip.vehicleId,
          tripDate: trip.tripDate.toISOString().slice(0, 10),
          fromAddress: trip.fromAddress,
          toAddress: trip.toAddress,
          distanceMiles: trip.distanceMiles,
          isRoundTrip: trip.isRoundTrip,
          purposeCategory: trip.purposeCategory,
          purposeNotes: trip.purposeNotes,
        }}
        vehicles={vehicles.map((v) => ({ id: v.id, title: v.title }))}
      />
    </>
  );
}
