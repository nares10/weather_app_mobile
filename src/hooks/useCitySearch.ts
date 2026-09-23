import { useEffect, useState } from "react";

import { searchCities } from "@/api/geocoding";
import type { CitySearchResult } from "@/types/weather";

// Same hand-rolled pattern as useForecast (milestone 6 replaces both
// with TanStack Query), plus an "idle" state for queries too short to search.
export type CitySearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; results: CitySearchResult[] };

type SettledResult = Extract<CitySearchState, { status: "error" | "success" }>;

export const MIN_QUERY_LENGTH = 2;

export function useCitySearch(query: string) {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${query}|${attempt}`;
  const [result, setResult] = useState<{ key: string; value: SettledResult } | null>(null);
  const tooShort = query.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (tooShort) return;

    const controller = new AbortController();
    searchCities(query, controller.signal)
      .then((results) => setResult({ key: requestKey, value: { status: "success", results } }))
      .catch(() => {
        if (controller.signal.aborted) return; // superseded by a newer query
        setResult({
          key: requestKey,
          value: { status: "error", message: "Couldn't search right now. Check your connection." },
        });
      });

    return () => controller.abort();
  }, [query, requestKey, tooShort]);

  let state: CitySearchState;
  if (tooShort) state = { status: "idle" };
  else if (result?.key === requestKey) state = result.value;
  else state = { status: "loading" };

  const retry = () => setAttempt((n) => n + 1);

  return { state, retry };
}
