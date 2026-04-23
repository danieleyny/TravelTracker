const UA = "TravelTracker/1.0 (mileage logger)";

export type LatLng = { lat: number; lon: number };

type PhotonProps = {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countrycode?: string;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: PhotonProps;
};

export function formatLabel(p: PhotonProps): string {
  const line1 =
    p.housenumber && p.street
      ? `${p.housenumber} ${p.street}`
      : p.name || p.street || "";
  const locality = p.city || p.town || p.village || p.county || "";
  const region = [p.state, p.postcode].filter(Boolean).join(" ");
  const parts = [line1, locality, region, p.country].filter(Boolean);
  // Deduplicate adjacent identical parts (e.g. city === name).
  const out: string[] = [];
  for (const part of parts) if (part && part !== out[out.length - 1]) out.push(part);
  return out.join(", ");
}

export async function photonSearch(q: string, limit = 5): Promise<Array<{ label: string; lat: number; lon: number }>> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=en`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];
  const out: Array<{ label: string; lat: number; lon: number }> = [];
  const seen = new Set<string>();
  for (const f of features) {
    const cc = f.properties.countrycode?.toUpperCase();
    if (cc && cc !== "US" && cc !== "CA") continue;
    const label = formatLabel(f.properties);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const [lon, lat] = f.geometry.coordinates;
    out.push({ label, lat, lon });
  }
  return out;
}

export async function geocodeOne(q: string): Promise<LatLng & { label: string }> {
  const hits = await photonSearch(q, 1);
  if (!hits.length) throw new Error(`Address not found: ${q}`);
  return { lat: hits[0].lat, lon: hits[0].lon, label: hits[0].label };
}

export async function drivingMiles(from: LatLng, to: LatLng): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Routing error ${res.status}`);
  const data = (await res.json()) as { routes?: Array<{ distance: number }> };
  const meters = data.routes?.[0]?.distance;
  if (typeof meters !== "number") throw new Error("No route found");
  return meters / 1609.344;
}
