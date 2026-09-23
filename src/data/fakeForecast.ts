import type { Forecast } from "@/types/weather";

// Hard-coded data for milestone 2. Milestone 3 replaces this with a real
// Open-Meteo fetch that returns the same `Forecast` shape.
export const fakeForecast: Forecast = {
  locationName: "Jaipur",
  current: {
    time: "2026-09-23T14:00",
    temperature: 31.4,
    apparentTemperature: 33.9,
    weatherCode: 2,
    isDay: true,
    windSpeed: 12.6,
    humidity: 48,
  },
  hourly: [
    { time: "2026-09-23T14:00", temperature: 31.4, weatherCode: 2, isDay: true },
    { time: "2026-09-23T15:00", temperature: 31.9, weatherCode: 2, isDay: true },
    { time: "2026-09-23T16:00", temperature: 31.2, weatherCode: 3, isDay: true },
    { time: "2026-09-23T17:00", temperature: 30.1, weatherCode: 80, isDay: true },
    { time: "2026-09-23T18:00", temperature: 28.6, weatherCode: 61, isDay: true },
    { time: "2026-09-23T19:00", temperature: 27.3, weatherCode: 3, isDay: false },
    { time: "2026-09-23T20:00", temperature: 26.5, weatherCode: 2, isDay: false },
    { time: "2026-09-23T21:00", temperature: 25.8, weatherCode: 1, isDay: false },
    { time: "2026-09-23T22:00", temperature: 25.2, weatherCode: 0, isDay: false },
    { time: "2026-09-23T23:00", temperature: 24.7, weatherCode: 0, isDay: false },
    { time: "2026-09-24T00:00", temperature: 24.3, weatherCode: 0, isDay: false },
    { time: "2026-09-24T01:00", temperature: 23.9, weatherCode: 1, isDay: false },
  ],
  daily: [
    { date: "2026-09-23", minTemperature: 23.5, maxTemperature: 32.1, weatherCode: 80, precipitationProbability: 40 },
    { date: "2026-09-24", minTemperature: 23.1, maxTemperature: 33.0, weatherCode: 1, precipitationProbability: 5 },
    { date: "2026-09-25", minTemperature: 24.0, maxTemperature: 34.2, weatherCode: 0, precipitationProbability: 0 },
    { date: "2026-09-26", minTemperature: 24.4, maxTemperature: 33.6, weatherCode: 2, precipitationProbability: 10 },
    { date: "2026-09-27", minTemperature: 23.8, maxTemperature: 30.5, weatherCode: 63, precipitationProbability: 70 },
    { date: "2026-09-28", minTemperature: 22.9, maxTemperature: 29.4, weatherCode: 95, precipitationProbability: 80 },
    { date: "2026-09-29", minTemperature: 22.6, maxTemperature: 31.0, weatherCode: 3, precipitationProbability: 20 },
  ],
};
