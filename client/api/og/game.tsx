import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") || "Game";

    // TODO: Fetch actual game data from API
    // const gameData = await fetchGameDetails(gameId);

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
            backgroundColor: "#161A17",
            backgroundImage:
              "linear-gradient(to bottom right, #161A17 0%, #1F2420 100%)",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              display: "flex",
              alignItems: "center",
              color: "#FBCB4A",
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            CARTRIDGE
          </div>

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 80px",
              textAlign: "center",
            }}
          >
            {/* Game Name */}
            <div
              style={{
                fontSize: 80,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 20,
                textTransform: "capitalize",
              }}
            >
              {gameId.replace(/-/g, " ")}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 40,
                color: "#9CA3AF",
                marginBottom: 40,
              }}
            >
              Play on Arcade
            </div>

            {/* Stats placeholder */}
            <div
              style={{
                display: "flex",
                gap: 60,
                marginTop: 40,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 48, fontWeight: "bold", color: "#FBCB4A" }}>
                  --
                </div>
                <div style={{ fontSize: 24, color: "#9CA3AF" }}>Players</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 48, fontWeight: "bold", color: "#FBCB4A" }}>
                  --
                </div>
                <div style={{ fontSize: 24, color: "#9CA3AF" }}>Achievements</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 24,
              color: "#6B7280",
            }}
          >
            play.cartridge.gg
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("Error generating OG image:", e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}