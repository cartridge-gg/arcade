import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const SOCIAL_MEDIA_BOTS = [
  "facebookexternalhit",
  "facebookcatalog",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegram",
  "slackbot",
  "discord",
];

function isSocialMediaCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return SOCIAL_MEDIA_BOTS.some((bot) => ua.includes(bot));
}

export default async function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";

  // Only intercept for social media crawlers
  if (!isSocialMediaCrawler(userAgent)) {
    return;
  }

  const { pathname } = new URL(req.url);
  const pathSegments = pathname.split("/").filter(Boolean);
  const baseUrl = `https://${req.headers.get("host")}`;

  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = `${baseUrl}/preview.png`;

  // Handle profile pages
  if (pathSegments[0] === "player" && pathSegments[1]) {
    const username = pathSegments[1];
    title = `${username} | Cartridge Arcade`;
    description = `View ${username}'s profile on Cartridge Arcade`;
    imageUrl = `${baseUrl}/api/og/profile?username=${username}`;
  }
  // Handle game pages
  else if (pathSegments[0] === "game" && pathSegments[1]) {
    const gameId = pathSegments[1];
    title = `${gameId} | Cartridge Arcade`;
    description = `Play ${gameId} on Cartridge Arcade`;
    imageUrl = `${baseUrl}/api/og/game?gameId=${gameId}`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${title}</title>
  <meta charset="UTF-8" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:url" content="${req.url}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:site" content="@cartridge_gg" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}