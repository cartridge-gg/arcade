export const Helpers = {
  async getImage(image: string, preset?: string): Promise<string> {
    // If there is image and not preset, return image directly
    if (image && !preset) return image;
    // If there is no image, check for preset
    if (!image && !preset) return "";
    // Fetch image to ensure it exists
    const response = await fetch(image);
    if (!!response && response.status !== 404) return image;
    // If there is no preset, return empty
    if (!preset) return "";
    // If image not found, check for static preset image in png
    const imagePng = `https://static.cartridge.gg/presets/${preset}/icon.png`;
    const responsePng = await fetch(imagePng);
    if (!!responsePng && responsePng.status !== 404) return imagePng;
    // Otherwise check in svg
    const imageSvg = `https://static.cartridge.gg/presets/${preset}/icon.svg`;
    const responseSvg = await fetch(imageSvg);
    if (!!responseSvg && responseSvg.status !== 404) return imageSvg;
    // Finally return empty if nothing available
    return "";
  },
};
