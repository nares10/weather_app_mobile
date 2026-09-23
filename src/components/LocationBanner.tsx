import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/theme/colors";

type Props = {
  message: string;
  // What the button says and does depends on *why* there's no location
  // (permission denied, location switched off, ...), so the caller decides.
  action: { label: string; onPress: () => void };
};

// Shown above the default city's weather when we couldn't get the
// device location, explaining why and offering a way to fix it.
export function LocationBanner({ message, action }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.card }]}>
      <MaterialCommunityIcons name="map-marker-off-outline" size={22} color={colors.textMuted} />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      <Pressable
        onPress={action.onPress}
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <Text style={[styles.action, { color: colors.accent }]}>{action.label}</Text>
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
