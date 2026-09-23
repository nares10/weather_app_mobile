import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { type ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import { Banner } from "@/components/Banner";
import { HelpModal } from "@/components/HelpModal";
import { ThemePickerModal } from "@/components/ThemePickerModal";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useForecast } from "@/hooks/useForecast";
import { useThemeColors } from "@/theme/colors";
import type { Forecast, Place } from "@/types/weather";

// Search sends the chosen city back as route params (strings, since they
// can end up in a URL on web).
type HomeParams = {
  name?: string;
  description?: string;
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

function placeFromParams({ name, description, latitude, longitude }: HomeParams): Place | null {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!name || latitude === undefined || longitude === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { name, description: description ?? "", latitude: lat, longitude: lon };
}

// Shown when we can't get the device location (decision in PLAN.md).
const DEFAULT_PLACE: Place = {
  name: "Delhi",
  description: "India",
  latitude: 28.6139,
  longitude: 77.209,
};

function DeviceLocationWeather() {
  const { state: location, retry, turnOnLocation } = useDeviceLocation();

  switch (location.status) {
    case "locating":
      return <Loading label="Finding your location…" />;
    case "denied":
      return (
        <PlaceWeather
          place={DEFAULT_PLACE}
          banner={
            <Banner
              icon="map-marker-off-outline"
              message={`Location permission is off — showing ${DEFAULT_PLACE.name}.`}
              // Android stops showing the permission dialog after "Don't
              // ask again"; then the only way is the app's settings page.
              action={
                location.canAskAgain
                  ? { label: "Use my location", onPress: retry }
                  : { label: "Open settings", onPress: () => Linking.openSettings() }
              }
            />
          }
        />
      );
    case "unavailable":
      return (
        <PlaceWeather
          place={DEFAULT_PLACE}
          banner={
            <Banner
              icon="map-marker-off-outline"
              message={`${location.message} Showing ${DEFAULT_PLACE.name}.`}
              action={
                location.servicesOff
                  ? { label: "Turn on location", onPress: turnOnLocation }
                  : { label: "Try again", onPress: retry }
              }
            />
          }
        />
      );
    case "found":
      return <PlaceWeather place={location.place} />;
  }
}

// A separate component so useForecast only runs once we have a place —
// hooks can't be called conditionally, but components can be rendered
// conditionally.
type PlaceWeatherProps = {
  place: Place;
  showUseMyLocation?: boolean;
  // Optional notice shown under the toolbar (e.g. why we're showing Delhi).
  banner?: ReactNode;
};

function PlaceWeather({ place, showUseMyLocation = false, banner }: PlaceWeatherProps) {
  const forecast = useForecast(place);

  // Order matters: if a background refresh fails we still have the old
  // data, and showing it beats replacing the screen with an error.
  let body;
  if (forecast.data) {
    body = <ForecastView place={place} forecast={forecast.data} onRefresh={forecast.refetch} />;
  } else if (forecast.isError) {
    body = <ErrorView message={forecast.error.message} onRetry={() => forecast.refetch()} />;
  } else {
    body = <Loading label="Loading weather…" />;
  }

  // A refresh failed but we still have older data: say so, and when it's from.
  const stale = forecast.data !== undefined && forecast.isError;

  return (
    <>
      <Toolbar showUseMyLocation={showUseMyLocation} />
      {banner}
      {stale && (
        <Banner
          icon="cloud-off-outline"
          message={`Couldn't update. Showing weather from ${formatClockTime(forecast.dataUpdatedAt)}.`}
          action={{ label: "Retry", onPress: () => forecast.refetch() }}
        />
      )}
      {body}
    </>
  );
}

function Toolbar({ showUseMyLocation }: { showUseMyLocation: boolean }) {
  const colors = useThemeColors();
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
      <View style={styles.toolbarRight}>
        <IconButton
          icon="information-outline"
          label="Help: what the icons mean"
          onPress={() => setHelpOpen(true)}
          color={colors.text}
        />
        <IconButton
          icon="theme-light-dark"
          label="Change theme"
          onPress={() => setThemePickerOpen(true)}
          color={colors.text}
        />
        <IconButton
          icon="magnify"
          label="Search for a city"
          onPress={() => router.push("/search")}
          color={colors.text}
        />
      </View>
      <ThemePickerModal visible={themePickerOpen} onClose={() => setThemePickerOpen(false)} />
      <HelpModal visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}

type IconButtonProps = {
  icon: "crosshairs-gps" | "magnify" | "theme-light-dark" | "information-outline";
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
  place: Place;
  forecast: Forecast;
  // TanStack Query's refetch: resolves (never rejects) with the new state.
  onRefresh: () => Promise<{ isError: boolean }>;
};

function ForecastView({ place, forecast, onRefresh }: ForecastViewProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const today = forecast.daily[0];

  // Track pull-to-refresh ourselves rather than using the query's
  // isRefetching, so automatic background refreshes (e.g. when the app
  // returns to the foreground) don't show the spinner.
  const [pulling, setPulling] = useState(false);
  const refresh = async () => {
    setPulling(true);
    const result = await onRefresh();
    setPulling(false);
    // A buzz when the refresh finishes, so you can feel it worked (or didn't).
    Haptics.notificationAsync(
      result.isError ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
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
        place={place}
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
  toolbarRight: {
    flexDirection: "row",
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

// When the data was fetched, in the phone's own time: "14:05".
function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
