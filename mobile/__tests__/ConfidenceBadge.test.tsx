import { render, screen } from "@testing-library/react-native";
import ConfidenceBadge from "../components/ConfidenceBadge";

describe("ConfidenceBadge", () => {
  it("shows high confidence key for high", () => {
    render(<ConfidenceBadge confidence="high" />);
    expect(screen.getByText("confidence.high")).toBeTruthy();
  });

  it("shows medium confidence key for medium", () => {
    render(<ConfidenceBadge confidence="medium" />);
    expect(screen.getByText("confidence.medium")).toBeTruthy();
  });

  it("shows low confidence key for low", () => {
    render(<ConfidenceBadge confidence="low" />);
    expect(screen.getByText("confidence.low")).toBeTruthy();
  });
});
