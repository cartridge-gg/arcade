import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchProfileData } from "./lib/server-data/fetchProfile";
import { fetchGameData } from "./lib/server-data/fetchGame";
import { fetchAchievementData } from "./lib/server-data/fetchAchievement";

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

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  
  // Only intercept for social media crawlers
  if (!isSocialMediaCrawler(userAgent)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const baseUrl = request.nextUrl.origin;
  
  // Parse the path segments
  const pathSegments = pathname.split("/").filter(Boolean);
  
  let metaTags = "";
  let pageTitle = "Cartridge Arcade";
  let pageDescription = "Discover, Play and Compete in Onchain Games";

  try {
    // Handle profile pages: /player/:player
    if (pathSegments[0] === "player" && pathSegments[1]) {
      const username = pathSegments[1];
      const profileData = await fetchProfileData(username);
      
      if (profileData) {
        pageTitle = `${profileData.username} | Cartridge Arcade`;
        pageDescription = `${profileData.username} has earned ${profileData.achievements} achievements across ${profileData.games} games. Total points: ${profileData.earnings}.`;
        const imageUrl = `${baseUrl}/api/og/profile/${username}.png`;
        
        metaTags = `
          <meta property="og:title" content="${escapeHtml(pageTitle)}" />
          <meta property="og:description" content="${escapeHtml(pageDescription)}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="${request.url}" />
          <meta property="og:type" content="profile" />
          <meta property="og:site_name" content="Cartridge Arcade" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
          <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
          <meta name="twitter:image" content="${imageUrl}" />
          <meta name="twitter:site" content="@cartridge_gg" />
        `;
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
        
        metaTags = `
          <meta property="og:title" content="${escapeHtml(pageTitle)}" />
          <meta property="og:description" content="${escapeHtml(pageDescription)}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:url" content="${request.url}" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Cartridge Arcade" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
          <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
          <meta name="twitter:image" content="${imageUrl}" />
          <meta name="twitter:site" content="@cartridge_gg" />
        `;
      }
    }
    // Handle achievement pages (when accessed via a specific route)
    else if (pathname.includes("/achievement/") || (pathname.includes("/tab/achievements") && request.nextUrl.searchParams.get("achievement"))) {
      const achievementId = pathSegments.find((_, i) => pathSegments[i - 1] === "achievement") || request.nextUrl.searchParams.get("achievement");
      const playerName = pathSegments.find((_, i) => pathSegments[i - 1] === "player") || request.nextUrl.searchParams.get("player");
      
      if (achievementId) {
        const achievementData = await fetchAchievementData(achievementId, playerName || undefined);
        
        if (achievementData) {
          pageTitle = `${achievementData.title} | ${achievementData.game}`;
          pageDescription = achievementData.description;
          const imageUrl = `${baseUrl}/api/og/achievement/${achievementId}.png${playerName ? `?player=${playerName}` : ""}`;
          
          metaTags = `
            <meta property="og:title" content="${escapeHtml(pageTitle)}" />
            <meta property="og:description" content="${escapeHtml(pageDescription)}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="${request.url}" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Cartridge Arcade" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
            <meta name="twitter:description" content="${escapeHtml(pageDescription)}" />
            <meta name="twitter:image" content="${imageUrl}" />
            <meta name="twitter:site" content="@cartridge_gg" />
          `;
        }
      }
    }
  } catch (error) {
    console.error("Error generating meta tags:", error);
  }

  // If we have custom meta tags, return HTML with them
  if (metaTags) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>${escapeHtml(pageTitle)}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${metaTags}
        <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body style="background-color: #0D0E14; color: #FFFFFF; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
        <div style="text-align: center; max-width: 600px;">
          <h1 style="color: #FF6B42; margin-bottom: 20px;">${escapeHtml(pageTitle)}</h1>
          <p style="color: #8B8D98; line-height: 1.5; margin-bottom: 30px;">${escapeHtml(pageDescription)}</p>
          <p style="color: #8B8D98;">Redirecting to Cartridge Arcade...</p>
          <script>
            // Redirect to the actual React app
            setTimeout(function() {
              window.location.href = window.location.href;
            }, 100);
          </script>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match profile, game, and achievement paths
    "/player/:path*",
    "/game/:path*",
    "/achievement/:path*",
    // Exclude API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};