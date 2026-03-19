import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  confidence: "low" | "medium" | "high";
}

const CONFIG = {
  high: { bg: "#1A4731", text: "#52B788" },
  medium: { bg: "#3D2E0A", text: "#F5C542" },
  low: { bg: "#3D1515", text: "#F87171" },
};

export default function ConfidenceBadge({ confidence }: Props) {
  const { t } = useTranslation();
  const { bg, text } = CONFIG[confidence];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{t(`confidence.${confidence}`)}</Text>
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
