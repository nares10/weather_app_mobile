import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";

import { formatAddress } from "@/lib/address";
import type { Place } from "@/types/weather";

export type DeviceLocationState =
  | { status: "locating" }
  // canAskAgain = false means Android won't show the permission dialog any
  // more ("Don't ask again"); the user has to enable it in Settings.
  | { status: "denied"; canAskAgain: boolean }
  // servicesOff = the phone's location switch is off (vs. some other failure).
  | { status: "unavailable"; servicesOff: boolean; message: string }
  | { status: "found"; place: Place };

type SettledResult = Exclude<DeviceLocationState, { status: "locating" }>;

const POSITION_TIMEOUT_MS = 15_000;
// A last-known fix up to 10 minutes old is good enough for weather.
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;

export function useDeviceLocation() {
  const query = useQuery({
    queryKey: ["deviceLocation"],
    queryFn: findDeviceLocation, // never throws — failures are results
    retry: false,
    // A position is good until the user asks again...
    staleTime: Infinity,
    // ...but if the user had to fix something outside the app (turn on
    // location, or grant permission in Settings), check again when the app
    // returns to the foreground. Not when the permission dialog could still
    // appear — that would pop it up every time the app is reopened.
    refetchOnWindowFocus: (q) => {
      const data = q.state.data;
      return data?.status === "unavailable" || (data?.status === "denied" && !data.canAskAgain);
    },
  });

  // Show "locating" on the first attempt and on manual retries of a failed
  // attempt; a background re-check of a found location stays invisible.
  const state: DeviceLocationState =
    !query.data || (query.isFetching && query.data.status !== "found")
      ? { status: "locating" }
      : query.data;

  const retry = () => query.refetch();

  // Shows Android's "Turn on location?" dialog, then tries again.
  // Rejects if the user taps "No thanks" — then there's nothing to retry.
  const turnOnLocation = async () => {
    try {
      await Location.enableNetworkProviderAsync();
    } catch {
      return;
    }
    retry();
  };

  return { state, retry, turnOnLocation };
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
      return { status: "unavailable", servicesOff: true, message: "Location is turned off." };
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
      place: { ...(await describePlace(latitude, longitude)), latitude, longitude },
    };
  } catch {
    return { status: "unavailable", servicesOff: false, message: "Couldn't find your location." };
  }
}

// Turn coordinates into a name + address line, e.g.
// { name: "Jaipur", description: "Malviya Nagar, Rajasthan, India" }.
// Reverse geocoding only works on Android/iOS and can fail (offline,
// rate-limited), so it's optional.
async function describePlace(
  latitude: number,
  longitude: number,
): Promise<{ name: string; description: string }> {
  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!address) throw new Error("No address");

    const name = address.city ?? address.district ?? address.subregion ?? address.region;
    if (!name) throw new Error("No name");

    // Neighbourhood, state, country.
    return { name, description: formatAddress(name, [address.district, address.region, address.country]) };
  } catch {
    return { name: "Current location", description: "" };
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}
