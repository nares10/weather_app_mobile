import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Appearance, useColorScheme } from "react-native";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "themePreference";
const QUERY_KEY = ["themePreference"];

// Our own colours follow useResolvedColorScheme() below; this also tells
// the OS, so native UI (keyboard, dialogs) matches the chosen theme.
// "unspecified" means "follow the phone's setting".
function applyTheme(preference: ThemePreference) {
  Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
}

async function loadThemePreference(): Promise<ThemePreference> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  const preference: ThemePreference =
    stored === "light" || stored === "dark" ? stored : "system";
  applyTheme(preference);
  return preference;
}

// The saved preference is async data like any other, so it lives in
// TanStack Query: loaded once at startup, then updated in place.
export function useThemePreference() {
  const queryClient = useQueryClient();
  const { data: preference = "system" } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadThemePreference,
    staleTime: Infinity,
  });

  const setPreference = (next: ThemePreference) => {
    applyTheme(next);
    queryClient.setQueryData(QUERY_KEY, next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  return { preference, setPreference };
}

// The scheme the app should actually use: the user's choice, or the
// phone's setting when they chose "System default".
export function useResolvedColorScheme(): "light" | "dark" {
  const system = useColorScheme();
  const { preference } = useThemePreference();
  if (preference !== "system") return preference;
  return system === "dark" ? "dark" : "light";
}
