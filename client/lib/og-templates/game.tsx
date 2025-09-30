import React from "react";

export interface GameOGData {
  name: string;
  description: string;
  thumbnail?: string;
  playerCount: number;
  achievementCount: number;
  status: string;
  categories?: string[];
}

export function GameOGTemplate({ data }: { data: GameOGData }) {
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
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 107, 66, 0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
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

        {/* Game Icon/Thumbnail */}
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
            overflow: "hidden",
          }}
        >
          {data.thumbnail ? (
            <img
              src={data.thumbnail}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt=""
            />
          ) : (
            data.name.slice(0, 2).toUpperCase()
          )}
        </div>

        {/* Game Name */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {data.name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: "22px",
            color: "#8B8D98",
            marginBottom: "30px",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: "1.4",
          }}
        >
          {data.description}
        </div>

        {/* Categories */}
        {data.categories && data.categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "30px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.categories.map((category, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "rgba(255, 107, 66, 0.2)",
                  padding: "8px 16px",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#FF6B42",
                  border: "1px solid rgba(255, 107, 66, 0.3)",
                }}
              >
                {category}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "80px",
            marginTop: "20px",
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
                fontSize: "42px",
                fontWeight: "700",
                color: "#FF6B42",
              }}
            >
              {data.playerCount.toLocaleString()}
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                fontWeight: "700",
                color: "#FF6B42",
              }}
            >
              {data.achievementCount}
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

        {/* Status Badge */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-10px",
            backgroundColor: data.status === "LIVE" ? "rgba(34, 197, 94, 0.2)" : "rgba(251, 191, 36, 0.2)",
            padding: "10px 20px",
            borderRadius: "20px",
            fontSize: "20px",
            fontWeight: "600",
            color: data.status === "LIVE" ? "#22C55E" : "#FBBF24",
            border: `2px solid ${data.status === "LIVE" ? "#22C55E" : "#FBBF24"}`,
          }}
        >
          {data.status}
        </div>
      </div>
    </div>
  );
}