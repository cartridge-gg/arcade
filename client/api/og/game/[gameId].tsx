import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { GameOGTemplate } from "../../../lib/og-templates/game";
import { fetchGameData } from "../../../lib/server-data/fetchGame";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return new Response("Game ID parameter is required", { status: 400 });
    }

    // Fetch game data
    const gameData = await fetchGameData(gameId);

    if (!gameData) {
      return new Response("Game not found", { status: 404 });
    }

    // Generate the OG image
    return new ImageResponse(
      <GameOGTemplate data={gameData} />,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error generating game OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}