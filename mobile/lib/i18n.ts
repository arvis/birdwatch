import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import lv from "../locales/lv.json";

const STORAGE_KEY = "@language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "lv", label: "Latviešu" },
];

export async function initI18n() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? "en";
  const lng = saved ?? deviceLang;

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      lv: { translation: lv },
    },
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export async function changeLanguage(code: string) {
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(STORAGE_KEY, code);
}

export default i18n;
