"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Vehicle = {
  id?: string;
  title: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  licensePlate?: string | null;
  vin?: string | null;
};

export default function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const [form, setForm] = useState<Vehicle>({
    title: vehicle?.title ?? "",
    make: vehicle?.make ?? "",
    model: vehicle?.model ?? "",
    year: vehicle?.year ?? undefined,
    licensePlate: vehicle?.licensePlate ?? "",
    vin: vehicle?.vin ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const url = vehicle?.id ? `/api/vehicles/${vehicle.id}` : `/api/vehicles`;
      const method = vehicle?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      router.push("/vehicles");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function remove() {
    if (!vehicle?.id) return;
    if (!confirm("Delete this vehicle? Trips with it will remain but the vehicle record will be removed.")) return;
    setSaving(true);
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" });
    if (!res.ok) {
      setErr((await res.json()).error ?? "Delete failed");
      setSaving(false);
      return;
    }
    router.push("/vehicles");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label>Title (required)</label>
        <input
          type="text"
          required
          placeholder="e.g. White SUV"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Make</label>
          <input
            type="text"
            value={form.make ?? ""}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
          />
        </div>
        <div>
          <label>Model</label>
          <input
            type="text"
            value={form.model ?? ""}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Year</label>
          <input
            type="number"
            inputMode="numeric"
            value={form.year ?? ""}
            onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label>License Plate</label>
          <input
            type="text"
            value={form.licensePlate ?? ""}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label>VIN</label>
        <input
          type="text"
          value={form.vin ?? ""}
          onChange={(e) => setForm({ ...form, vin: e.target.value })}
        />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? "Saving…" : vehicle?.id ? "Save" : "Add vehicle"}
        </button>
        {vehicle?.id && (
          <button type="button" onClick={remove} className="btn-ghost text-red-600">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
