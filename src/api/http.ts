// Shared fetch wrapper for our JSON APIs: adds a timeout (React Native's
// fetch never gives up on its own) and turns low-level failures into
// messages we can show on screen.

const TIMEOUT_MS = 10_000;

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  // Our own controller, aborted either by the timeout or by the caller's
  // signal (TanStack Query aborts it when a query is no longer needed).
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener("abort", onCallerAbort);

  try {
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (timedOut) throw new Error("The server took too long to respond.");
      // React Native's fetch throws a TypeError when there's no connection.
      if (error instanceof TypeError) throw new Error("Couldn't connect. Check your internet connection.");
      throw error; // e.g. the caller aborted — TanStack Query handles that itself
    }

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      // Open-Meteo explains errors as { error: true, reason: "..." }.
      const reason = (body as { reason?: string } | null)?.reason;
      throw new Error(reason ?? `Request failed (${response.status})`);
    }
    return body as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);
  }
}
