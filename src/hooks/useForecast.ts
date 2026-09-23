import { useEffect, useState } from "react";

import { fetchForecast } from "@/api/openMeteo";
import type { Forecast } from "@/types/weather";

// Hand-rolled data fetching (milestone 6 swaps this for TanStack Query).
//
// One state value with a `status` field, rather than separate
// isLoading / error / data states, so impossible combinations
// (e.g. loading *and* error) can't happen.
export type ForecastState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; forecast: Forecast };

type SettledResult = Exclude<ForecastState, { status: "loading" }>;

const TIMEOUT_MS = 10_000;

export function useForecast(latitude: number, longitude: number, locationName: string) {
  // Bumping this number starts a new request — that's our "retry".
  const [attempt, setAttempt] = useState(0);
  // Every request gets a key. We remember which request a result came from.
  const requestKey = `${latitude},${longitude},${locationName},${attempt}`;
  const [result, setResult] = useState<{ key: string; value: SettledResult } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    fetchForecast(latitude, longitude, locationName, controller.signal)
      .then((forecast) => setResult({ key: requestKey, value: { status: "success", forecast } }))
      .catch((error: unknown) => {
        // Aborted because the component unmounted or inputs changed:
        // a newer request is in charge now, so stay quiet.
        if (controller.signal.aborted && !timedOut) return;
        setResult({
          key: requestKey,
          value: { status: "error", message: toFriendlyMessage(error, timedOut) },
        });
      })
      .finally(() => clearTimeout(timeout));

    // Cleanup runs before the next effect and on unmount.
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [latitude, longitude, locationName, requestKey]);

  // "Loading" isn't stored — it's derived: if the latest result doesn't
  // belong to the current request, that request is still in flight.
  // (Setting a loading state inside the effect would cost an extra render.)
  const state: ForecastState =
    result?.key === requestKey ? result.value : { status: "loading" };

  const retry = () => setAttempt((n) => n + 1);

  return { state, retry };
}

function toFriendlyMessage(error: unknown, timedOut: boolean): string {
  if (timedOut) return "The weather service took too long to respond.";
  // React Native's fetch throws a TypeError when there's no connection.
  if (error instanceof TypeError) return "Couldn't reach the weather service. Check your connection.";
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
