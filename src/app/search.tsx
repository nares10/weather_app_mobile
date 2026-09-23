import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MIN_QUERY_LENGTH, useCitySearch } from "@/hooks/useCitySearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useThemeColors } from "@/theme/colors";
import type { CitySearchResult } from "@/types/weather";

const DEBOUNCE_MS = 400;

export default function Search() {
  const colors = useThemeColors();
  const [text, setText] = useState("");
  const query = useDebouncedValue(text.trim(), DEBOUNCE_MS);
  const search = useCitySearch(query);
  const insets = useSafeAreaInsets();

  // Go back to Home, handing it the chosen city as route params.
  // dismissTo pops Search off the stack rather than pushing a new Home.
  const selectCity = (city: CitySearchResult) => {
    router.dismissTo({
      pathname: "/",
      params: {
        name: city.name,
        description: city.description,
        latitude: String(city.latitude),
        longitude: String(city.longitude),
      },
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
        <MaterialCommunityIcons name="magnify" size={22} color={colors.textMuted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search for a city"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="City name"
        />
        {search.isFetching && <ActivityIndicator size="small" color={colors.textMuted} />}
        {text.length > 0 && (
          <Pressable onPress={() => setText("")} accessibilityLabel="Clear search" hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {query.length < MIN_QUERY_LENGTH ? (
        <Message text={`Type at least ${MIN_QUERY_LENGTH} letters to search.`} />
      ) : search.data ? (
        <FlatList
          data={search.data}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyExtractor={(city) => String(city.id)}
          // Let the first tap select a row even while the keyboard is open.
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Message text={`No cities found for “${query}”.`} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectCity(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.cityName, { color: colors.text }]}>{item.name}</Text>
              {item.description !== "" && (
                <Text style={[styles.cityDescription, { color: colors.textMuted }]}>
                  {item.description}
                </Text>
              )}
            </Pressable>
          )}
        />
      ) : search.isError ? (
        <View style={styles.message}>
          <Message text={search.error.message} />
          <Pressable onPress={() => search.refetch()} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.retry, { color: colors.accent }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ActivityIndicator style={styles.spinner} color={colors.accent} />
      )}
    </View>
  );
}

function Message({ text }: { text: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.messageText, { color: colors.textMuted }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  spinner: {
    marginTop: 32,
  },
  message: {
    alignItems: "center",
    gap: 12,
  },
  messageText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 32,
    paddingHorizontal: 32,
  },
  retry: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityName: {
    fontSize: 17,
  },
  cityDescription: {
    fontSize: 14,
    marginTop: 2,
  },
});
