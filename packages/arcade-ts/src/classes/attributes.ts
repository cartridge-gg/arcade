import { byteArray, ByteArray } from "starknet";

interface Attribute {
  trait_type: string;
  value: string;
}

interface AttributesOptions {
  preset?: string;
  color?: string;
  game?: string;
}

export class Attributes {
  public preset?: string;
  public color?: string;
  public game?: string;

  constructor(options?: AttributesOptions) {
    this.preset = options?.preset;
    this.color = options?.color;
    this.game = options?.game;
  }

  static default() {
    return new Attributes();
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value || "[]");
      const array = Array.isArray(json) ? json : [json];
      return new Attributes({
        color: array.find((item: Attribute) => item.trait_type === "color")?.value,
        preset: array.find((item: Attribute) => item.trait_type === "preset")?.value,
        game: array.find((item: Attribute) => item.trait_type === "game")?.value,
      });
    } catch (error: unknown) {
      console.error("Error parsing attributes:", error);
      return Attributes.default();
    }
  }

  compile(): ByteArray {
    const attributes: Attribute[] = [];
    if (this.color) attributes.push({ trait_type: "color", value: this.color });
    if (this.preset) attributes.push({ trait_type: "preset", value: this.preset });
    if (this.game) attributes.push({ trait_type: "game", value: this.game });
    return byteArray.byteArrayFromString(JSON.stringify(attributes));
  }

  clone(): Attributes {
    return new Attributes({
      preset: this.preset,
      color: this.color,
      game: this.game,
    });
  }
}
