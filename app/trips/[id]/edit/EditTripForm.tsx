"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PURPOSE_OPTIONS } from "@/lib/purposes";
import AddressInput from "@/components/AddressInput";
import DatePicker from "@/components/DatePicker";

type Vehicle = { id: string; title: string };

type Trip = {
  id: string;
  driverName: string;
  vehicleId: string;
  tripDate: string;
  fromAddress: string;
  toAddress: string;
  distanceMiles: number;
  isRoundTrip: boolean;
  purposeCategory: string;
  purposeNotes: string | null;
};

export default function EditTripForm({ trip, vehicles }: { trip: Trip; vehicles: Vehicle[] }) {
  const router = useRouter();

  const [driverName, setDriverName] = useState(trip.driverName);
  const [vehicleId, setVehicleId] = useState(trip.vehicleId);
  const [tripDate, setTripDate] = useState(trip.tripDate);
  const [fromAddress, setFromAddress] = useState(trip.fromAddress);
  const [toAddress, setToAddress] = useState(trip.toAddress);
  const [distanceMiles, setDistanceMiles] = useState<number>(trip.distanceMiles);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(trip.isRoundTrip);
  const [purposeCategory, setPurposeCategory] = useState<string>(trip.purposeCategory);
  const [purposeNotes, setPurposeNotes] = useState<string>(trip.purposeNotes ?? "");

  const [calculating, setCalculating] = useState(false);
  const [calcErr, setCalcErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function recalc() {
    setCalcErr(null);
    setCalculating(true);
    try {
      const res = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromAddress, to: toAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not calculate distance");
      setDistanceMiles(Number(data.miles.toFixed(2)));
    } catch (e: unknown) {
      setCalcErr(e instanceof Error ? e.message : "Could not calculate distance");
    } finally {
      setCalculating(false);
    }
  }

  async function save() {
    setErr(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName: driverName.trim(),
          vehicleId,
          tripDate,
          fromAddress: fromAddress.trim(),
          toAddress: toAddress.trim(),
          distanceMiles,
          isRoundTrip,
          purposeCategory,
          purposeNotes: purposeNotes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this trip?")) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (!res.ok) {
      setErr((await res.json()).error ?? "Delete failed");
      setSaving(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="card space-y-4 p-5">
      <div>
        <label>Driver name</label>
        <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
      </div>

      <div>
        <label>Vehicle</label>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Date</label>
        <DatePicker value={tripDate} onChange={setTripDate} />
      </div>

      <div>
        <label>From</label>
        <AddressInput value={fromAddress} onChange={setFromAddress} />
      </div>
      <div>
        <label>To</label>
        <AddressInput value={toAddress} onChange={setToAddress} />
      </div>

      <button
        type="button"
        onClick={recalc}
        disabled={!fromAddress.trim() || !toAddress.trim() || calculating}
        className="btn-ghost w-full"
      >
        {calculating
          ? "Calculating…"
          : `One-way: ${distanceMiles.toFixed(1)} mi — recalculate`}
      </button>
      {calcErr && <p className="text-sm text-red-600">{calcErr}</p>}

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
        <span className="flex flex-col">
          <span className="text-sm font-medium text-ink">Round trip</span>
          <span className="text-xs text-black/50">Going there and coming back — doubles the miles</span>
        </span>
        <input
          type="checkbox"
          checked={isRoundTrip}
          onChange={(e) => setIsRoundTrip(e.target.checked)}
          className="!h-5 !w-5 !rounded !border-black/20"
        />
      </label>

      <div className="text-center text-sm text-black/60">
        Total logged:{" "}
        <span className="font-semibold text-ink">
          {(distanceMiles * (isRoundTrip ? 2 : 1)).toFixed(1)} mi
        </span>
        {isRoundTrip && <span className="ml-1 text-black/40">(round trip)</span>}
      </div>

      <div>
        <div className="text-sm font-medium uppercase tracking-wider text-black/50">Purpose</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PURPOSE_OPTIONS.map((p) => {
            const active = purposeCategory === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPurposeCategory(p)}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-ink hover:bg-black/5"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label>Notes</label>
        <textarea
          rows={3}
          value={purposeNotes}
          onChange={(e) => setPurposeNotes(e.target.value)}
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={remove} disabled={saving} className="btn-ghost text-red-600">
          Delete
        </button>
        <button type="button" onClick={save} disabled={saving || !purposeCategory} className="btn-primary flex-1">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
