import type { CitySearchResult } from "@/types/weather";

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
  }[];
};

export async function searchCities(query: string, signal?: AbortSignal): Promise<CitySearchResult[]> {
  const params = new URLSearchParams({ name: query, count: "10", language: "en", format: "json" });

  const response = await fetch(`${BASE_URL}?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`City search failed (${response.status})`);
  }

  const data = (await response.json()) as GeocodingResponse;
  return (data.results ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    description: [city.admin1, city.country].filter(Boolean).join(", "),
  }));
}
