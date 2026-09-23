import { type OpenMeteoResponse, parseForecast } from "@/api/openMeteo";

// Build a response shaped like the real API: hourly data from midnight
// for `hourCount` hours, 7 days of daily data.
function makeResponse(currentTime: string, hourCount = 48): OpenMeteoResponse {
  const hours = Array.from({ length: hourCount }, (_, i) => {
    const day = 23 + Math.floor(i / 24);
    const hour = String(i % 24).padStart(2, "0");
    return `2026-09-${day}T${hour}:00`;
  });

  return {
    current: {
      time: currentTime,
      temperature_2m: 29.6,
      apparent_temperature: 31.3,
      relative_humidity_2m: 51,
      is_day: 0,
      weather_code: 0,
      wind_speed_10m: 9.2,
    },
    hourly: {
      time: hours,
      temperature_2m: hours.map((_, i) => 20 + i / 10),
      weather_code: hours.map(() => 1),
      is_day: hours.map((_, i) => (i % 24 >= 6 && i % 24 < 18 ? 1 : 0)),
    },
    daily: {
      time: ["2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27", "2026-09-28", "2026-09-29"],
      weather_code: [2, 1, 1, 3, 61, 95, 0],
      temperature_2m_max: [37, 34.9, 33.2, 33, 30, 29, 31],
      temperature_2m_min: [25, 24.6, 23.2, 24, 23, 22, 22],
      precipitation_probability_max: [0, 5, null, 10, 70, 80, 20],
    },
  };
}

describe("parseForecast", () => {
  it("maps the current conditions", () => {
    const { current } = parseForecast(makeResponse("2026-09-23T21:15"));
    expect(current).toEqual({
      time: "2026-09-23T21:15",
      temperature: 29.6,
      apparentTemperature: 31.3,
      weatherCode: 0,
      isDay: false,
      windSpeed: 9.2,
      humidity: 51,
    });
  });

  it("starts the hourly list at the current hour, not midnight", () => {
    const { hourly } = parseForecast(makeResponse("2026-09-23T21:15"));
    expect(hourly[0].time).toBe("2026-09-23T21:00");
    expect(hourly[3].time).toBe("2026-09-24T00:00");
  });

  it("starts at the current hour when the time is exactly on the hour", () => {
    const { hourly } = parseForecast(makeResponse("2026-09-23T09:00"));
    expect(hourly[0].time).toBe("2026-09-23T09:00");
  });

  it("returns the next 24 hours", () => {
    const { hourly } = parseForecast(makeResponse("2026-09-23T21:15"));
    expect(hourly).toHaveLength(24);
    expect(hourly[23].time).toBe("2026-09-24T20:00");
  });

  it("returns fewer hours when the data runs out", () => {
    const { hourly } = parseForecast(makeResponse("2026-09-24T22:30"));
    expect(hourly.map((hour) => hour.time)).toEqual(["2026-09-24T22:00", "2026-09-24T23:00"]);
  });

  it("keeps each hour's values together (parallel arrays → objects)", () => {
    const { hourly } = parseForecast(makeResponse("2026-09-23T21:15"));
    // Index 21 in the raw arrays: 20 + 21/10 = 22.1°, night.
    expect(hourly[0]).toEqual({ time: "2026-09-23T21:00", temperature: 22.1, weatherCode: 1, isDay: false });
    // 2026-09-24T08:00 is index 32: day.
    expect(hourly.find((hour) => hour.time === "2026-09-24T08:00")?.isDay).toBe(true);
  });

  it("maps the 7 daily forecasts", () => {
    const { daily } = parseForecast(makeResponse("2026-09-23T21:15"));
    expect(daily).toHaveLength(7);
    expect(daily[0]).toEqual({
      date: "2026-09-23",
      minTemperature: 25,
      maxTemperature: 37,
      weatherCode: 2,
      precipitationProbability: 0,
    });
  });

  it("treats a missing rain chance as 0%", () => {
    const { daily } = parseForecast(makeResponse("2026-09-23T21:15"));
    expect(daily[2].precipitationProbability).toBe(0);
  });
});
