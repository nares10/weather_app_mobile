import { fetchJson } from "@/api/http";

// Replace the real network with a fake `fetch` we control.
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

// A fetch that never answers — until its signal is aborted, like the real one.
function hangingFetch(_url: string, { signal }: { signal: AbortSignal }) {
  return new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("Aborted")));
  });
}

afterEach(() => {
  mockFetch.mockReset();
  jest.useRealTimers();
});

describe("fetchJson", () => {
  it("returns the parsed JSON body", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ hello: "world" }));
    await expect(fetchJson("https://example.test")).resolves.toEqual({ hello: "world" });
  });

  it("uses Open-Meteo's error reason when there is one", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: true, reason: "Latitude must be in range" }, 400));
    await expect(fetchJson("https://example.test")).rejects.toThrow("Latitude must be in range");
  });

  it("falls back to the status code when there's no reason", async () => {
    mockFetch.mockResolvedValue(jsonResponse(null, 503));
    await expect(fetchJson("https://example.test")).rejects.toThrow("Request failed (503)");
  });

  it("turns a network failure into a friendly message", async () => {
    // React Native's fetch throws a TypeError when there's no connection.
    mockFetch.mockRejectedValue(new TypeError("Network request failed"));
    await expect(fetchJson("https://example.test")).rejects.toThrow(
      "Couldn't connect. Check your internet connection.",
    );
  });

  it("gives up after 10 seconds", async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(hangingFetch);

    const result = fetchJson("https://example.test");
    jest.advanceTimersByTime(10_000);

    await expect(result).rejects.toThrow("The server took too long to respond.");
  });

  it("passes the caller's abort through untouched (TanStack Query cancelling)", async () => {
    mockFetch.mockImplementation(hangingFetch);
    const controller = new AbortController();

    const result = fetchJson("https://example.test", controller.signal);
    controller.abort();

    await expect(result).rejects.toThrow("Aborted");
  });
});
