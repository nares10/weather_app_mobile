import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { formatTemperature } from "@/lib/formatting";
import { getWeatherInfo } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";
import type { CurrentConditions } from "@/types/weather";

type Props = {
  locationName: string;
  current: CurrentConditions;
  todayMin: number;
  todayMax: number;
};

export function CurrentWeather({ locationName, current, todayMin, todayMax }: Props) {
  const colors = useThemeColors();
  const { label, icon } = getWeatherInfo(current.weatherCode, current.isDay);

  return (
    <View style={styles.container}>
      <Text style={[styles.location, { color: colors.text }]}>{locationName}</Text>
      <MaterialCommunityIcons name={icon} size={96} color={colors.accent} />
      <Text style={[styles.temperature, { color: colors.text }]}>
        {formatTemperature(current.temperature)}
      </Text>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.detail, { color: colors.textMuted }]}>
        H {formatTemperature(todayMax)} · L {formatTemperature(todayMin)} · Feels like{" "}
        {formatTemperature(current.apparentTemperature)}
      </Text>

      <View style={[styles.stats, { backgroundColor: colors.card }]}>
        <Stat icon="weather-windy" value={`${Math.round(current.windSpeed)} km/h`} title="Wind" />
        <Stat icon="water-percent" value={`${current.humidity}%`} title="Humidity" />
      </View>
    </View>
  );
}

type StatProps = {
  icon: "weather-windy" | "water-percent";
  value: string;
  title: string;
};

function Stat({ icon, value, title }: StatProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.accent} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 28,
    fontWeight: "600",
  },
  temperature: {
    fontSize: 72,
    fontWeight: "200",
  },
  label: {
    fontSize: 20,
  },
  detail: {
    fontSize: 15,
  },
  stats: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-around",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  stat: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statTitle: {
    fontSize: 13,
  },
});
