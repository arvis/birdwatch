import httpx

from app.models.schemas import ExampleImage

API_URL = "https://commons.wikimedia.org/w/api.php"


class WikimediaProvider:
    async def search(self, species: str) -> list[ExampleImage]:
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": f"File:{species}",
            "gsrlimit": 4,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata",
            "iiurlwidth": 400,
        }

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(API_URL, params=params)
                resp.raise_for_status()
                data = resp.json()
        except Exception:
            return []

        pages = data.get("query", {}).get("pages", {})
        images = []

        for page in pages.values():
            imageinfo = page.get("imageinfo", [{}])[0]
            url = imageinfo.get("url")
            thumb = imageinfo.get("thumburl")

            if not url or not thumb:
                continue

            metadata = imageinfo.get("extmetadata", {})
            artist = metadata.get("Artist", {}).get("value", "Unknown")
            license_name = metadata.get("LicenseShortName", {}).get("value", "")

            attribution = f"{artist}, {license_name}" if license_name else artist

            images.append(
                ExampleImage(
                    url=url,
                    thumbnail_url=thumb,
                    source="wikimedia",
                    attribution=f"Wikimedia Commons - {attribution}",
                )
            )

        return images
