import * as Location from "expo-location";
import { useEffect, useState } from "react";

import type { Place } from "@/types/weather";

export type DeviceLocationState =
  | { status: "locating" }
  // canAskAgain = false means Android won't show the permission dialog any
  // more ("Don't ask again"); the user has to enable it in Settings.
  | { status: "denied"; canAskAgain: boolean }
  | { status: "unavailable"; message: string }
  | { status: "found"; place: Place };

type SettledResult = Exclude<DeviceLocationState, { status: "locating" }>;

const POSITION_TIMEOUT_MS = 15_000;
// A last-known fix up to 10 minutes old is good enough for weather.
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

export function useDeviceLocation() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; value: SettledResult } | null>(null);

  useEffect(() => {
    let cancelled = false;

    findDeviceLocation().then((value) => {
      if (!cancelled) setResult({ attempt, value });
    });

    // We can't abort the native location request, but we can ignore its
    // result if the screen has gone away or a retry has started.
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Same trick as useForecast: "locating" is derived, not stored.
  const state: DeviceLocationState =
    result?.attempt === attempt ? result.value : { status: "locating" };

  const retry = () => setAttempt((n) => n + 1);

  return { state, retry };
}

async function findDeviceLocation(): Promise<SettledResult> {
  try {
    // Shows the system dialog the first time; afterwards it resolves
    // immediately with the remembered answer.
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { status: "denied", canAskAgain: permission.canAskAgain };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      return { status: "unavailable", message: "Location is turned off on this device." };
    }

    // The cached fix is instant; a fresh one can take several seconds.
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS })) ??
      (await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        POSITION_TIMEOUT_MS,
      ));

    const { latitude, longitude } = position.coords;
    return {
      status: "found",
      place: { name: await placeName(latitude, longitude), latitude, longitude },
    };
  } catch {
    return { status: "unavailable", message: "Couldn't find your location." };
  }
}

// Turn coordinates into a human name. Only works on Android/iOS, and can
// fail (offline, rate-limited), so it's optional.
async function placeName(latitude: number, longitude: number): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return address?.city ?? address?.district ?? address?.subregion ?? address?.region ?? "Current location";
  } catch {
    return "Current location";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
