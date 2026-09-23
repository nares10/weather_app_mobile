import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CurrentWeather } from "@/components/CurrentWeather";
import { DailyList } from "@/components/DailyList";
import { HourlyStrip } from "@/components/HourlyStrip";
import { fakeForecast } from "@/data/fakeForecast";
import { useThemeColors } from "@/theme/colors";

export default function Home() {
  const colors = useThemeColors();
  const forecast = fakeForecast;
  const today = forecast.daily[0];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
