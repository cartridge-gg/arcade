import { createRequire as VPV_createRequire } from "node:module";
import { fileURLToPath as VPV_fileURLToPath } from "node:url";
import { dirname as VPV_dirname } from "node:path";
const require = VPV_createRequire(import.meta.url);
const __filename = VPV_fileURLToPath(import.meta.url);
const __dirname = VPV_dirname(__filename);


// api/ssr.ts
var API_URL = process.env.VITE_CARTRIDGE_API_URL || "https://api.cartridge.gg";
var ADDRESS_BY_USERNAME_QUERY = `
  query AddressByUsername($username: String!) {
    account(username: $username) {
      controllers(first: 1) {
        edges {
          node {
            address
          }
        }
      }
    }
  }
`;
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function isValidUsername(username) {
  if (!username || username.length === 0 || username.length > 100) {
    return false;
  }
  if (username.includes("<") || username.includes(">") || username.includes('"') || username.includes("'")) {
    return false;
  }
  return true;
}
function isValidAddress(address) {
  if (!address) return false;
  const cleaned = address.replace(/^0x/, "");
  return /^[0-9a-fA-F]{1,64}$/.test(cleaned);
}
async function graphqlRequest(query, variables) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1e4);
  try {
    const response = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      const errorMessage = json.errors.map((e) => e.message).join(", ");
      throw new Error(`GraphQL error: ${errorMessage}`);
    }
    if (!json.data) {
      throw new Error("No data returned from GraphQL query");
    }
    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("GraphQL request timed out after 10 seconds");
    }
    throw error;
  }
}
function buildMetaTags(title, description, imageUrl, pageUrl) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);
  return `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${safePageUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:site_name" content="Cartridge Arcade" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@cartridge_gg" />
    <meta name="twitter:creator" content="@cartridge_gg" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
  `.trim();
}
async function generateMetaTags(url) {
  const urlParts = url.split("/").filter(Boolean);
  let title = "Cartridge Arcade";
  let description = "Discover, Play and Compete in Onchain Games";
  let imageUrl = "https://play.cartridge.gg/preview.png";
  const pageUrl = `https://play.cartridge.gg${url}`;
  try {
    if (urlParts[0] === "player" && urlParts[1]) {
      const usernameOrAddress = urlParts[1];
      const isAddress = usernameOrAddress.match(/^0x[0-9a-fA-F]+$/);
      if (isAddress) {
        if (!isValidAddress(usernameOrAddress)) {
          title = "Invalid Address - Cartridge Arcade";
          description = "The requested address format is invalid";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      } else {
        if (!isValidUsername(usernameOrAddress)) {
          title = "Invalid Username - Cartridge Arcade";
          description = "The requested username contains invalid characters";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      }
      let address;
      if (isAddress) {
        address = usernameOrAddress;
      } else {
        const data = await graphqlRequest(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase()
        });
        const resolvedAddress = data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          title = `${usernameOrAddress} | Cartridge Arcade`;
          description = "Player not found";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }
      title = `${usernameOrAddress} | Cartridge Arcade`;
      description = `View ${usernameOrAddress}'s profile on Cartridge Arcade`;
      const ogParams = new URLSearchParams({
        type: "profile",
        username: usernameOrAddress,
        points: "0",
        achievements: "0/0"
      });
      imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
    } else if (urlParts[0] === "game" && urlParts[1] && urlParts[2] === "player" && urlParts[3]) {
      const gameId = urlParts[1];
      const usernameOrAddress = urlParts[3];
      const isAddress = usernameOrAddress.match(/^0x[0-9a-fA-F]+$/);
      if (isAddress) {
        if (!isValidAddress(usernameOrAddress)) {
          title = `Invalid Address in ${gameId} - Cartridge Arcade`;
          description = "The requested address format is invalid";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      } else {
        if (!isValidUsername(usernameOrAddress)) {
          title = `Invalid Username in ${gameId} - Cartridge Arcade`;
          description = "The requested username contains invalid characters";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
      }
      let address;
      if (isAddress) {
        address = usernameOrAddress;
      } else {
        const data = await graphqlRequest(ADDRESS_BY_USERNAME_QUERY, {
          username: usernameOrAddress.toLowerCase()
        });
        const resolvedAddress = data.account?.controllers?.edges?.[0]?.node?.address;
        if (!resolvedAddress) {
          title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
          description = "Player not found";
          return buildMetaTags(title, description, imageUrl, pageUrl);
        }
        address = resolvedAddress;
      }
      title = `${usernameOrAddress} in ${gameId} | Cartridge Arcade`;
      description = `View ${usernameOrAddress}'s stats in ${gameId}`;
      const ogParams = new URLSearchParams({
        type: "game-profile",
        username: usernameOrAddress,
        game: gameId,
        points: "0",
        achievements: "0/0"
      });
      imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
    } else if (urlParts[0] === "game" && urlParts[1]) {
      const gameId = urlParts[1];
      title = `${gameId} - Cartridge Arcade`;
      description = `Play ${gameId} on Cartridge Arcade - Discover onchain gaming`;
      const ogParams = new URLSearchParams({
        type: "game",
        game: gameId
      });
      imageUrl = `https://play.cartridge.gg/api/og?${ogParams.toString()}`;
    }
  } catch (error) {
    console.error("Error generating meta tags:", error);
  }
  return buildMetaTags(title, description, imageUrl, pageUrl);
}
async function handler(req, res) {
  try {
    const requestPath = req.query.path || req.url || "/";
    const metaTags = await generateMetaTags(requestPath);
    const safeRequestPath = escapeHtml(requestPath);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cartridge Arcade</title>
  ${metaTags}
  <meta http-equiv="refresh" content="0;url=${safeRequestPath}">
</head>
<body>
  <script>window.location.href = "${safeRequestPath}";</script>
  <noscript>
    <p>Redirecting to <a href="${safeRequestPath}">Cartridge Arcade</a>...</p>
  </noscript>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch (error) {
    console.error("SSR handler error:", error);
    res.status(500).send("Internal Server Error");
  }
}
export {
  handler as default
};
