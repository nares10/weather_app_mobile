import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // One retry is enough for a weather app; the user can always retry.
      retry: 1,
    },
  },
});

// On the web, TanStack Query knows when the tab regains focus. On a phone
// we tell it: "focused" = the app is in the foreground. Stale queries on
// screen then refetch when you come back to the app.
// https://tanstack.com/query/latest/docs/framework/react/react-native
export function startAppStateFocusTracking() {
  const subscription = AppState.addEventListener("change", (status) => {
    if (Platform.OS !== "web") focusManager.setFocused(status === "active");
  });
  return () => subscription.remove();
}
