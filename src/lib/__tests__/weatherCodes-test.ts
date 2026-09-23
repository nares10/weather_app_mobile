import { getWeatherInfo, weatherIconLegend } from "@/lib/weatherCodes";

describe("getWeatherInfo", () => {
  it("maps a WMO code to a label and icon", () => {
    expect(getWeatherInfo(0)).toEqual({ label: "Clear sky", icon: "weather-sunny" });
    expect(getWeatherInfo(95)).toEqual({ label: "Thunderstorm", icon: "weather-lightning" });
  });

  it("uses night icons for clear and partly cloudy skies at night", () => {
    expect(getWeatherInfo(0, false).icon).toBe("weather-night");
    expect(getWeatherInfo(2, false).icon).toBe("weather-night-partly-cloudy");
  });

  it("keeps the label at night", () => {
    expect(getWeatherInfo(0, false).label).toBe("Clear sky");
  });

  it("keeps day icons at night for weather that looks the same (rain)", () => {
    expect(getWeatherInfo(61, false).icon).toBe(getWeatherInfo(61, true).icon);
  });

  it("falls back to 'Unknown' for codes not in the table", () => {
    expect(getWeatherInfo(42)).toEqual({ label: "Unknown", icon: "weather-cloudy-alert" });
  });
});

describe("weatherIconLegend", () => {
  const legend = weatherIconLegend();

  it("lists each icon once", () => {
    const icons = legend.map((entry) => entry.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("groups conditions that share an icon", () => {
    const fog = legend.find((entry) => entry.icon === "weather-fog");
    expect(fog?.labels).toEqual(["Fog", "Rime fog"]);
  });

  it("includes the night icons", () => {
    const night = legend.find((entry) => entry.icon === "weather-night");
    expect(night?.labels).toEqual(["Clear sky (night)"]);
  });

  it("covers every icon getWeatherInfo can return for known codes", () => {
    const icons = new Set(legend.map((entry) => entry.icon));
    const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
    for (const code of codes) {
      expect(icons).toContain(getWeatherInfo(code, true).icon);
      expect(icons).toContain(getWeatherInfo(code, false).icon);
    }
  });
});
