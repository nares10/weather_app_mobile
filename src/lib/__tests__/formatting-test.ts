import { formatHour, formatTemperature, formatWeekday } from "@/lib/formatting";

describe("formatTemperature", () => {
  it("rounds to a whole degree", () => {
    expect(formatTemperature(31.4)).toBe("31°");
    expect(formatTemperature(31.5)).toBe("32°");
    expect(formatTemperature(-2.6)).toBe("-3°");
  });

  it("shows 0° rather than -0° for small negatives", () => {
    expect(formatTemperature(-0.4)).toBe("0°");
  });
});

describe("formatHour", () => {
  it("takes the HH:MM part of an Open-Meteo local time", () => {
    expect(formatHour("2026-09-23T14:00")).toBe("14:00");
    expect(formatHour("2026-09-24T00:00")).toBe("00:00");
  });
});

describe("formatWeekday", () => {
  it("names the day of the week", () => {
    expect(formatWeekday("2026-09-23")).toBe("Wed");
    expect(formatWeekday("2026-09-27")).toBe("Sun");
  });

  // Tests run in New York time (see jest.globalSetup.js). Reading
  // "2026-09-23" as UTC midnight and then asking for the *local* weekday
  // would give Tuesday there — the bug formatWeekday avoids.
  it("isn't shifted by the device timezone", () => {
    expect(new Date().getTimezoneOffset()).toBeGreaterThan(0); // really not on UTC
    expect(formatWeekday("2026-09-23")).toBe("Wed");
  });
});
