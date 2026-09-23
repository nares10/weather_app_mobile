import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { formatHour, formatTemperature } from "@/lib/formatting";
import { getWeatherInfo } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";
import type { HourlyForecast } from "@/types/weather";

type Props = {
  hours: HourlyForecast[];
};

export function HourlyStrip({ hours }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.heading, { color: colors.textMuted }]}>Hourly</Text>
      <FlatList
        horizontal
        data={hours}
        keyExtractor={(hour) => hour.time}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.hour}>
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {index === 0 ? "Now" : formatHour(item.time)}
            </Text>
            <MaterialCommunityIcons
              name={getWeatherInfo(item.weatherCode, item.isDay).icon}
              size={28}
              color={colors.accent}
            />
            <Text style={[styles.temperature, { color: colors.text }]}>
              {formatTemperature(item.temperature)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 8,
  },
  hour: {
    alignItems: "center",
    gap: 6,
    width: 60,
  },
  time: {
    fontSize: 13,
  },
  temperature: {
    fontSize: 16,
    fontWeight: "600",
  },
});
