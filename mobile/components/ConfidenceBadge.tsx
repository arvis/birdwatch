import { StyleSheet, Text, View } from "react-native";

interface Props {
  confidence: "low" | "medium" | "high";
}

const CONFIG = {
  high: { bg: "#1A4731", text: "#52B788", label: "High Confidence" },
  medium: { bg: "#3D2E0A", text: "#F5C542", label: "Medium Confidence" },
  low: { bg: "#3D1515", text: "#F87171", label: "Low Confidence" },
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
