import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
        <ActivityIndicator size="large" color="#2D6A4F" />
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
      <Text style={styles.species}>{result.species}</Text>
      <Text style={styles.scientific}>{result.scientific_name}</Text>
      <ConfidenceBadge confidence={result.confidence} />

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
    backgroundColor: "#F8F5F0",
  },
  content: {
    padding: 24,
    gap: 16,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    backgroundColor: "#F8F5F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
  errorMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  species: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B1B1B",
  },
  scientific: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    marginTop: -8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D6A4F",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardText: {
    fontSize: 15,
    color: "#1B1B1B",
    lineHeight: 22,
  },
  fact: {
    fontSize: 15,
    color: "#1B1B1B",
    lineHeight: 22,
  },
  wikiButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D6A4F",
  },
  wikiButtonText: {
    color: "#2D6A4F",
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2D6A4F",
    fontSize: 15,
    fontWeight: "600",
  },
});
