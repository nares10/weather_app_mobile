import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { queryClient, startAppStateFocusTracking } from "@/lib/queryClient";
import { useResolvedColorScheme } from "@/lib/themePreference";
import { palettes } from "@/theme/colors";

export default function RootLayout() {
  useEffect(startAppStateFocusTracking, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
}

// Separate component so it renders inside QueryClientProvider, where the
// saved theme choice lives. Rendering it also loads that choice at startup.
function Navigation() {
  const scheme = useResolvedColorScheme();
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
      {/* Light text on a dark app and vice versa. */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack>
        {/* Home draws its own title (the city name), so hide the header. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}
