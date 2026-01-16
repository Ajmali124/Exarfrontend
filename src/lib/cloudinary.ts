const parseCloudinaryUrl = () => {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    // Support both formats:
    // - cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    // - cloudinary://API_KEY:API_SECRET@cloudinary.com/CLOUD_NAME
    const cloudName =
      parsed.hostname?.trim() ||
      parsed.pathname.replace("/", "").trim();
    return {
      cloudName,
      apiKey: parsed.username,
      apiSecret: parsed.password,
    };
  } catch (error) {
    console.error("Failed to parse CLOUDINARY_URL", error);
    return null;
  }
};

export const getCloudinaryConfig = () => {
  const fromUrl = parseCloudinaryUrl();
  if (fromUrl?.cloudName && fromUrl.apiKey && fromUrl.apiSecret) {
    return fromUrl;
  }

  // Fallback to explicit env vars (useful for local dev and Vercel).
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  return { cloudName, apiKey, apiSecret };
};

