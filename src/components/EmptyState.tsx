import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { IconName } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

// A centred icon + title (+ message, + button) for screens with nothing
// to show yet: errors, no search results, "start typing".
export function EmptyState({ icon, title, message, action }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={56} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>}
      {action && (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
