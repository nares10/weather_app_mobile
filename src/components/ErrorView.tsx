import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";

type Props = {
  message: string;
  onRetry: () => void;
};

// Full-screen "couldn't load the weather" state.
export function ErrorView({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="weather-cloudy-alert"
        title="Couldn't load the weather"
        message={message}
        action={{ label: "Retry", onPress: onRetry }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
