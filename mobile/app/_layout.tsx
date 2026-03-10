import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2D6A4F" },
        headerTintColor: "#F8F5F0",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#F8F5F0" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "BirdWatch" }} />
      <Stack.Screen name="result" options={{ title: "Identification" }} />
    </Stack>
  );
}
