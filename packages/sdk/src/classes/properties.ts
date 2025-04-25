import { byteArray, ByteArray } from "starknet";

interface PropertiesOptions {
  preset?: string;
  icon?: string;
  banner?: string;
  cover?: string;
}

export class Properties {
  public preset?: string;
  public icon?: string;
  public banner?: string;
  public cover?: string;

  constructor(options?: PropertiesOptions) {
    this.preset = options?.preset;
    this.icon = options?.icon;
    this.banner = options?.banner;
    this.cover = options?.cover;
  }

  static default() {
    return new Properties();
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value || "{}");
      return new Properties({
        preset: json.preset,
        icon: json.icon,
        banner: json.banner,
        cover: json.cover,
      });
    } catch (error: unknown) {
      console.error("Error parsing properties:", error);
      return Properties.default();
    }
  }

  compile(): ByteArray {
    const json: Record<string, string> = {};
    if (this.preset) json.preset = this.preset;
    if (this.icon) json.icon = this.icon;
    if (this.banner) json.banner = this.banner;
    if (this.cover) json.cover = this.cover;
    return byteArray.byteArrayFromString(JSON.stringify(json));
  }
}
