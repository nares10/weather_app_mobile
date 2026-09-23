import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
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

import { EmptyState } from "@/components/EmptyState";
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
    // A short vibration confirms the pick. Fire-and-forget: if the device
    // can't vibrate (or haptics are off), just carry on.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
        <EmptyState
          icon="map-search-outline"
          title="Find a city"
          message={`Type at least ${MIN_QUERY_LENGTH} letters of a city's name.`}
        />
      ) : search.data ? (
        <FlatList
          data={search.data}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          keyExtractor={(city) => String(city.id)}
          // Let the first tap select a row even while the keyboard is open.
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              icon="map-marker-question-outline"
              title={`No cities found for “${query}”`}
              message="Check the spelling, or try a nearby bigger city."
            />
          }
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
        <EmptyState
          icon="cloud-off-outline"
          title="Couldn't search right now"
          message={search.error.message}
          action={{ label: "Retry", onPress: () => search.refetch() }}
        />
      ) : (
        <ActivityIndicator style={styles.spinner} color={colors.accent} />
      )}
    </View>
  );
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
