import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConfidenceBadge from "../components/ConfidenceBadge";
import ExampleGallery from "../components/ExampleGallery";
import { identifyBird } from "../lib/api";
import { BirdResult } from "../lib/types";

type ScreenState =
  | { status: "loading" }
  | { status: "success"; result: BirdResult }
  | { status: "error"; message: string };

export default function ResultScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const router = useRouter();
  const [state, setState] = useState<ScreenState>({ status: "loading" });

  async function runIdentification() {
    setState({ status: "loading" });
    try {
      const result = await identifyBird(imageUri);
      setState({ status: "success", result });
    } catch (e: any) {
      setState({ status: "error", message: e.message ?? "Something went wrong" });
    }
  }

  useEffect(() => {
    runIdentification();
  }, []);

  if (state.status === "loading") {
    return (
      <View style={styles.centered}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.loadingImage} />
        ) : null}
        <ActivityIndicator size="large" color="#52B788" />
        <Text style={styles.loadingText}>Identifying...</Text>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Identification failed</Text>
        <Text style={styles.errorMessage}>{state.message}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={runIdentification}>
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { result } = state;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUri }} style={styles.heroImage} />

      <Text style={styles.species}>{result.species}</Text>
      <Text style={styles.scientific}>{result.scientific_name}</Text>
      <View style={styles.badgeRow}>
        <ConfidenceBadge confidence={result.confidence} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>{result.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Habitat</Text>
        <Text style={styles.cardText}>{result.habitat}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Fun Facts</Text>
        {result.fun_facts.map((fact, i) => (
          <Text key={i} style={styles.fact}>
            {i + 1}. {fact}
          </Text>
        ))}
      </View>

      <ExampleGallery images={result.example_images} />

      {result.links.wikipedia && (
        <TouchableOpacity
          style={styles.wikiButton}
          onPress={() => Linking.openURL(result.links.wikipedia!)}
        >
          <Text style={styles.wikiButtonText}>Read on Wikipedia →</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.primaryButtonText}>Identify Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#0D2818",
  },
  content: {
    gap: 16,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    backgroundColor: "#0D2818",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  loadingImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#8CB49B",
    marginTop: 8,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F0EDE8",
  },
  errorMessage: {
    fontSize: 14,
    color: "#8CB49B",
    textAlign: "center",
  },
  heroImage: {
    width: "100%",
    height: 280,
    borderRadius: 0,
  },
  species: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#F0EDE8",
    paddingHorizontal: 24,
  },
  scientific: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#8CB49B",
    marginTop: -8,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#1C3829",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginHorizontal: 24,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#52B788",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardText: {
    fontSize: 15,
    color: "#F0EDE8",
    lineHeight: 22,
  },
  fact: {
    fontSize: 15,
    color: "#F0EDE8",
    lineHeight: 22,
  },
  badgeRow: {
    paddingHorizontal: 24,
  },
  wikiButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#52B788",
    marginHorizontal: 24,
  },
  wikiButtonText: {
    color: "#52B788",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#52B788",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 24,
  },
  primaryButtonText: {
    color: "#0D2818",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#52B788",
    fontSize: 15,
    fontWeight: "600",
  },
});
