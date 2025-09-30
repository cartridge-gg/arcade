import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

interface ProfileOGData {
  username: string;
  address: string;
  achievements: number;
  games: number;
  earnings: number;
  rank?: number;
}

async function fetchProfileData(username: string): Promise<ProfileOGData | null> {
  // TODO: Replace with actual API call
  return {
    username: username,
    address: "0x1234...5678",
    achievements: 42,
    games: 8,
    earnings: 15230,
    rank: 127,
  };
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || "player";

    const profileData = await fetchProfileData(username);
    if (!profileData) {
      return new Response("Profile not found", { status: 404 });
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
          }}
        >
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
                width: "160px",
                height: "160px",
                borderRadius: "80px",
                backgroundColor: "#FF6B42",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "30px",
                border: "4px solid rgba(255, 107, 66, 0.3)",
              }}
            >
              {profileData.username.slice(0, 2).toUpperCase()}
            </div>

            <div
              style={{
                fontSize: "56px",
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: "10px",
              }}
            >
              {profileData.username}
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#8B8D98",
                marginBottom: "40px",
                fontFamily: "monospace",
              }}
            >
              {profileData.address}
            </div>

            <div style={{ display: "flex", gap: "60px", marginTop: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#FF6B42" }}>
                  {profileData.achievements}
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

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#FF6B42" }}>
                  {profileData.games}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Games Played
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "42px", fontWeight: "700", color: "#FF6B42" }}>
                  {profileData.earnings}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Total Points
                </div>
              </div>
            </div>

            {profileData.rank && (
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-10px",
                  backgroundColor: "rgba(255, 107, 66, 0.2)",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#FF6B42",
                  border: "2px solid #FF6B42",
                }}
              >
                Rank #{profileData.rank}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating profile OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}