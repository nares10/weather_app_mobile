import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/theme/colors";

type Props = {
  message: string;
  // Shown as the secondary button. Omit to show "Open settings" instead —
  // used when Android will no longer show the permission dialog.
  onRetry?: () => void;
};

export function LocationFallback({ message, onRetry }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="map-marker-off-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/search")}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.primaryText}>Search for a city</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onRetry ?? (() => Linking.openSettings())}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Text style={[styles.secondaryText, { color: colors.accent }]}>
          {onRetry ? "Use my location" : "Open settings"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
