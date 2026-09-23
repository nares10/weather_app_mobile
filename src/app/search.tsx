import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/theme/colors";

// Placeholder so the location fallback has somewhere to go.
// Milestone 5 builds the real search.
export default function Search() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textMuted }]}>
        City search is coming in milestone 5.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
});
