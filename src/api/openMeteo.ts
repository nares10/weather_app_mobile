import type { Forecast } from "@/types/weather";

import { fetchJson } from "./http";

// Open-Meteo forecast API — free, no key. Docs: https://open-meteo.com/en/docs
const BASE_URL = "https://api.open-meteo.com/v1/forecast";

const HOURS_TO_SHOW = 24;

// The raw response, limited to the fields we request below. Open-Meteo
// returns hourly/daily data as parallel arrays: hourly.time[i] goes with
// hourly.temperature_2m[i], and so on.
type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: 0 | 1;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: (0 | 1)[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
};

export async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto", // times come back in the location's local time
    forecast_days: "7",
  });

  const data = await fetchJson<OpenMeteoResponse>(`${BASE_URL}?${params}`, signal);
  return parseForecast(data);
}

// Pure function: raw API data in, app `Forecast` out. Kept separate from
// the fetch so it can be unit-tested without the network (milestone 7).
export function parseForecast(data: OpenMeteoResponse): Forecast {
  const { current, hourly, daily } = data;

  // Hourly data starts at midnight today. Skip to the current hour:
  // "2026-09-23T21:15" -> "2026-09-23T21:00".
  const currentHour = `${current.time.slice(0, 13)}:00`;
  const startIndex = Math.max(
    0,
    hourly.time.findIndex((time) => time >= currentHour),
  );

  return {
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
    },
    hourly: hourly.time.slice(startIndex, startIndex + HOURS_TO_SHOW).map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[startIndex + i],
      weatherCode: hourly.weather_code[startIndex + i],
      isDay: hourly.is_day[startIndex + i] === 1,
    })),
    daily: daily.time.map((date, i) => ({
      date,
      minTemperature: daily.temperature_2m_min[i],
      maxTemperature: daily.temperature_2m_max[i],
      weatherCode: daily.weather_code[i],
      precipitationProbability: daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}
