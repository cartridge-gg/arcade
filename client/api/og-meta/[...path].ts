import { NextRequest, NextResponse } from "next/server";
import { fetchProfileData } from "../../lib/server-data/fetchProfile";
import { fetchGameData } from "../../lib/server-data/fetchGame";
import { fetchAchievementData } from "../../lib/server-data/fetchAchievement";

export const config = {
  runtime: "edge",
};

// List of known social media crawler user agents
const SOCIAL_MEDIA_BOTS = [
  "facebookexternalhit",
  "facebookcatalog",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegram",
  "slackbot",
  "discord",
  "pinterest",
  "tumblr",
  "redditbot",
  "skypeuripreview",
  "viber",
];

function isSocialMediaCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS.some(bot => ua.includes(bot));
}

function generateMetaTags(
  title: string,
  description: string,
  imageUrl: string,
  url: string
): string {
  return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:creator" content="@cartridge_gg" />
  `;
}

export default async function handler(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    
    // Only process for social media crawlers
    if (!isSocialMediaCrawler(userAgent)) {
      return NextResponse.next();
    }

    const { pathname, origin } = new URL(req.url);
    const baseUrl = origin;

    // Parse the path to determine the content type
    const pathSegments = pathname.split("/").filter(Boolean);
    
    let metaTags = "";
    let pageTitle = "Cartridge Arcade";
    let pageDescription = "Discover, Play and Compete in Onchain Games";

    // Handle profile pages: /player/:player
    if (pathSegments[0] === "player" && pathSegments[1]) {
      const username = pathSegments[1];
      const profileData = await fetchProfileData(username);
      
      if (profileData) {
        pageTitle = `${profileData.username} | Cartridge Arcade`;
        pageDescription = `${profileData.username} has earned ${profileData.achievements} achievements across ${profileData.games} games. Total points: ${profileData.earnings}.`;
        const imageUrl = `${baseUrl}/api/og/profile/${username}.png`;
        metaTags = generateMetaTags(pageTitle, pageDescription, imageUrl, req.url);
      }
    }
    // Handle game pages: /game/:game
    else if (pathSegments[0] === "game" && pathSegments[1]) {
      const gameId = pathSegments[1];
      const gameData = await fetchGameData(gameId);
      
      if (gameData) {
        pageTitle = `${gameData.name} | Cartridge Arcade`;
        pageDescription = gameData.description;
        const imageUrl = `${baseUrl}/api/og/game/${gameId}.png`;
        metaTags = generateMetaTags(pageTitle, pageDescription, imageUrl, req.url);
      }
    }
    // Handle achievement pages (if they have dedicated routes)
    else if (pathSegments[0] === "achievement" && pathSegments[1]) {
      const achievementId = pathSegments[1];
      const playerName = new URL(req.url).searchParams.get("player");
      const achievementData = await fetchAchievementData(achievementId, playerName || undefined);
      
      if (achievementData) {
        pageTitle = `${achievementData.title} | ${achievementData.game}`;
        pageDescription = achievementData.description;
        const imageUrl = `${baseUrl}/api/og/achievement/${achievementId}.png${playerName ? `?player=${playerName}` : ""}`;
        metaTags = generateMetaTags(pageTitle, pageDescription, imageUrl, req.url);
      }
    }

    // If we have meta tags, return HTML with them
    if (metaTags) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>${pageTitle}</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${metaTags}
          <script>
            // Redirect to the actual app after meta tags are processed
            if (!window.location.search.includes('_escaped_fragment_')) {
              window.location.href = window.location.href;
            }
          </script>
        </head>
        <body>
          <h1>${pageTitle}</h1>
          <p>${pageDescription}</p>
          <p>Loading Cartridge Arcade...</p>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    // Default: pass through to the app
    return NextResponse.next();
  } catch (error) {
    console.error("Error in og-meta middleware:", error);
    return NextResponse.next();
  }
}