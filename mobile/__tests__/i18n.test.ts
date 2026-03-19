import AsyncStorage from "@react-native-async-storage/async-storage";

// Must mock before importing i18n module
jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [{ languageCode: "en" }]),
}));

jest.mock("i18next", () => {
  let currentLang = "en";
  const resources: Record<string, Record<string, any>> = {};

  return {
    use: jest.fn().mockReturnThis(),
    init: jest.fn(async ({ lng, resources: r }: any) => {
      currentLang = lng;
      Object.assign(resources, r);
    }),
    changeLanguage: jest.fn(async (code: string) => {
      currentLang = code;
    }),
    language: "en",
    t: jest.fn((key: string) => {
      const [ns, ...rest] = key.split(".");
      const translation = resources[currentLang]?.translation;
      return rest.reduce((obj: any, k) => obj?.[k], translation) ?? key;
    }),
  };
});

import * as Localization from "expo-localization";
import i18n from "../lib/i18n";
import { changeLanguage, initI18n, SUPPORTED_LANGUAGES } from "../lib/i18n";
import en from "../locales/en.json";
import lv from "../locales/lv.json";

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});

describe("initI18n", () => {
  it("falls back to English for unknown locale", async () => {
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "ja" }]);
    await initI18n();
    expect(i18n.init).toHaveBeenCalledWith(
      expect.objectContaining({ fallbackLng: "en" })
    );
  });

  it("uses Latvian when device locale is lv", async () => {
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "lv" }]);
    await initI18n();
    expect(i18n.init).toHaveBeenCalledWith(
      expect.objectContaining({ lng: "lv" })
    );
  });

  it("uses saved language over device locale", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("lv");
    (Localization.getLocales as jest.Mock).mockReturnValue([{ languageCode: "en" }]);
    await initI18n();
    expect(i18n.init).toHaveBeenCalledWith(
      expect.objectContaining({ lng: "lv" })
    );
  });
});

describe("changeLanguage", () => {
  it("persists language to AsyncStorage", async () => {
    await changeLanguage("lv");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@language", "lv");
  });
});

describe("locale key coverage", () => {
  function flatKeys(obj: Record<string, any>, prefix = ""): string[] {
    return Object.entries(obj).flatMap(([k, v]) =>
      typeof v === "object" ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
    );
  }

  it("Latvian has all keys present in English", () => {
    const enKeys = flatKeys(en).sort();
    const lvKeys = flatKeys(lv).sort();
    expect(lvKeys).toEqual(enKeys);
  });
});

describe("SUPPORTED_LANGUAGES", () => {
  it("includes English and Latvian", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("lv");
  });
});
