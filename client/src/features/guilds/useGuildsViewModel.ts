export interface GuildsViewModel {
  messageTitle: string;
  messageIcon: "guild";
}

export function useGuildsViewModel(): GuildsViewModel {
  return {
    messageTitle: "Coming soon",
    messageIcon: "guild",
  };
}
