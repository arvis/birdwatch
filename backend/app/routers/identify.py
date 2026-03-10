from fastapi import APIRouter, HTTPException, UploadFile

from app.models.schemas import BirdLinks, IdentifyResponse
from app.services.image_service import get_example_images
from app.services.openai_service import identify_bird
from app.services.wiki_service import get_wikipedia_link

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/identify", response_model=IdentifyResponse)
async def identify(image: UploadFile):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Use JPEG, PNG, or WebP.")

    image_bytes = await image.read()

    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    try:
        bird = await identify_bird(image_bytes, image.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Identification failed: {str(e)}")

    # Enrich with images and links (non-fatal)
    example_images = await get_example_images(bird.species, bird.scientific_name)
    wikipedia_url = await get_wikipedia_link(bird.species, bird.scientific_name)

    return IdentifyResponse(
        **bird.model_dump(),
        example_images=example_images,
        links=BirdLinks(wikipedia=wikipedia_url),
    )
