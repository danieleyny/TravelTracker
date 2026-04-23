"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PURPOSE_OPTIONS } from "@/lib/purposes";
import AddressInput from "@/components/AddressInput";

type Vehicle = { id: string; title: string };

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function NewTripWizard({
  vehicles,
  recentDrivers,
}: {
  vehicles: Vehicle[];
  recentDrivers: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [driverName, setDriverName] = useState("");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [tripDate, setTripDate] = useState(today());
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calcErr, setCalcErr] = useState<string | null>(null);

  const [purposeCategory, setPurposeCategory] = useState<string>("");
  const [purposeNotes, setPurposeNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  async function calcDistance() {
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
      setDistanceMiles(null);
      setCalcErr(e instanceof Error ? e.message : "Could not calculate distance");
    } finally {
      setCalculating(false);
    }
  }

  const canContinue =
    driverName.trim() &&
    vehicleId &&
    tripDate &&
    fromAddress.trim() &&
    toAddress.trim() &&
    distanceMiles != null &&
    distanceMiles > 0;

  async function submit() {
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverName: driverName.trim(),
          vehicleId,
          tripDate,
          fromAddress: fromAddress.trim(),
          toAddress: toAddress.trim(),
          distanceMiles,
          purposeCategory: purposeCategory || "Other",
          purposeNotes: purposeNotes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Submit failed");
      router.push("/");
      router.refresh();
    } catch (e: unknown) {
      setSubmitErr(e instanceof Error ? e.message : "Submit failed");
      setSubmitting(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="card p-5 text-center">
        <p className="mb-4 text-black/70">Add a vehicle before logging a trip.</p>
        <a href="/vehicles" className="btn-primary">Add a vehicle</a>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="card space-y-4 p-5">
        <div>
          <label>Driver name</label>
          <input
            type="text"
            list="drivers"
            placeholder="Your name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
          <datalist id="drivers">
            {recentDrivers.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
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
          <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
        </div>

        <div>
          <label>From</label>
          <AddressInput
            value={fromAddress}
            placeholder="Starting address"
            onChange={(v) => { setFromAddress(v); setDistanceMiles(null); }}
          />
        </div>
        <div>
          <label>To</label>
          <AddressInput
            value={toAddress}
            placeholder="Destination address"
            onChange={(v) => { setToAddress(v); setDistanceMiles(null); }}
          />
        </div>

        <button
          type="button"
          onClick={calcDistance}
          disabled={!fromAddress.trim() || !toAddress.trim() || calculating}
          className="btn-ghost w-full"
        >
          {calculating ? "Calculating…" : distanceMiles != null ? `Distance: ${distanceMiles.toFixed(1)} mi — recalculate` : "Calculate distance"}
        </button>
        {calcErr && <p className="text-sm text-red-600">{calcErr}</p>}

        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep(2)}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="card space-y-4 p-5">
      <div>
        <div className="text-sm font-medium uppercase tracking-wider text-black/50">What was this trip for?</div>
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
        <label>Notes (optional)</label>
        <textarea
          rows={4}
          placeholder="e.g. 123 Main St showing for the Kim family"
          value={purposeNotes}
          onChange={(e) => setPurposeNotes(e.target.value)}
        />
      </div>

      {submitErr && <p className="text-sm text-red-600">{submitErr}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !purposeCategory}
          className="btn-primary flex-1"
        >
          {submitting ? "Saving…" : "Save trip"}
        </button>
      </div>
    </div>
  );
}
