import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "BirdWatch needs access to your photo library to identify birds.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function identify() {
    if (!imageUri) return;
    router.push({ pathname: "/result", params: { imageUri } });
  }

  if (imageUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryButtonText}>Choose Different</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={identify}>
            <Text style={styles.primaryButtonText}>Identify</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🐦</Text>
        <Text style={styles.title}>BirdWatch</Text>
        <Text style={styles.subtitle}>
          Pick a photo to identify any bird instantly
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
        <Text style={styles.primaryButtonText}>Pick a Bird Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5F0",
    padding: 24,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    maxWidth: 260,
  },
  preview: {
    flex: 1,
    borderRadius: 16,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2D6A4F",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#F8F5F0",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D6A4F",
  },
  secondaryButtonText: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "600",
  },
});
