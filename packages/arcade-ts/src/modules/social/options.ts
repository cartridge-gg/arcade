export type SocialOptions = {
  pin?: boolean;
  follow?: boolean;
  member?: boolean;
  guild?: boolean;
  alliance?: boolean;
};

export const DefaultSocialOptions: SocialOptions = {
  pin: true,
  follow: true,
  member: true,
  guild: true,
  alliance: true,
};
