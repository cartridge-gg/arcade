import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

interface GameOGData {
  name: string;
  description: string;
  playerCount: number;
  achievementCount: number;
  status: string;
}

async function fetchGameData(gameId: string): Promise<GameOGData | null> {
  // TODO: Replace with actual API call
  return {
    name: gameId.charAt(0).toUpperCase() + gameId.slice(1).replace(/-/g, " "),
    description: "An immersive on-chain gaming experience built on Starknet",
    playerCount: 5432,
    achievementCount: 24,
    status: "LIVE",
  };
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") || "game";

    const gameData = await fetchGameData(gameId);
    if (!gameData) {
      return new Response("Game not found", { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0D0E14",
            background: "linear-gradient(135deg, #0D0E14 0%, #1A1B26 100%)",
            fontFamily: "system-ui, sans-serif",
            padding: "60px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 107, 66, 0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "900px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "-10px",
                fontSize: "32px",
                fontWeight: "700",
                color: "#FF6B42",
              }}
            >
              CARTRIDGE
            </div>

            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "24px",
                backgroundColor: "#1A1B26",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "72px",
                fontWeight: "700",
                color: "#FF6B42",
                marginBottom: "30px",
                border: "4px solid rgba(255, 107, 66, 0.3)",
              }}
            >
              {gameData.name.slice(0, 2).toUpperCase()}
            </div>

            <div
              style={{
                fontSize: "56px",
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {gameData.name}
            </div>

            <div
              style={{
                fontSize: "22px",
                color: "#8B8D98",
                marginBottom: "30px",
                textAlign: "center",
                maxWidth: "700px",
              }}
            >
              {gameData.description}
            </div>

            <div style={{ display: "flex", gap: "80px", marginTop: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#FF6B42" }}>
                  {gameData.playerCount.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Players
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#FF6B42" }}>
                  {gameData.achievementCount}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Achievements
                </div>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-10px",
                backgroundColor:
                  gameData.status === "LIVE"
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(251, 191, 36, 0.2)",
                padding: "10px 20px",
                borderRadius: "20px",
                fontSize: "20px",
                fontWeight: "600",
                color: gameData.status === "LIVE" ? "#22C55E" : "#FBBF24",
                border: `2px solid ${gameData.status === "LIVE" ? "#22C55E" : "#FBBF24"}`,
              }}
            >
              {gameData.status}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating game OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}