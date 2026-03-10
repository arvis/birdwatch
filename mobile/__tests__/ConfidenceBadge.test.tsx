import { render, screen } from "@testing-library/react-native";
import ConfidenceBadge from "../components/ConfidenceBadge";

describe("ConfidenceBadge", () => {
  it("shows High Confidence for high", () => {
    render(<ConfidenceBadge confidence="high" />);
    expect(screen.getByText("High Confidence")).toBeTruthy();
  });

  it("shows Medium Confidence for medium", () => {
    render(<ConfidenceBadge confidence="medium" />);
    expect(screen.getByText("Medium Confidence")).toBeTruthy();
  });

  it("shows Low Confidence for low", () => {
    render(<ConfidenceBadge confidence="low" />);
    expect(screen.getByText("Low Confidence")).toBeTruthy();
  });
});
