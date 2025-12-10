import { addAddressPadding } from "starknet";
import { getToriiAssetUrl, type GameModel } from "@cartridge/arcade";
import { DEFAULT_PROJECT } from "@/effect/config";
import type { SearchEntityType, SearchResultItem } from "./types";

export function mapTableToEntityType(table: string): SearchEntityType | null {
  const normalized = table.toLowerCase();
  if (
    normalized.startsWith("token") &&
    !normalized.startsWith("token_attributes")
  )
    return "collection";
  if (
    normalized.includes("player") ||
    normalized.includes("account") ||
    normalized.includes("controllers")
  )
    return "player";
  return null;
}

export function calculateGameScore(gameName: string, query: string): number {
  const name = gameName.toLowerCase();
  const q = query.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  return 0;
}

export function buildGameSearchItem(
  game: GameModel,
  query: string,
): SearchResultItem {
  const slug = (game.name || "").toLowerCase().replace(/ /g, "-");
  return {
    id: game.id.toString(),
    type: "game",
    title: game.name || "Unknown Game",
    image: game.properties?.icon,
    link: `/game/${slug}`,
    score: calculateGameScore(game.name || "", query),
  };
}

export function buildLink(
  type: SearchEntityType,
  id: string,
  fields: Record<string, string>,
): string {
  switch (type) {
    case "collection":
      return `/collection/${fields.contract_address ?? id}`;
    case "game":
      return `/game/${fields.slug ?? id}`;
    case "player":
      return `/player/${fields.address ?? id}`;
  }
}

export function buildTitle(
  type: SearchEntityType,
  fields: Record<string, string>,
): string {
  switch (type) {
    case "collection": {
      const parts = fields.primary_text?.split(" ") ?? [];
      if (parts.length > 1) {
        return parts.slice(0, -1).join(" ");
      }
      return fields.primary_text ?? fields.entity_id ?? "Unknown";
    }
    case "game":
      return fields.primary_text ?? fields.snippet ?? "Unknown";
    case "player":
      return fields.primary_text ?? fields.entity_id ?? "Unknown Player";
  }
}

export function buildSubtitle(
  type: SearchEntityType,
  _fields: Record<string, string>,
): string | undefined {
  switch (type) {
    case "collection": {
      return undefined;
    }
    case "game":
    case "player":
      return undefined;
  }
}

export function buildImage(
  type: SearchEntityType,
  id: string,
  fields: Record<string, string>,
  collectionImageMap?: Map<string, string>,
): string | undefined {
  switch (type) {
    case "collection": {
      const address = fields.contract_address ?? id;
      if (collectionImageMap) {
        const image = collectionImageMap.get(address.toLowerCase());
        if (image) return image;
      }
      return getToriiAssetUrl(DEFAULT_PROJECT, addAddressPadding(address));
    }
    case "game":
      return fields.icon || fields.image;
    case "player":
      return undefined;
  }
}
