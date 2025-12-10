export type SearchEntityType = "collection" | "game" | "player";

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  image?: string;
  link: string;
  score?: number;
}

export interface GroupedSearchResults {
  games: SearchResultItem[];
  collections: SearchResultItem[];
  players: SearchResultItem[];
}
