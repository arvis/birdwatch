import base64
import json

from openai import OpenAI

from app.config import OPENAI_API_KEY
from app.models.schemas import BirdResult

client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "You are a bird identification expert. Identify the bird in the image. "
    "If the image does not contain a bird, set species to \"Unknown\" and confidence to \"low\"."
)

BIRD_SCHEMA = {
    "name": "bird_result",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "species": {"type": "string", "description": "Common name of the bird"},
            "scientific_name": {"type": "string", "description": "Scientific name"},
            "confidence": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "Identification confidence level",
            },
            "description": {
                "type": "string",
                "description": "2-3 sentence description of the bird",
            },
            "habitat": {"type": "string", "description": "Where the bird is typically found"},
            "fun_facts": {
                "type": "array",
                "items": {"type": "string"},
                "description": "3 interesting facts about the bird",
            },
        },
        "required": [
            "species",
            "scientific_name",
            "confidence",
            "description",
            "habitat",
            "fun_facts",
        ],
        "additionalProperties": False,
    },
}


async def identify_bird(image_bytes: bytes, content_type: str) -> BirdResult:
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    media_type = content_type or "image/jpeg"

    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_schema", "json_schema": BIRD_SCHEMA},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{base64_image}"
                        },
                    },
                    {"type": "text", "text": "Identify this bird."},
                ],
            },
        ],
    )

    data = json.loads(response.choices[0].message.content)
    return BirdResult(**data)
