import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { formatTemperature, formatWeekday } from "@/lib/formatting";
import { getWeatherInfo } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";
import type { DailyForecast } from "@/types/weather";

type Props = {
  days: DailyForecast[];
};

// Only ~7 rows, so a plain map is fine. (A FlatList nested inside the
// screen's ScrollView would trigger a "VirtualizedLists should never be
// nested" warning.)
export function DailyList({ days }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.heading, { color: colors.textMuted }]}>7-day forecast</Text>
      {days.map((day, index) => (
        <View
          key={day.date}
          style={[
            styles.row,
            index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
          ]}
        >
          <Text style={[styles.weekday, { color: colors.text }]}>
            {index === 0 ? "Today" : formatWeekday(day.date)}
          </Text>
          <View style={styles.condition}>
            <MaterialCommunityIcons
              name={getWeatherInfo(day.weatherCode).icon}
              size={24}
              color={colors.accent}
            />
            <Text style={[styles.rain, { color: colors.accent }]}>
              {day.precipitationProbability >= 20 ? `${day.precipitationProbability}%` : ""}
            </Text>
          </View>
          <Text style={[styles.min, { color: colors.textMuted }]}>
            {formatTemperature(day.minTemperature)}
          </Text>
          <Text style={[styles.max, { color: colors.text }]}>
            {formatTemperature(day.maxTemperature)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  weekday: {
    flex: 1,
    fontSize: 16,
  },
  condition: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rain: {
    fontSize: 13,
    fontWeight: "600",
  },
  min: {
    width: 44,
    textAlign: "right",
    fontSize: 16,
  },
  max: {
    width: 44,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "600",
  },
});
