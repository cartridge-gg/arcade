import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { ProfileOGTemplate } from "../../../lib/og-templates/profile";
import { fetchProfileData } from "../../../lib/server-data/fetchProfile";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return new Response("Username parameter is required", { status: 400 });
    }

    // Fetch profile data
    const profileData = await fetchProfileData(username);

    if (!profileData) {
      return new Response("Profile not found", { status: 404 });
    }

    // Generate the OG image
    return new ImageResponse(
      <ProfileOGTemplate data={profileData} />,
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error generating profile OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}