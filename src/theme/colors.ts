import { useColorScheme } from "react-native";

const light = {
  background: "#EAF4FF",
  card: "#FFFFFF",
  text: "#10233A",
  textMuted: "#5B6B7F",
  accent: "#208AEF",
  border: "#D5E3F2",
};

const dark: typeof light = {
  background: "#0B1522",
  card: "#16243A",
  text: "#F1F6FC",
  textMuted: "#93A4BA",
  accent: "#5AB0FF",
  border: "#24354D",
};

export type ThemeColors = typeof light;

export function useThemeColors(): ThemeColors {
  return useColorScheme() === "dark" ? dark : light;
}
