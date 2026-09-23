import { searchCities } from "@/api/geocoding";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

afterEach(() => mockFetch.mockReset());

describe("searchCities", () => {
  it("sends the query to the geocoding API", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ results: [] }));
    await searchCities("New York");

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe("https://geocoding-api.open-meteo.com/v1/search");
    expect(url.searchParams.get("name")).toBe("New York");
  });

  it("maps results, building the address line", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 1269515,
            name: "Jaipur",
            latitude: 26.91962,
            longitude: 75.78781,
            country: "India",
            admin1: "Rajasthan",
            admin2: "Jaipur district",
          },
        ],
      }),
    );

    await expect(searchCities("Jaipur")).resolves.toEqual([
      {
        id: 1269515,
        name: "Jaipur",
        latitude: 26.91962,
        longitude: 75.78781,
        description: "Rajasthan, India",
      },
    ]);
  });

  // The API leaves out `results` entirely (not an empty array) on no match.
  it("returns an empty list when nothing matches", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ generationtime_ms: 0.49 }));
    await expect(searchCities("zzzqqq")).resolves.toEqual([]);
  });
});
