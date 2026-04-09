export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${API_BASE_URL}/${imagePath.replace(/^\/+/, "")}`;
};
