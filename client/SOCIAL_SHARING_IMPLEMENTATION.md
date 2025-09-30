# Social Sharing Implementation for Cartridge Arcade

## Current Status

The Arcade client is a **Vite + React SPA** (Single Page Application), which presents unique challenges for social media sharing with dynamic content.

## Challenge

Social media crawlers (Facebook, Twitter, LinkedIn, etc.) **do not execute JavaScript**. They only read the initial HTML response from the server. Since Vite SPAs are client-side rendered, crawlers only see the static `index.html` file, which means they cannot see dynamic content like user profiles, games, or achievements.

## Solution Options

### Option 1: Server-Side Rendering (SSR) in Backend (Recommended)

Implement SSR endpoints in the `internal` Go backend service to serve dynamic HTML with proper meta tags for social media crawlers.

**Architecture:**
```
1. User shares: https://play.cartridge.gg/player/alice
2. Crawler requests the URL
3. Backend detects crawler (via User-Agent)
4. Backend fetches player data from database
5. Backend returns HTML with dynamic OG meta tags
6. Regular users get proxied to the Vite SPA
```

**Implementation in `internal` backend:**

```go
// internal/api/og/handler.go
package og

import (
    "fmt"
    "html/template"
    "net/http"
    "strings"
)

var socialCrawlers = []string{
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "whatsapp",
    "telegram",
}

func isSocialCrawler(userAgent string) bool {
    ua := strings.ToLower(userAgent)
    for _, bot := range socialCrawlers {
        if strings.Contains(ua, bot) {
            return true
        }
    }
    return false
}

func HandleProfile(w http.ResponseWriter, r *http.Request) {
    // Only handle social crawlers
    if !isSocialCrawler(r.UserAgent()) {
        // Proxy to Vite SPA for regular users
        http.Redirect(w, r, "https://play.cartridge.gg", http.StatusTemporaryRedirect)
        return
    }

    // Extract username from path
    username := mux.Vars(r)["username"]

    // Fetch player data
    player, err := fetchPlayerData(username)
    if err != nil {
        http.Error(w, "Player not found", http.StatusNotFound)
        return
    }

    // Render HTML with OG tags
    tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{.Username}} | Cartridge Arcade</title>
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="{{.URL}}" />
    <meta property="og:title" content="{{.Username}} | Cartridge Arcade" />
    <meta property="og:description" content="{{.Username}} has earned {{.Achievements}} achievements across {{.Games}} games." />
    <meta property="og:image" content="{{.ImageURL}}" />
    <meta name="twitter:card" content="summary_large_image" />
</head>
<body>
    <h1>{{.Username}}</h1>
    <p>Loading Cartridge Arcade...</p>
    <script>window.location.href="https://play.cartridge.gg/player/{{.Username}}";</script>
</body>
</html>`

    t := template.Must(template.New("profile").Parse(tmpl))
    t.Execute(w, player)
}
```

### Option 2: Prerender Service

Use a prerendering service like Prerender.io or build a custom one:

1. Prerender service crawls and caches your pages
2. When a crawler accesses your site, Vercel/CDN routes to prerender service
3. Prerender service returns cached HTML with meta tags
4. Regular users get the normal SPA

**Pros:**
- No backend code changes needed
- Works with any SPA
- Automatic caching

**Cons:**
- Additional cost
- Third-party dependency
- Cache invalidation complexity

### Option 3: Static Meta Tags + External OG Image Service

The current implementation uses static meta tags. For dynamic OG images, you can use an external service:

1. Keep static meta tags in `index.html`
2. Use a service like `og-image.vercel.app` or similar for dynamic images
3. Update meta tags based on routes

**Example:**
```html
<!-- For profile page -->
<meta property="og:image" content="https://og-service.example.com/profile?username=alice" />

<!-- For game page -->
<meta property="og:image" content="https://og-service.example.com/game?id=eternal-quest" />
```

**Pros:**
- Simple implementation
- Works with current Vite setup
- External service handles image generation

**Cons:**
- Meta tags are still static (can't change based on route)
- Requires external service
- Limited customization

### Option 4: Migrate to Next.js

Convert the Arcade client from Vite to Next.js:

**Pros:**
- Built-in SSR support
- `generateMetadata()` API for dynamic meta tags
- Vercel Edge Functions work out of the box
- Better SEO overall

**Cons:**
- Significant migration effort
- Potential breaking changes
- Need to rewrite build configuration

## Recommended Approach

**Implement Option 1** - Add SSR endpoints in the `internal` backend:

1. **Add OG handler routes** in `internal/api/`:
   - `/og/player/:username` - Profile pages
   - `/og/game/:gameId` - Game pages
   - `/og/achievement/:achievementId` - Achievement pages

2. **Configure routing**:
   - Detect social media crawlers via User-Agent
   - Serve dynamic HTML with OG tags to crawlers
   - Proxy regular users to the Vite SPA

3. **Generate OG images**:
   - Use Go libraries like `fogleman/gg` for image generation
   - Or use a separate microservice (Node.js with `@vercel/og`)
   - Cache generated images with CDN

4. **Deploy configuration**:
   - Update Vercel routing to check backend first for crawler requests
   - Fallback to Vite SPA for regular traffic

## Implementation Checklist

- [ ] Create OG handler in `internal/api/og/`
- [ ] Add crawler detection middleware
- [ ] Implement profile OG endpoint with database queries
- [ ] Implement game OG endpoint
- [ ] Implement achievement OG endpoint
- [ ] Add OG image generation (either in Go or separate service)
- [ ] Configure routing in Vercel to check backend for crawlers
- [ ] Test with Facebook Sharing Debugger
- [ ] Test with Twitter Card Validator
- [ ] Add caching headers for OG responses
- [ ] Monitor performance and error rates

## Testing

Once implemented, test with:

```bash
# Test profile endpoint with crawler user agent
curl -H "User-Agent: facebookexternalhit/1.1" \
  https://play.cartridge.gg/player/alice

# Expected: HTML with dynamic meta tags
# <meta property="og:title" content="alice | Cartridge Arcade" />
# <meta property="og:description" content="alice has earned 42 achievements..." />
```

## Current Implementation

The `@vercel/og` package has been added to dependencies but **cannot be used** in the current Vite setup. The package requires Next.js Edge Runtime.

**What's in place:**
- ✅ Proper Open Graph meta tags in `index.html`
- ✅ Twitter Card meta tags
- ❌ Dynamic meta tags based on routes (not possible with SPA)
- ❌ Dynamic OG image generation (requires backend or Next.js)

## References

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Prerendering SPAs for SEO](https://vercel.com/guides/prerendering-spa)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

**Resolution for C7E-752**: Dynamic social sharing for a Vite SPA requires server-side implementation. Recommended approach is to add SSR endpoints in the `internal` backend service.