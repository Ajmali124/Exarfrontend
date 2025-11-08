const parseCloudinaryUrl = () => {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const cloudName = parsed.pathname.replace("/", "");
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
  const config = parseCloudinaryUrl();
  if (!config || !config.cloudName || !config.apiKey || !config.apiSecret) {
    return null;
  }
  return config;
};

