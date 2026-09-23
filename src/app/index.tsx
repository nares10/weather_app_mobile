import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrentWeather } from "@/components/CurrentWeather";
import { DailyList } from "@/components/DailyList";
import { ErrorView } from "@/components/ErrorView";
import { HourlyStrip } from "@/components/HourlyStrip";
import { LocationFallback } from "@/components/LocationFallback";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useForecast } from "@/hooks/useForecast";
import { useThemeColors } from "@/theme/colors";
import type { Forecast, Place } from "@/types/weather";

export default function Home() {
  const colors = useThemeColors();
  const { state: location, retry: retryLocation } = useDeviceLocation();

  // Decision from PLAN.md: if we can't get a location, open Search.
  // Only do it once — if the user comes back, show the fallback screen
  // rather than bouncing them to Search again.
  const openedSearch = useRef(false);
  const noLocation = location.status === "denied" || location.status === "unavailable";
  useEffect(() => {
    if (noLocation && !openedSearch.current) {
      openedSearch.current = true;
      router.push("/search");
    }
  }, [noLocation]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      {location.status === "locating" && <Loading label="Finding your location…" />}
      {location.status === "denied" && (
        <LocationFallback
          message="Location permission is off, so we can't show the weather where you are."
          onRetry={location.canAskAgain ? retryLocation : undefined}
        />
      )}
      {location.status === "unavailable" && (
        <LocationFallback message={location.message} onRetry={retryLocation} />
      )}
      {location.status === "found" && <PlaceWeather place={location.place} />}
    </SafeAreaView>
  );
}

// A separate component so useForecast only runs once we have a place —
// hooks can't be called conditionally, but components can be rendered
// conditionally.
function PlaceWeather({ place }: { place: Place }) {
  const { state, retry } = useForecast(place.latitude, place.longitude, place.name);

  if (state.status === "loading") return <Loading label="Loading weather…" />;
  if (state.status === "error") return <ErrorView message={state.message} onRetry={retry} />;
  return <ForecastView forecast={state.forecast} />;
}

function Loading({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

function ForecastView({ forecast }: { forecast: Forecast }) {
  const today = forecast.daily[0];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CurrentWeather
        locationName={forecast.locationName}
        current={forecast.current}
        todayMin={today.minTemperature}
        todayMax={today.maxTemperature}
      />
      <HourlyStrip hours={forecast.hourly} />
      <DailyList days={forecast.daily} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
