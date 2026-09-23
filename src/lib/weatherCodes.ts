import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ComponentProps } from "react";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type WeatherInfo = {
  label: string;
  icon: IconName;
};

// WMO weather interpretation codes, as used by Open-Meteo.
// https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: { label: "Clear sky", icon: "weather-sunny" },
  1: { label: "Mainly clear", icon: "weather-partly-cloudy" },
  2: { label: "Partly cloudy", icon: "weather-partly-cloudy" },
  3: { label: "Overcast", icon: "weather-cloudy" },
  45: { label: "Fog", icon: "weather-fog" },
  48: { label: "Rime fog", icon: "weather-fog" },
  51: { label: "Light drizzle", icon: "weather-partly-rainy" },
  53: { label: "Drizzle", icon: "weather-rainy" },
  55: { label: "Heavy drizzle", icon: "weather-rainy" },
  56: { label: "Freezing drizzle", icon: "weather-snowy-rainy" },
  57: { label: "Heavy freezing drizzle", icon: "weather-snowy-rainy" },
  61: { label: "Light rain", icon: "weather-rainy" },
  63: { label: "Rain", icon: "weather-rainy" },
  65: { label: "Heavy rain", icon: "weather-pouring" },
  66: { label: "Freezing rain", icon: "weather-snowy-rainy" },
  67: { label: "Heavy freezing rain", icon: "weather-snowy-rainy" },
  71: { label: "Light snow", icon: "weather-snowy" },
  73: { label: "Snow", icon: "weather-snowy" },
  75: { label: "Heavy snow", icon: "weather-snowy-heavy" },
  77: { label: "Snow grains", icon: "weather-snowy" },
  80: { label: "Light showers", icon: "weather-partly-rainy" },
  81: { label: "Showers", icon: "weather-rainy" },
  82: { label: "Violent showers", icon: "weather-pouring" },
  85: { label: "Snow showers", icon: "weather-partly-snowy" },
  86: { label: "Heavy snow showers", icon: "weather-snowy-heavy" },
  95: { label: "Thunderstorm", icon: "weather-lightning" },
  96: { label: "Thunderstorm with hail", icon: "weather-lightning-rainy" },
  99: { label: "Severe thunderstorm with hail", icon: "weather-lightning-rainy" },
};

const UNKNOWN: WeatherInfo = { label: "Unknown", icon: "weather-cloudy-alert" };

// Clear/mostly-clear skies look different at night.
const NIGHT_ICONS: Partial<Record<IconName, IconName>> = {
  "weather-sunny": "weather-night",
  "weather-partly-cloudy": "weather-night-partly-cloudy",
};

export function getWeatherInfo(code: number, isDay = true): WeatherInfo {
  const info = WEATHER_CODES[code] ?? UNKNOWN;
  if (isDay) return info;
  return { ...info, icon: NIGHT_ICONS[info.icon] ?? info.icon };
}

// Every weather icon the app can show, with the conditions it stands for —
// built from the table above so the help pop-up can't drift out of sync.
export function weatherIconLegend(): { icon: IconName; labels: string[] }[] {
  const byIcon = new Map<IconName, string[]>();
  for (const { icon, label } of Object.values(WEATHER_CODES)) {
    byIcon.set(icon, [...(byIcon.get(icon) ?? []), label]);
  }
  for (const [dayIcon, nightIcon] of Object.entries(NIGHT_ICONS)) {
    const dayLabels = byIcon.get(dayIcon as IconName) ?? [];
    byIcon.set(nightIcon, dayLabels.map((label) => `${label} (night)`));
  }
  return [...byIcon].map(([icon, labels]) => ({ icon, labels }));
}
