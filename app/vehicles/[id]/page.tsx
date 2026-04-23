import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NavBar from "@/components/NavBar";
import VehicleForm from "../VehicleForm";

export const dynamic = "force-dynamic";

export default async function EditVehicle({ params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!vehicle) notFound();

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit vehicle</h1>
        <Link href="/vehicles" className="text-sm text-black/50">Back</Link>
      </header>
      <div className="card p-5">
        <VehicleForm vehicle={vehicle} />
      </div>
      <NavBar />
    </>
  );
}
