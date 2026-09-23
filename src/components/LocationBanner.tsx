import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/theme/colors";

type Props = {
  message: string;
  // Omit to show "Open settings" instead — used when Android will no
  // longer show the permission dialog.
  onRetry?: () => void;
};

// Shown above the default city's weather when we couldn't get the
// device location, explaining why and offering a way to fix it.
export function LocationBanner({ message, onRetry }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.card }]}>
      <MaterialCommunityIcons name="map-marker-off-outline" size={22} color={colors.textMuted} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <Pressable
        onPress={onRetry ?? (() => Linking.openSettings())}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <Text style={[styles.action, { color: colors.accent }]}>
          {onRetry ? "Use my location" : "Open settings"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  action: {
    fontSize: 14,
    fontWeight: "600",
  },
});
