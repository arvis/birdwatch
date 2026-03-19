import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("../lib/i18n", () => ({
  __esModule: true,
  default: { language: "en" },
  changeLanguage: jest.fn(),
  SUPPORTED_LANGUAGES: [
    { code: "en", label: "English" },
    { code: "lv", label: "Latviešu" },
  ],
}));

import { changeLanguage } from "../lib/i18n";
import SettingsScreen from "../app/settings";

describe("SettingsScreen", () => {
  beforeEach(() => {
    (changeLanguage as jest.Mock).mockClear();
  });

  it("renders all supported languages", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.getByText("Latviešu")).toBeTruthy();
  });

  it("shows checkmark for current language (en)", () => {
    render(<SettingsScreen />);
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks).toHaveLength(1);
  });

  it("calls changeLanguage when tapping a language row", () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText("Latviešu"));
    expect(changeLanguage).toHaveBeenCalledWith("lv");
  });
});
