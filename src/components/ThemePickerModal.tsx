import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { Modal, Pressable, StyleSheet, Text } from "react-native";

import { type ThemePreference, useThemePreference } from "@/lib/themePreference";
import { useThemeColors } from "@/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: "theme-light-dark" | "white-balance-sunny" | "weather-night";
}[] = [
  { value: "system", label: "System default", icon: "theme-light-dark" },
  { value: "light", label: "Light", icon: "white-balance-sunny" },
  { value: "dark", label: "Dark", icon: "weather-night" },
];

// A small pop-up asking which theme to use.
export function ThemePickerModal({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const { preference, setPreference } = useThemePreference();

  const choose = (value: ThemePreference) => {
    Haptics.selectionAsync().catch(() => {});
    setPreference(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android back button closes the pop-up.
      onRequestClose={onClose}
    >
      {/* Tapping the dimmed backdrop closes it too. */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Inner Pressable swallows taps so they don't reach the backdrop. */}
        <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={() => {}}>
          <Text style={[styles.title, { color: colors.text }]}>Choose theme</Text>
          {OPTIONS.map((option) => {
            const selected = option.value === preference;
            return (
              <Pressable
                key={option.value}
                onPress={() => choose(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: selected ? colors.accent : colors.border, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <MaterialCommunityIcons name={option.icon} size={22} color={colors.accent} />
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={22}
                  color={selected ? colors.accent : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
  },
});
