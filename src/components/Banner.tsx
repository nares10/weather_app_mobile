import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { IconName } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";

type Props = {
  icon: IconName;
  message: string;
  // What the button says and does depends on the situation, so the caller
  // decides (e.g. "Turn on location", "Retry").
  action: { label: string; onPress: () => void };
};

// A one-line notice above the weather with an action button, e.g. why
// we're showing Delhi, or that the latest refresh failed.
export function Banner({ icon, message, action }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.banner, { backgroundColor: colors.card }]}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.textMuted} />
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
