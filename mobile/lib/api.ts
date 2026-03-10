import { BirdResult } from "./types";

const isWeb = typeof document !== "undefined";

const API_URL = __DEV__
  ? isWeb
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000"
  : "https://api.birdwatch.app";

export async function identifyBird(imageUri: string): Promise<BirdResult> {
  const formData = new FormData();

  if (isWeb) {
    const blob = await fetch(imageUri).then((r) => r.blob());
    formData.append("image", blob, "bird.jpg");
  } else {
    formData.append("image", {
      uri: imageUri,
      name: "bird.jpg",
      type: "image/jpeg",
    } as any);
  }

  const response = await fetch(`${API_URL}/api/identify`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Request failed: ${response.status}`);
  }

  return response.json();
}
