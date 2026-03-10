import { identifyBird } from "../lib/api";

const mockResult = {
  species: "Great Tit",
  scientific_name: "Parus major",
  confidence: "high" as const,
  description: "A common European bird.",
  habitat: "Woodlands and gardens",
  fun_facts: ["Fact 1", "Fact 2", "Fact 3"],
  example_images: [],
  links: { wikipedia: "https://en.wikipedia.org/wiki/Great_tit" },
};

describe("identifyBird", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns a BirdResult on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    const result = await identifyBird("file:///test/bird.jpg");
    expect(result.species).toBe("Great Tit");
    expect(result.confidence).toBe("high");
    expect(result.fun_facts).toHaveLength(3);
  });

  it("posts to /api/identify", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    await identifyBird("file:///test/bird.jpg");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/api/identify");
    expect(options.method).toBe("POST");
  });

  it("throws an error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Invalid file type" }),
    });

    await expect(identifyBird("file:///test/bird.jpg")).rejects.toThrow(
      "Invalid file type"
    );
  });

  it("throws a generic error when response body is unparseable", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error("not json"); },
    });

    await expect(identifyBird("file:///test/bird.jpg")).rejects.toThrow(
      "Request failed: 500"
    );
  });
});
