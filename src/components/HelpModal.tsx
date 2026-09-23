import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PopupModal } from "@/components/PopupModal";
import { type IconName, weatherIconLegend } from "@/lib/weatherCodes";
import { useThemeColors } from "@/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type LegendItem = { icon: IconName; text: string };

const DETAILS: LegendItem[] = [
  { icon: "weather-windy", text: "Wind speed" },
  { icon: "water-percent", text: "Humidity — how much moisture is in the air" },
  { icon: "water", text: "Blue % in the 7-day list — chance of rain that day" },
  { icon: "map-marker-off-outline", text: "Location is off, so a default city is shown" },
];

// Pop-up explaining what every icon in the app means.
export function HelpModal({ visible, onClose }: Props) {
  const weather = weatherIconLegend().map(({ icon, labels }) => ({ icon, text: labels.join(", ") }));

  return (
    <PopupModal visible={visible} onClose={onClose} title="What the icons mean">
      {/* flexShrink lets the list shrink to fit the card's maxHeight;
          without it the ScrollView grows to its full content height and
          there's nothing left to scroll. */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Section title="Weather" items={weather} />
        <Section title="Details" items={DETAILS} />
        <HelpTip text="Pull down on the weather to refresh it." />
      </ScrollView>
    </PopupModal>
  );
}

function Section({ title, items }: { title: string; items: LegendItem[] }) {
  const colors = useThemeColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {items.map((item) => (
        <View key={item.icon} style={styles.row}>
          <MaterialCommunityIcons name={item.icon} size={24} color={colors.accent} />
          <Text style={[styles.rowText, { color: colors.text }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

function HelpTip({ text }: { text: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.tip, { color: colors.textMuted }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: 16,
    paddingBottom: 4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
  },
  tip: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
