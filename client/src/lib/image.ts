export const resizeImage = (
  url: string | undefined,
  width: number,
  height: number,
): string | undefined => {
  if (!url) return undefined;

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("width", width.toString());
    urlObj.searchParams.set("height", height.toString());
    return urlObj.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&height=${height}`;
  }
};
