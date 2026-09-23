# Weather App — Plan

A React Native weather app built to learn. Learning comes first, polish second.

## Decisions

| Area | Decision |
| --- | --- |
| Toolchain | Expo (SDK 57), TypeScript, Expo Router |
| Test device | Physical Android phone via Expo Go (+ emulator if available) |
| Data | [Open-Meteo](https://open-meteo.com/) forecast + geocoding APIs (free, no API key) |
| Screens | Two routes: Home (`src/app/index.tsx`) and Search (`src/app/search.tsx`). Search returns the chosen city via `router.dismissTo("/", params)`; Home reads `name/latitude/longitude` params, falling back to GPS when absent. |
| Fetching | Hand-rolled `fetch` + `useState`/`useEffect` first, refactor to TanStack Query later. No global state lib. |
| Styling | Built-in `StyleSheet` |
| Theme | Follow system light/dark via `useColorScheme` |
| Location | `expo-location`, foreground permission. Denied/unavailable → open Search. |
| Units | Metric only (°C, km/h, mm). Times in the city's local time (`timezone=auto`). |
| Icons | WMO weather code → `{ label, icon }` table (`src/lib/weatherCodes.ts`) using `@expo/vector-icons` MaterialCommunityIcons. Note: `@expo/vector-icons` is slated for deprecation — migrate to `@react-native-vector-icons` later. |
| Search | Search-as-you-type, 400ms debounce, min 2 chars. No recent searches in v1. |
| Errors | Friendly error + Retry. No offline cache in v1. |
| Tests | Jest for pure logic (weather-code mapping, response parsing) |
| Git | One commit per milestone, pushed to GitHub |

## v1 scope

1. Current weather at the device location
2. Search for a city by name
3. Hourly + multi-day forecast

Later: favourites, °C/°F toggle, weather-based backgrounds/animations, offline cache, tabs.

## Folder structure

```
src/app/         Expo Router screens (index.tsx = Home, search.tsx, _layout.tsx)
src/api/         http.ts (fetchJson: timeout + friendly errors), openMeteo.ts (fetchForecast + pure parseForecast), geocoding.ts
src/components/  CurrentWeather, HourlyStrip, DailyList, ErrorView, LocationFallback
src/lib/         weatherCodes.ts, formatting.ts, queryClient.ts (TanStack Query client + AppState focus)
src/types/       weather.ts — app-owned shapes; API code converts into these
src/theme/       colors.ts — light/dark palettes + useThemeColors()
src/hooks/       useForecast, useDeviceLocation, useCitySearch, useDebouncedValue
```

## Milestones

- [x] 1. **Scaffold** — create Expo app, run on phone, git
- [x] 2. **Static UI** — Home screen with hard-coded fake data (current, hourly strip, daily list)
- [x] 3. **Real data** — fetch Open-Meteo for a fixed lat/lon, types, weather-code mapping, loading/error states
- [x] 4. **Location** — `expo-location`, permission flow, fallback to Search
- [x] 5. **Search** — Search screen, geocoding API, pick result → back to Home
- [x] 6. **Refactor** — TanStack Query, pull-to-refresh
- [ ] 7. **Tests** — Jest for weather-code mapping and parsing
- [ ] 8. **Polish** — empty/error screens, app icon/name
