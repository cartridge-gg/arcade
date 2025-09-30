import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

interface AchievementOGData {
  title: string;
  description: string;
  icon: string;
  game: string;
  points: number;
  percentage: string;
  difficulty?: string;
}

async function fetchAchievementData(achievementId: string): Promise<AchievementOGData | null> {
  // TODO: Replace with actual API call
  return {
    title: achievementId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    description: "Complete an epic challenge and earn legendary rewards",
    icon: "🏆",
    game: "Epic Quest",
    points: 500,
    percentage: "2.3",
    difficulty: "Expert",
  };
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const achievementId = searchParams.get("achievementId") || "achievement";

    const data = await fetchAchievementData(achievementId);
    if (!data) {
      return new Response("Achievement not found", { status: 404 });
    }

    const getDifficultyColor = (difficulty?: string) => {
      switch (difficulty) {
        case "Easy": return "#22C55E";
        case "Medium": return "#FBBF24";
        case "Hard": return "#F97316";
        case "Expert": return "#DC2626";
        default: return "#FF6B42";
      }
    };

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
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 107, 66, 0.05) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
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
                width: "180px",
                height: "180px",
                borderRadius: "90px",
                backgroundColor: "#FF6B42",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "80px",
                marginBottom: "30px",
                border: "6px solid #FF6B42",
              }}
            >
              {data.icon}
            </div>

            <div
              style={{
                fontSize: "48px",
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              {data.title}
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "#FF6B42",
                marginBottom: "20px",
                fontWeight: "600",
              }}
            >
              {data.game}
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#8B8D98",
                marginBottom: "30px",
                textAlign: "center",
                maxWidth: "600px",
              }}
            >
              {data.description}
            </div>

            <div style={{ display: "flex", gap: "60px", marginTop: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF6B42" }}>
                  {data.points}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Points
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF6B42" }}>
                  {data.percentage}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#8B8D98",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Completion
                </div>
              </div>

              {data.difficulty && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "700",
                      color: getDifficultyColor(data.difficulty),
                    }}
                  >
                    {data.difficulty}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#8B8D98",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Difficulty
                  </div>
                </div>
              )}
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
    console.error("Error generating achievement OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}