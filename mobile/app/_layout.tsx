import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

import { initI18n } from "../lib/i18n";

function SettingsButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/settings")} style={{ paddingLeft: 8 }}>
      <Text style={{ color: "#F0EDE8", fontSize: 22 }}>⚙</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0D2818" },
        headerTintColor: "#F0EDE8",
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: "#0D2818" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "BirdWatch", headerRight: () => <SettingsButton /> }}
      />
      <Stack.Screen name="result" options={{ title: "Identification" }} />
      <Stack.Screen name="settings" options={{ title: "Settings", presentation: "modal" }} />
    </Stack>
  );
}
