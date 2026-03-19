import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { changeLanguage, SUPPORTED_LANGUAGES } from "../lib/i18n";
import i18n from "../lib/i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const currentLang = i18n.language;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
      <Text style={styles.sectionNote}>{t("settings.languageNote")}</Text>
      <View style={styles.list}>
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <TouchableOpacity
            key={code}
            style={styles.row}
            onPress={() => changeLanguage(code)}
          >
            <Text style={styles.checkmark}>
              {currentLang === code ? "✓" : "  "}
            </Text>
            <Text style={styles.languageLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D2818",
    padding: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F0EDE8",
    marginBottom: 4,
  },
  sectionNote: {
    fontSize: 14,
    color: "#8CB49B",
    marginBottom: 20,
  },
  list: {
    backgroundColor: "#1C3829",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0D2818",
  },
  checkmark: {
    fontSize: 16,
    color: "#52B788",
    fontWeight: "700",
    width: 24,
  },
  languageLabel: {
    fontSize: 16,
    color: "#F0EDE8",
  },
});
