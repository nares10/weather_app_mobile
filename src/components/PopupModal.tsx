import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// Shared pop-up shell: dimmed backdrop, centred card, title and close
// button. Closes on backdrop tap, the close button, or Android's back.
export function PopupModal({ visible, onClose, title, children }: Props) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Inner Pressable swallows taps so they don't reach the backdrop. */}
        <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
          {children}
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
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});
