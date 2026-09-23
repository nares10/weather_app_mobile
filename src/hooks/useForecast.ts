import { useQuery } from "@tanstack/react-query";

import { fetchForecast } from "@/api/openMeteo";
import type { Place } from "@/types/weather";

// Compare with the milestone 3–5 version in git history: request keys,
// derived loading state, abort-on-unmount and retry are all handled by
// TanStack Query now. The query key identifies the data: a different
// place means a different cache entry.
export function useForecast(place: Place) {
  return useQuery({
    queryKey: ["forecast", place.latitude, place.longitude, place.name],
    queryFn: ({ signal }) => fetchForecast(place.latitude, place.longitude, place.name, signal),
    // Weather doesn't change by the second. Within 10 minutes, revisiting
    // a city shows cached data instantly without a new request.
    staleTime: 10 * 60 * 1000,
  });
}
