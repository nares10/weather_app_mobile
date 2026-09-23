import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchCities } from "@/api/geocoding";

export const MIN_QUERY_LENGTH = 2;

export function useCitySearch(query: string) {
  return useQuery({
    queryKey: ["citySearch", query],
    queryFn: ({ signal }) => searchCities(query, signal),
    // Don't search until the query is long enough.
    enabled: query.length >= MIN_QUERY_LENGTH,
    // City names don't change; cache results for an hour.
    staleTime: 60 * 60 * 1000,
    // While the next query loads, keep showing the previous results
    // instead of flashing a spinner on every keystroke.
    placeholderData: keepPreviousData,
  });
}
