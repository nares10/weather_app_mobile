// The app's own weather shapes. The API layer (milestone 3) will convert
// Open-Meteo responses into these, so components never see raw API data.
//
// Times are local to the forecast location, formatted like Open-Meteo
// returns them with `timezone=auto`: "2026-09-23T14:00" (no offset).

export type CurrentConditions = {
  time: string;
  temperature: number; // °C
  apparentTemperature: number; // °C, "feels like"
  weatherCode: number; // WMO code
  isDay: boolean;
  windSpeed: number; // km/h
  humidity: number; // %
};

export type HourlyForecast = {
  time: string;
  temperature: number;
  weatherCode: number;
  isDay: boolean;
};

export type DailyForecast = {
  date: string; // "2026-09-23"
  minTemperature: number;
  maxTemperature: number;
  weatherCode: number;
  precipitationProbability: number; // %
};

export type Forecast = {
  locationName: string;
  current: CurrentConditions;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};
