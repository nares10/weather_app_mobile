import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

// Search sends the chosen city back as route params (strings, since they
// can end up in a URL on web).
type HomeParams = {
  name?: string;
  latitude?: string;
  longitude?: string;
};

export default function Home() {
  const colors = useThemeColors();
  const searchedPlace = placeFromParams(useLocalSearchParams<HomeParams>());

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      {searchedPlace ? (
        <PlaceWeather place={searchedPlace} showUseMyLocation />
      ) : (
        <DeviceLocationWeather />
      )}
    </SafeAreaView>
  );
}

function placeFromParams({ name, latitude, longitude }: HomeParams): Place | null {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!name || latitude === undefined || longitude === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { name, latitude: lat, longitude: lon };
}

// Module-level, so it survives this component unmounting and remounting
// (e.g. after choosing a city and then tapping "use my location").
// We only want to push the user to Search automatically once per app launch.
let autoOpenedSearch = false;

function DeviceLocationWeather() {
  const { state: location, retry } = useDeviceLocation();

  // Decision from PLAN.md: if we can't get a location, open Search.
  const noLocation = location.status === "denied" || location.status === "unavailable";
  useEffect(() => {
    if (noLocation && !autoOpenedSearch) {
      autoOpenedSearch = true;
      router.push("/search");
    }
  }, [noLocation]);

  switch (location.status) {
    case "locating":
      return <Loading label="Finding your location…" />;
    case "denied":
      return (
        <LocationFallback
          message="Location permission is off, so we can't show the weather where you are."
          onRetry={location.canAskAgain ? retry : undefined}
        />
      );
    case "unavailable":
      return <LocationFallback message={location.message} onRetry={retry} />;
    case "found":
      return <PlaceWeather place={location.place} />;
  }
}

// A separate component so useForecast only runs once we have a place —
// hooks can't be called conditionally, but components can be rendered
// conditionally.
function PlaceWeather({ place, showUseMyLocation = false }: { place: Place; showUseMyLocation?: boolean }) {
  const { state, retry } = useForecast(place.latitude, place.longitude, place.name);

  return (
    <>
      <Toolbar showUseMyLocation={showUseMyLocation} />
      {state.status === "loading" && <Loading label="Loading weather…" />}
      {state.status === "error" && <ErrorView message={state.message} onRetry={retry} />}
      {state.status === "success" && <ForecastView forecast={state.forecast} />}
    </>
  );
}

function Toolbar({ showUseMyLocation }: { showUseMyLocation: boolean }) {
  const colors = useThemeColors();

  return (
    <View style={styles.toolbar}>
      {showUseMyLocation ? (
        <IconButton
          icon="crosshairs-gps"
          label="Use my location"
          // Replacing Home with a param-less Home switches back to GPS.
          onPress={() => router.replace("/")}
          color={colors.text}
        />
      ) : (
        <View />
      )}
      <IconButton
        icon="magnify"
        label="Search for a city"
        onPress={() => router.push("/search")}
        color={colors.text}
      />
    </View>
  );
}

type IconButtonProps = {
  icon: "crosshairs-gps" | "magnify";
  label: string;
  onPress: () => void;
  color: string;
};

function IconButton({ icon, label, onPress, color }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.5 : 1 }]}
    >
      <MaterialCommunityIcons name={icon} size={26} color={color} />
    </Pressable>
  );
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
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  iconButton: {
    padding: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
});
