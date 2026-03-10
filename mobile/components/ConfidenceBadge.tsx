import { StyleSheet, Text, View } from "react-native";

interface Props {
  confidence: "low" | "medium" | "high";
}

const CONFIG = {
  high: { bg: "#D1FAE5", text: "#065F46", label: "High Confidence" },
  medium: { bg: "#FEF3C7", text: "#92400E", label: "Medium Confidence" },
  low: { bg: "#FEE2E2", text: "#991B1B", label: "Low Confidence" },
};

export default function ConfidenceBadge({ confidence }: Props) {
  const { bg, text, label } = CONFIG[confidence];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
