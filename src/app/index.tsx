import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const forecast = useForecast(place);

  // Order matters: if a background refresh fails we still have the old
  // data, and showing it beats replacing the screen with an error.
  let body;
  if (forecast.data) {
    body = <ForecastView forecast={forecast.data} onRefresh={forecast.refetch} />;
  } else if (forecast.isError) {
    body = <ErrorView message={forecast.error.message} onRetry={() => forecast.refetch()} />;
  } else {
    body = <Loading label="Loading weather…" />;
  }

  return (
    <>
      <Toolbar showUseMyLocation={showUseMyLocation} />
      {body}
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

type ForecastViewProps = {
  forecast: Forecast;
  onRefresh: () => Promise<unknown>;
};

function ForecastView({ forecast, onRefresh }: ForecastViewProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const today = forecast.daily[0];

  // Track pull-to-refresh ourselves rather than using the query's
  // isRefetching, so automatic background refreshes (e.g. when the app
  // returns to the foreground) don't show the spinner.
  const [pulling, setPulling] = useState(false);
  const refresh = async () => {
    setPulling(true);
    await onRefresh();
    setPulling(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          onRefresh={refresh}
          tintColor={colors.accent} // iOS
          colors={[colors.accent]} // Android
        />
      }
    >
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
