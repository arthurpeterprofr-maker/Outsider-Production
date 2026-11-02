export const PREVIEW_KEY = "op-preview-draft";

export const isPreview = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";

export const readPreview = () => {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
