export class Socials {
  constructor(
    public discord: string,
    public telegram: string,
    public twitter: string,
    public youtube: string,
    public website: string,
  ) {
    this.discord = discord;
    this.telegram = telegram;
    this.twitter = twitter;
    this.youtube = youtube;
    this.website = website;
  }

  static from(value: string) {
    try {
      const json = JSON.parse(value);
      return new Socials(json.discord, json.telegram, json.twitter, json.youtube, json.website);
    } catch (error: unknown) {
      console.error("Error parsing socials:", error);
      return new Socials("", "", "", "", "");
    }
  }
}
