import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("home.permissionTitle"),
        t("home.permissionMessage"),
        [
          { text: t("home.cancel"), style: "cancel" },
          { text: t("home.openSettings"), onPress: () => Linking.openSettings() },
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

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("home.permissionTitle"),
        t("home.permissionMessage"),
        [
          { text: t("home.cancel"), style: "cancel" },
          { text: t("home.openSettings"), onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
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
            <Text style={styles.secondaryButtonText}>{t("home.chooseDifferent")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={identify}>
            <Text style={styles.primaryButtonText}>{t("home.identify")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🦅</Text>
        <Text style={styles.title}>{t("home.title")}</Text>
        <Text style={styles.subtitle}>{t("home.subtitle")}</Text>
      </View>
      <View style={styles.buttonRow}>
        {Platform.OS !== "web" && (
          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <Text style={styles.primaryButtonText}>📷  Take Photo</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            Platform.OS === "web" && styles.fullWidth,
          ]}
          onPress={pickImage}
        >
          <Text style={styles.secondaryButtonText}>🖼  Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D2818",
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
    fontSize: 96,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#F0EDE8",
  },
  subtitle: {
    fontSize: 16,
    color: "#8CB49B",
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
    backgroundColor: "#52B788",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0D2818",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#52B788",
  },
  secondaryButtonText: {
    color: "#52B788",
    fontSize: 16,
    fontWeight: "600",
  },
  fullWidth: {
    flex: 1,
  },
});
