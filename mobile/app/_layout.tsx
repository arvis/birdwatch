import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0D2818" },
        headerTintColor: "#F0EDE8",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#0D2818" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "BirdWatch" }} />
      <Stack.Screen name="result" options={{ title: "Identification" }} />
    </Stack>
  );
}
