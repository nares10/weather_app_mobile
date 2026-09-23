import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { palettes } from "@/theme/colors";

export default function RootLayout() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const colors = palettes[scheme];

  // Navigation (headers, screen backgrounds) has its own theme; feed it
  // our palette so headers match the app in light and dark mode.
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="auto" />
      <Stack>
        {/* Home draws its own title (the city name), so hide the header. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}
