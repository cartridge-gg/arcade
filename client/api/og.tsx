import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

/**
 * OG Image Generation API
 *
 * Generates dynamic Open Graph images for:
 * - Player profiles
 * - Game pages
 * - Game-specific player profiles
 */

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const username = searchParams.get("username");
    const game = searchParams.get("game");
    const points = searchParams.get("points");
    const achievements = searchParams.get("achievements");

    // Validate required parameters based on type
    if (!type) {
      return new Response("Missing type parameter", { status: 400 });
    }

    // Generate image based on type
    if (type === "profile") {
      return generateProfileImage(
        username || "",
        points || "0",
        achievements || "0/0"
      );
    } else if (type === "game") {
      return generateGameImage(game || "");
    } else if (type === "game-profile") {
      return generateGameProfileImage(
        username || "",
        game || "",
        points || "0",
        achievements || "0/0"
      );
    }

    return new Response("Invalid type parameter", { status: 400 });
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

/**
 * Generate OG image for player profile
 */
function generateProfileImage(
  username: string,
  points: string,
  achievements: string
) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          padding: "10px 20px",
          justifyContent: "center",
          fontFamily: 'Inter, "Material Icons"',
          fontSize: 28,
          position: "relative",
        }}
      >
        {/* Right-aligned background image */}
        <div
          // src="https://picsum.photos/600/800"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            height: "100%",
            objectFit: "cover",
            width: "50vw",
            height: "100vh",
            backgroundColor: "#2D260C",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "0",
            right: "0",
            top: "0",
            bottom: "0",
            backgroundImage:
              "linear-gradient(100deg, #000000 0%, #000000 50%, #00000085 75%, #00000050 80%, #00000020 85%, #00000000 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingLeft: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              padding: 10,
              width: 100,
              height: 100,
              borderRadius: 12,
            }}
          >
            <img
              src="https://picsum.photos/200/300"
              style={{
                borderRadius: 12,
              }}
              width={80}
              height={80}
            />
          </div>
          <p style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                color: "white",
                fontSize: "10px",
              }}
            >
              PROFILE
            </span>
            <span
              style={{
                color: "white",
                fontSize: "28px",
              }}
            >
              LOOT SURVIVOR
            </span>
          </p>

          <div style={{ display: "flex", itemsCenter: "center", gap: 10 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="13"
              viewBox="0 0 17 18"
              fill="none"
            >
              <path
                d="M6.17244 3.44006C6.31893 3.4954 6.41659 3.63537 6.41659 3.79162C6.41659 3.94787 6.31893 4.08785 6.17244 4.14319L4.33325 4.83329L3.64315 6.67248C3.58781 6.81897 3.44784 6.91662 3.29159 6.91662C3.13534 6.91662 2.99536 6.81897 2.94002 6.67248L2.24992 4.83329L0.410726 4.14319C0.264242 4.08785 0.166586 3.94787 0.166586 3.79162C0.166586 3.63537 0.264242 3.4954 0.410726 3.44006L2.24992 2.74996L2.94002 0.910765C2.99536 0.764281 3.13534 0.666625 3.29159 0.666625C3.44784 0.666625 3.58781 0.764281 3.64315 0.910765L4.33325 2.74996L6.17244 3.44006ZM10.1568 3.05269C10.2415 2.86715 10.427 2.74996 10.6288 2.74996C10.8306 2.74996 11.0162 2.86715 11.1008 3.05269L12.8196 6.76363L16.5305 8.47913C16.7161 8.56376 16.8333 8.74931 16.8333 8.95439C16.8333 9.15946 16.7161 9.34176 16.5305 9.42639L12.8163 11.1419L11.1041 14.8528C11.0194 15.0384 10.8339 15.1556 10.6321 15.1556C10.4303 15.1556 10.2447 15.0384 10.1601 14.8528L8.44458 11.1386L4.73039 9.42314C4.54484 9.3385 4.42765 9.15295 4.42765 8.95113C4.42765 8.74931 4.54484 8.56376 4.73039 8.47912L8.44133 6.76689L10.1568 3.05269ZM4.33325 13.1666L6.17244 13.8567C6.31893 13.9121 6.41658 14.052 6.41658 14.2083C6.41658 14.3645 6.31893 14.5045 6.17244 14.5599L4.33325 15.25L3.64315 17.0892C3.58781 17.2356 3.44783 17.3333 3.29158 17.3333C3.13533 17.3333 2.99536 17.2356 2.94002 17.0892L2.24992 15.25L0.410725 14.5599C0.264241 14.5045 0.166585 14.3645 0.166585 14.2083C0.166585 14.052 0.264241 13.9121 0.410725 13.8567L2.24992 13.1666L2.94002 11.3274C2.99536 11.1809 3.13533 11.0833 3.29158 11.0833C3.44783 11.0833 3.58781 11.1809 3.64315 11.3274L4.33325 13.1666Z"
                fill="#FFD546"
              />
            </svg>
            <span
              style={{
                fontFamily: "mono",
                color: "white",
                fontSize: "12px",
              }}
            >
              12 POINTS
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * Generate OG image for game page
 */
function generateGameImage(game: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          padding: "10px 20px",
          justifyContent: "center",
          fontFamily: 'Inter, "Material Icons"',
          fontSize: 28,
          position: "relative",
        }}
      >
        {/* Right-aligned background image */}
        <img
          src="https://picsum.photos/200/300"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            height: "100%",
            objectFit: "cover",
            width: "50vw",
            height: "100vh",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "0",
            right: "0",
            top: "0",
            bottom: "0",
            backgroundImage:
              "linear-gradient(100deg, #000000 0%, #000000 50%, #00000085 75%, #00000050 80%, #00000020 85%, #00000000 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingLeft: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              padding: 10,
              width: 100,
              height: 100,
              borderRadius: 12,
            }}
          >
            <img
              src="https://picsum.photos/200/300"
              style={{
                borderRadius: 12,
              }}
              width={80}
              height={80}
            />
          </div>
          <p style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                color: "white",
                fontSize: "10px",
              }}
            >
              GAME
            </span>
            <span
              style={{
                color: "white",
                fontSize: "28px",
              }}
            >
              LOOT SURVIVOR
            </span>
          </p>

          <div style={{ display: "flex", itemsCenter: "center", gap: 10 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="12"
              viewBox="0 0 17 16"
              fill="none"
            >
              <path
                d="M10.0094 1.10405L16.5565 7.35352C16.7332 7.52207 16.8332 7.75564 16.8332 8.00004C16.8332 8.24444 16.7332 8.47768 16.5565 8.64656L10.0094 14.896C9.65253 15.2355 9.08762 15.2227 8.74688 14.8658C8.40628 14.5124 8.41908 13.9451 8.7771 13.6033L13.7134 8.89384L1.05966 8.89384C0.566768 8.89384 0.166505 8.49358 0.166505 8.00069C0.166504 7.5078 0.566768 7.10828 1.05966 7.10828L13.7111 7.10828L8.77478 2.39886C8.41729 2.05635 8.40613 1.48906 8.74465 1.13455C9.08688 0.777438 9.61883 0.76479 10.0094 1.10405Z"
                fill="#fff"
              />
            </svg>
            <span
              style={{
                fontFamily: "mono",
                color: "white",
                fontSize: "12px",
              }}
            >
              View in the arcade
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

/**
 * Generate OG image for game-specific player profile
 */
function generateGameProfileImage(
  username: string,
  game: string,
  points: string,
  achievements: string
) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          padding: "10px 20px",
          justifyContent: "center",
          fontFamily: 'Inter, "Material Icons"',
          fontSize: 28,
          position: "relative",
        }}
      >
        {/* Right-aligned background image */}
        <div
          // src="https://picsum.photos/600/800"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            height: "100%",
            objectFit: "cover",
            width: "50vw",
            height: "100vh",
            backgroundColor: "#2D260C",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "0",
            right: "0",
            top: "0",
            bottom: "0",
            backgroundImage:
              "linear-gradient(100deg, #000000 0%, #000000 50%, #00000085 75%, #00000050 80%, #00000020 85%, #00000000 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingLeft: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "white",
              padding: 10,
              width: 100,
              height: 100,
              borderRadius: 12,
            }}
          >
            <img
              src="https://picsum.photos/200/300"
              style={{
                borderRadius: 12,
              }}
              width={80}
              height={80}
            />
          </div>
          <p style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                color: "white",
                fontSize: "10px",
              }}
            >
              PROFILE
            </span>
            <span
              style={{
                color: "white",
                fontSize: "28px",
              }}
            >
              LOOT SURVIVOR
            </span>
          </p>

          <div style={{ display: "flex", itemsCenter: "center", gap: 10 }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="13"
              viewBox="0 0 17 18"
              fill="none"
            >
              <path
                d="M6.17244 3.44006C6.31893 3.4954 6.41659 3.63537 6.41659 3.79162C6.41659 3.94787 6.31893 4.08785 6.17244 4.14319L4.33325 4.83329L3.64315 6.67248C3.58781 6.81897 3.44784 6.91662 3.29159 6.91662C3.13534 6.91662 2.99536 6.81897 2.94002 6.67248L2.24992 4.83329L0.410726 4.14319C0.264242 4.08785 0.166586 3.94787 0.166586 3.79162C0.166586 3.63537 0.264242 3.4954 0.410726 3.44006L2.24992 2.74996L2.94002 0.910765C2.99536 0.764281 3.13534 0.666625 3.29159 0.666625C3.44784 0.666625 3.58781 0.764281 3.64315 0.910765L4.33325 2.74996L6.17244 3.44006ZM10.1568 3.05269C10.2415 2.86715 10.427 2.74996 10.6288 2.74996C10.8306 2.74996 11.0162 2.86715 11.1008 3.05269L12.8196 6.76363L16.5305 8.47913C16.7161 8.56376 16.8333 8.74931 16.8333 8.95439C16.8333 9.15946 16.7161 9.34176 16.5305 9.42639L12.8163 11.1419L11.1041 14.8528C11.0194 15.0384 10.8339 15.1556 10.6321 15.1556C10.4303 15.1556 10.2447 15.0384 10.1601 14.8528L8.44458 11.1386L4.73039 9.42314C4.54484 9.3385 4.42765 9.15295 4.42765 8.95113C4.42765 8.74931 4.54484 8.56376 4.73039 8.47912L8.44133 6.76689L10.1568 3.05269ZM4.33325 13.1666L6.17244 13.8567C6.31893 13.9121 6.41658 14.052 6.41658 14.2083C6.41658 14.3645 6.31893 14.5045 6.17244 14.5599L4.33325 15.25L3.64315 17.0892C3.58781 17.2356 3.44783 17.3333 3.29158 17.3333C3.13533 17.3333 2.99536 17.2356 2.94002 17.0892L2.24992 15.25L0.410725 14.5599C0.264241 14.5045 0.166585 14.3645 0.166585 14.2083C0.166585 14.052 0.264241 13.9121 0.410725 13.8567L2.24992 13.1666L2.94002 11.3274C2.99536 11.1809 3.13533 11.0833 3.29158 11.0833C3.44783 11.0833 3.58781 11.1809 3.64315 11.3274L4.33325 13.1666Z"
                fill="#FFD546"
              />
            </svg>
            <span
              style={{
                fontFamily: "mono",
                color: "white",
                fontSize: "12px",
              }}
            >
              12 POINTS
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
