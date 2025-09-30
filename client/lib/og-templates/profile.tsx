import React from "react";

export interface ProfileOGData {
  username: string;
  address: string;
  avatar?: string;
  achievements: number;
  games: number;
  earnings: number;
  rank?: number;
}

export function ProfileOGTemplate({ data }: { data: ProfileOGData }) {
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
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "50px",
            display: "flex",
            alignItems: "center",
            fontSize: "32px",
            fontWeight: "700",
            color: "#FF6B42",
          }}
        >
          CARTRIDGE
        </div>

        {/* Avatar */}
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
          {data.avatar || data.username.slice(0, 2).toUpperCase()}
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: "10px",
          }}
        >
          {data.username}
        </div>

        {/* Address */}
        <div
          style={{
            fontSize: "20px",
            color: "#8B8D98",
            marginBottom: "40px",
            fontFamily: "monospace",
          }}
        >
          {data.address.slice(0, 6)}...{data.address.slice(-4)}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "60px",
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
              {data.achievements}
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
              {data.games}
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
              {data.earnings}
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

        {/* Rank Badge */}
        {data.rank && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "50px",
              backgroundColor: "rgba(255, 107, 66, 0.2)",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "24px",
              fontWeight: "600",
              color: "#FF6B42",
              border: "2px solid #FF6B42",
            }}
          >
            Rank #{data.rank}
          </div>
        )}
      </div>
    </div>
  );
}