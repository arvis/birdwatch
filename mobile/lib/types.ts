export interface ExampleImage {
  url: string;
  thumbnail_url: string;
  source: string;
  attribution: string;
}

export interface BirdLinks {
  wikipedia: string | null;
}

export interface BirdResult {
  species: string;
  scientific_name: string;
  confidence: "low" | "medium" | "high";
  description: string;
  habitat: string;
  fun_facts: string[];
  example_images: ExampleImage[];
  links: BirdLinks;
}
