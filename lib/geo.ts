const UA = "TravelTracker/1.0 (mileage logger)";

export type LatLng = { lat: number; lon: number };

type MapboxFeature = {
  geometry: { coordinates: [number, number] };
  properties: { full_address?: string; name?: string; place_formatted?: string };
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
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
};

function mapboxLabel(f: MapboxFeature): string {
  const p = f.properties;
  return p.full_address || [p.name, p.place_formatted].filter(Boolean).join(", ");
}

function photonLabel(f: PhotonFeature): string {
  const p = f.properties;
  const line1 =
    p.housenumber && p.street
      ? `${p.housenumber} ${p.street}`
      : p.name || p.street || "";
  const locality = p.city || p.town || p.village || p.county || "";
  const region = [p.state, p.postcode].filter(Boolean).join(" ");
  const out: string[] = [];
  for (const part of [line1, locality, region, p.country])
    if (part && part !== out[out.length - 1]) out.push(part);
  return out.join(", ");
}

async function mapboxSearch(q: string, limit: number) {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(q)}&country=us,ca&limit=${limit}&access_token=${token}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const data = (await res.json()) as { features?: MapboxFeature[] };
  const features = data.features ?? [];
  const seen = new Set<string>();
  const out: Array<{ label: string; lat: number; lon: number }> = [];
  for (const f of features) {
    const label = mapboxLabel(f);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const [lon, lat] = f.geometry.coordinates;
    out.push({ label, lat, lon });
  }
  return out;
}

async function photonSearchInternal(q: string, limit: number) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}&lang=en`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];
  const seen = new Set<string>();
  const out: Array<{ label: string; lat: number; lon: number }> = [];
  for (const f of features) {
    const cc = f.properties.countrycode?.toUpperCase();
    if (cc && cc !== "US" && cc !== "CA") continue;
    const label = photonLabel(f);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const [lon, lat] = f.geometry.coordinates;
    out.push({ label, lat, lon });
  }
  return out;
}

export async function addressSearch(q: string, limit = 6): Promise<Array<{ label: string; lat: number; lon: number }>> {
  const mb = await mapboxSearch(q, limit);
  if (mb && mb.length > 0) return mb;
  return await photonSearchInternal(q, limit);
}

export async function geocodeOne(q: string): Promise<LatLng & { label: string }> {
  const hits = await addressSearch(q, 1);
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
