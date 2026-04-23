const UA = "TravelTracker/1.0 (mileage logger)";

export type LatLng = { lat: number; lon: number; display: string };

export async function geocode(q: string): Promise<LatLng> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us,ca&q=${encodeURIComponent(
    q
  )}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`Geocoder error ${res.status}`);
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data.length) throw new Error(`Address not found: ${q}`);
  const hit = data[0];
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), display: hit.display_name };
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
