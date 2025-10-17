import { type ByteArray, byteArray } from "starknet";

interface SocialsOptions {
  discord?: string;
  telegram?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
  github?: string;
  videos?: string[];
  images?: string[];
}

export class Socials {
  public discord?: string;
  public telegram?: string;
  public twitter?: string;
  public youtube?: string;
  public website?: string;
  public github?: string;
  public videos?: string[];
  public images?: string[];

  constructor(options?: SocialsOptions) {
    this.discord = options?.discord;
    this.telegram = options?.telegram;
    this.twitter = options?.twitter;
    this.youtube = options?.youtube;
    this.website = options?.website;
    this.github = options?.github;
    this.videos = options?.videos;
    this.images = options?.images;
  }

  static default() {
    return new Socials();
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value || "{}");
      return new Socials({
        discord: json.discord,
        telegram: json.telegram,
        twitter: json.twitter,
        youtube: json.youtube,
        website: json.website,
        github: json.github,
        videos: json.videos,
        images: json.images,
      });
    } catch (error: unknown) {
      console.error("Error parsing socials:", error);
      return Socials.default();
    }
  }

  static merge(lhs: Socials | undefined, rhs: Socials | undefined): Socials {
    return new Socials({
      discord: lhs?.discord || rhs?.discord,
      telegram: lhs?.telegram || rhs?.telegram,
      twitter: lhs?.twitter || rhs?.twitter,
      youtube: lhs?.youtube || rhs?.youtube,
      website: lhs?.website || rhs?.website,
      github: lhs?.github || rhs?.github,
      videos: lhs?.videos || rhs?.videos,
      images: lhs?.images || rhs?.images,
    });
  }

  compile(): ByteArray {
    const json: Record<string, string | string[]> = {};
    if (this.discord) json.discord = this.discord;
    if (this.telegram) json.telegram = this.telegram;
    if (this.twitter) json.twitter = this.twitter;
    if (this.youtube) json.youtube = this.youtube;
    if (this.website) json.website = this.website;
    if (this.github) json.github = this.github;
    if (this.videos) json.videos = this.videos;
    if (this.images) json.images = this.images;
    return byteArray.byteArrayFromString(JSON.stringify(json));
  }

  clone(): Socials {
    return new Socials({
      discord: this.discord,
      telegram: this.telegram,
      twitter: this.twitter,
      youtube: this.youtube,
      website: this.website,
      github: this.github,
      videos: this.videos,
      images: this.images,
    });
  }
}
