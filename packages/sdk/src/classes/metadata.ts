export class Metadata {
  constructor(
    public color: string,
    public name: string,
    public description: string,
    public image: string,
    public banner: string,
  ) {
    this.color = color;
    this.name = name;
    this.description = description;
    this.image = image;
    this.banner = banner;
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value);
      return new Metadata(json.color, json.name, json.description, json.image, json.banner);
    } catch (error: unknown) {
      console.error("Error parsing metadata:", error);
      return new Metadata("", "", "", "", "");
    }
  }
}
