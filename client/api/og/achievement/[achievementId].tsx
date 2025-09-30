import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { AchievementOGTemplate } from "../../../lib/og-templates/achievement";
import { fetchAchievementData } from "../../../lib/server-data/fetchAchievement";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const achievementId = searchParams.get("achievementId");
    const playerName = searchParams.get("player");

    if (!achievementId) {
      return new Response("Achievement ID parameter is required", { status: 400 });
    }

    // Fetch achievement data
    const achievementData = await fetchAchievementData(achievementId, playerName || undefined);

    if (!achievementData) {
      return new Response("Achievement not found", { status: 404 });
    }

    // Generate the OG image
    return new ImageResponse(
      <AchievementOGTemplate data={achievementData} />,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error generating achievement OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}