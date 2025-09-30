import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const achievementId = searchParams.get("achievementId") || "Achievement";

    // TODO: Fetch actual achievement data from API
    // const achievementData = await fetchAchievementDetails(achievementId);

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
            {/* Trophy/Badge Icon */}
            <div
              style={{
                fontSize: 120,
                marginBottom: 40,
              }}
            >
              🏆
            </div>

            {/* Achievement Name */}
            <div
              style={{
                fontSize: 64,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 20,
              }}
            >
              Achievement Unlocked
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 36,
                color: "#FBCB4A",
                marginBottom: 20,
              }}
            >
              {achievementId.replace(/-/g, " ").toUpperCase()}
            </div>

            {/* Description placeholder */}
            <div
              style={{
                fontSize: 28,
                color: "#9CA3AF",
                maxWidth: 800,
              }}
            >
              Discover achievements and compete with players on Cartridge Arcade
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