from pydantic import BaseModel


class BirdResult(BaseModel):
    species: str
    scientific_name: str
    confidence: str  # "low" | "medium" | "high"
    description: str
    habitat: str
    fun_facts: list[str]


class ExampleImage(BaseModel):
    url: str
    thumbnail_url: str
    source: str  # "wikimedia", "unsplash", etc.
    attribution: str


class BirdLinks(BaseModel):
    wikipedia: str | None = None


class IdentifyResponse(BirdResult):
    example_images: list[ExampleImage] = []
    links: BirdLinks = BirdLinks()


class StatsEvent(BaseModel):
    install_id: str
    android_id: str | None = None
    species: str
    scientific_name: str
    confidence: str
    had_result: bool
    duration_ms: int
    wikipedia_tapped: bool
    example_images_count: int
    platform: str
    app_version: str
    os_version: str
    timestamp: str
