import { render, screen } from "@testing-library/react-native";
import ExampleGallery from "../components/ExampleGallery";
import { ExampleImage } from "../lib/types";

const mockImages: ExampleImage[] = [
  {
    url: "https://example.com/img1.jpg",
    thumbnail_url: "https://example.com/thumb1.jpg",
    source: "wikimedia",
    attribution: "Wikimedia Commons - Test Author, CC BY-SA 4.0",
  },
  {
    url: "https://example.com/img2.jpg",
    thumbnail_url: "https://example.com/thumb2.jpg",
    source: "wikimedia",
    attribution: "Wikimedia Commons - Another Author, CC BY-SA 4.0",
  },
];

describe("ExampleGallery", () => {
  it("renders nothing when images list is empty", () => {
    const { toJSON } = render(<ExampleGallery images={[]} />);
    expect(toJSON()).toBeNull();
  });

  it("renders the section label when images are present", () => {
    render(<ExampleGallery images={mockImages} />);
    expect(screen.getByText("result.examplePhotos")).toBeTruthy();
  });

  it("renders attribution for each image", () => {
    render(<ExampleGallery images={mockImages} />);
    expect(screen.getByText(mockImages[0].attribution)).toBeTruthy();
    expect(screen.getByText(mockImages[1].attribution)).toBeTruthy();
  });
});
