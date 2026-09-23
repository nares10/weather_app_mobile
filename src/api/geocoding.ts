import type { CitySearchResult } from "@/types/weather";

import { fetchJson } from "./http";

// Open-Meteo geocoding API — free, no key.
// Docs: https://open-meteo.com/en/docs/geocoding-api
const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

type GeocodingResponse = {
  // Missing entirely (not an empty array) when nothing matches.
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string; // state / province
    admin2?: string; // district / county
  }[];
};

export async function searchCities(query: string, signal?: AbortSignal): Promise<CitySearchResult[]> {
  const params = new URLSearchParams({ name: query, count: "10", language: "en", format: "json" });

  const data = await fetchJson<GeocodingResponse>(`${BASE_URL}?${params}`, signal);
  return (data.results ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    description: describe(city.name, [city.admin2, city.admin1, city.country]),
  }));
}

// "Jaipur" + ["Jaipur district", "Rajasthan", "India"] -> "Rajasthan, India".
// Skip blanks and parts that just repeat the city name.
function describe(name: string, parts: (string | undefined)[]): string {
  return parts
    .filter((part): part is string => !!part && !part.includes(name))
    .join(", ");
}
