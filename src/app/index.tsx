import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrentWeather } from "@/components/CurrentWeather";
import { DailyList } from "@/components/DailyList";
import { ErrorView } from "@/components/ErrorView";
import { HourlyStrip } from "@/components/HourlyStrip";
import { useForecast } from "@/hooks/useForecast";
import { useThemeColors } from "@/theme/colors";
import type { Forecast } from "@/types/weather";

// Fixed location for milestone 3. Milestone 4 replaces this with GPS.
const LOCATION = { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 };

export default function Home() {
  const colors = useThemeColors();
  const { state, retry } = useForecast(LOCATION.latitude, LOCATION.longitude, LOCATION.name);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      {state.status === "loading" && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
      {state.status === "error" && <ErrorView message={state.message} onRetry={retry} />}
      {state.status === "success" && <ForecastView forecast={state.forecast} />}
    </SafeAreaView>
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
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
