export const Helpers = {
    async getImage(image: string, preset?: string): Promise<string> {
      if (image && !preset) return image;
      if (!image && !preset) return "";
  
      const response = await fetch(image);
      if (!!response && response.status !== 404) return image;
  
      if (!preset) return "";
  
      const imagePng = `https://static.cartridge.gg/presets/${preset}/icon.png`;
      const responsePng = await fetch(imagePng);
      if (!!responsePng && responsePng.status !== 404) return imagePng;
  
      const imageSvg = `https://static.cartridge.gg/presets/${preset}/icon.svg`;
      const responseSvg = await fetch(imageSvg);
      if (!!responseSvg && responseSvg.status !== 404) return imageSvg;
  
      return "";
    },
  };
  