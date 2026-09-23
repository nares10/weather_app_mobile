import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        {/* Home draws its own title (the city name), so hide the header. */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
