# Weather

A mobile weather app built with Expo and React Native, made as a way to learn React Native one milestone at a time. The plan and every design decision are in [PLAN.md](PLAN.md).

The app targets Android through Expo Go. Web is not supported.

## Features

- Current weather for where you are (GPS), with the full address (district, state and country).
- If location is off or denied, Delhi is shown instead, with a banner to turn on location, allow permission or open Settings.
- City search as you type, with debouncing and results showing region and country. The phone vibrates when you pick a city.
- Hourly forecast for the next 24 hours and a 7-day forecast with chance of rain, all shown in the city's local time.
- Pull to refresh, with a vibration when it finishes. Data also refreshes when you return to the app, and if a refresh fails the older data stays on screen with a note saying so.
- Light, dark or system theme, chosen from a pop-up and remembered.
- Help pop-up explaining every icon.

Weather data comes from [Open-Meteo](https://open-meteo.com/). It's free and needs no API key.

## Tech

| | |
|---|---|
| Framework | Expo SDK 57, React Native 0.86, TypeScript |
| Navigation | Expo Router, with two screens: Home and Search |
| Data | TanStack Query, `fetch` with timeouts and friendly errors |
| Device | `expo-location`, `expo-haptics`, AsyncStorage |
| Styling | React Native `StyleSheet` with a light/dark palette |
| Tests | Jest (`jest-expo`) |

## Run it

You'll need Node.js and the **Expo Go** app on your phone (from the Play Store).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. Your phone and computer need to be on the same Wi-Fi; otherwise use `npx expo start --tunnel`.

If a change doesn't show up, restart with a cleared cache:

```bash
npx expo start --clear
```

## Checks

```bash
npm test          # Jest unit tests
npx tsc --noEmit  # typecheck
npm run lint      # ESLint
```

## Project structure

```
src/app/         Screens (Expo Router): index.tsx = Home, search.tsx
src/api/         Open-Meteo clients: forecast, geocoding, shared fetchJson
src/hooks/       useForecast, useDeviceLocation, useCitySearch, useDebouncedValue
src/components/  UI pieces: current weather, hourly strip, daily list, banners, pop-ups
src/lib/         Pure logic: weather codes, formatting, address, theme preference
src/types/       App-owned data shapes (Forecast, Place)
```
