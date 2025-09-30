import React from "react";

export interface AchievementOGData {
  title: string;
  description: string;
  icon?: string;
  game: string;
  points: number;
  percentage: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  playerName?: string;
  completed?: boolean;
}

export function AchievementOGTemplate({ data }: { data: AchievementOGData }) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "#22C55E";
      case "Medium":
        return "#FBBF24";
      case "Hard":
        return "#F97316";
      case "Expert":
        return "#DC2626";
      default:
        return "#FF6B42";
    }
  };

  return (
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
        position: "relative",
        padding: "60px",
      }}
    >
      {/* Background Pattern */}
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
          justifyContent: "center",
          width: "100%",
          maxWidth: "900px",
          position: "relative",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: "-10px",
            display: "flex",
            alignItems: "center",
            fontSize: "32px",
            fontWeight: "700",
            color: "#FF6B42",
          }}
        >
          CARTRIDGE
        </div>

        {/* Achievement Icon */}
        <div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "90px",
            backgroundColor: data.completed ? "#FF6B42" : "#1A1B26",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "80px",
            marginBottom: "30px",
            border: `6px solid ${data.completed ? "#FF6B42" : "rgba(255, 107, 66, 0.3)"}`,
            position: "relative",
          }}
        >
          {data.icon || "🏆"}
          {data.completed && (
            <div
              style={{
                position: "absolute",
                bottom: "-10px",
                right: "-10px",
                width: "50px",
                height: "50px",
                borderRadius: "25px",
                backgroundColor: "#22C55E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                border: "3px solid #0D0E14",
              }}
            >
              ✓
            </div>
          )}
        </div>

        {/* Achievement Title */}
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

        {/* Game Name */}
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

        {/* Description */}
        <div
          style={{
            fontSize: "20px",
            color: "#8B8D98",
            marginBottom: "30px",
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: "1.4",
          }}
        >
          {data.description}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "60px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#FF6B42",
              }}
            >
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: "#FF6B42",
              }}
            >
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
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

        {/* Player Name if provided */}
        {data.playerName && (
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "-10px",
              backgroundColor: "rgba(255, 107, 66, 0.2)",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#FF6B42",
              border: "2px solid #FF6B42",
            }}
          >
            {data.completed ? "Earned by" : "Available for"} {data.playerName}
          </div>
        )}
      </div>
    </div>
  );
}