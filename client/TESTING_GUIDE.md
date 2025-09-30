# Testing Social Sharing Implementation

## 🚀 Quick Start Testing

### Option 1: Deploy to Vercel (Recommended)

1. **Deploy to Vercel Preview**
```bash
cd /Users/ayushtomar_1/Desktop/work/workspace/.conductor/ayush-c7e-752-profile-social-sharing/arcade/client

# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to preview
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Select the client directory
# - Use default build settings
```

2. **Test the deployed preview URL**
```bash
# You'll get a URL like: https://arcade-client-xxx.vercel.app
# Test it with the provided test script:
VERCEL_URL=arcade-client-xxx.vercel.app node test-og.cjs
```

### Option 2: Local Testing with Vercel Dev

1. **Run Vercel Dev (simulates Vercel environment locally)**
```bash
cd /Users/ayushtomar_1/Desktop/work/workspace/.conductor/ayush-c7e-752-profile-social-sharing/arcade/client

# Install dependencies if needed
pnpm install

# Run Vercel dev
vercel dev --port 3000
```

2. **Test OG image endpoints directly**
```bash
# In another terminal, test the endpoints:

# Test profile OG image
curl -I http://localhost:3000/api/og/profile/testuser.png

# Test game OG image  
curl -I http://localhost:3000/api/og/game/eternal-quest.png

# Test achievement OG image
curl -I http://localhost:3000/api/og/achievement/dragon-slayer.png
```

## 🧪 Manual Testing Steps

### 1. Test OG Image Generation

Open these URLs in your browser (replace localhost:3000 with your deployed URL):

- **Profile Image**: http://localhost:3000/api/og/profile/alice.png
- **Game Image**: http://localhost:3000/api/og/game/eternal-quest.png
- **Achievement Image**: http://localhost:3000/api/og/achievement/dragon-slayer.png?player=alice

You should see generated images with the appropriate content.

### 2. Test Meta Tags (Social Media Crawler Simulation)

Use curl with social media user agents:

```bash
# Test profile page meta tags
curl -H "User-Agent: facebookexternalhit/1.1" \
  http://localhost:3000/player/alice | grep -E "og:|twitter:"

# Test game page meta tags
curl -H "User-Agent: Twitterbot/1.0" \
  http://localhost:3000/game/eternal-quest | grep -E "og:|twitter:"

# You should see meta tags in the response like:
# <meta property="og:title" content="alice | Cartridge Arcade" />
# <meta property="og:image" content="http://localhost:3000/api/og/profile/alice.png" />
```

### 3. Test with Browser DevTools

1. Open Chrome DevTools
2. Go to Network tab
3. Click "More tools" → "Network conditions"
4. Set User Agent to custom: `facebookexternalhit/1.1`
5. Navigate to http://localhost:3000/player/testuser
6. Check the Response tab - you should see HTML with meta tags

## 📱 Social Media Platform Testing

Once deployed to production or preview:

### Facebook Sharing Debugger
1. Go to https://developers.facebook.com/tools/debug/
2. Enter your URL (e.g., `https://your-app.vercel.app/player/alice`)
3. Click "Debug"
4. Check:
   - ✅ og:title is correct
   - ✅ og:image shows your generated image
   - ✅ og:description is accurate
5. Click "Scrape Again" to refresh cache if needed

### Twitter Card Validator
1. Go to https://cards-dev.twitter.com/validator
2. Enter your URL
3. Click "Preview card"
4. Verify the card shows correctly

### LinkedIn Post Inspector
1. Go to https://www.linkedin.com/post-inspector/
2. Enter your URL
3. Click "Inspect"
4. Check the preview

## 🔍 Debugging Common Issues

### Issue: OG images return 500 error
**Solution**: Check Vercel Function logs
```bash
vercel logs --follow
```

### Issue: Meta tags not showing for crawlers
**Check**:
1. Middleware is detecting user agent correctly
2. No syntax errors in middleware.ts
3. Vercel Functions are deployed

### Issue: Images look broken
**Check**:
1. React components in og-templates/ have valid JSX
2. All styles are inline (no external CSS)
3. Font issues - use system fonts

### Issue: "Cannot find module" errors
**Solution**: Ensure all imports use correct paths
```bash
# Check TypeScript compilation
cd arcade/client
pnpm type:check
```

## 📊 Automated Testing Script

Run the complete test suite:

```bash
# From arcade/client directory
node test-og.cjs

# For deployed version
VERCEL_URL=your-preview.vercel.app node test-og.cjs
```

Expected output:
```
✅ Profile OG Image - Status: 200
✅ Profile OG Image - Content-Type: image/png
✅ Game OG Image - Status: 200
✅ Game OG Image - Content-Type: image/png
✅ Found: "og:title"
✅ Found: "og:image"
✅ Found: "twitter:card"
```

## 🎯 Testing Checklist

- [ ] OG image endpoints return 200 status
- [ ] Images display correctly (1200x630px)
- [ ] Meta tags present for social crawlers
- [ ] Regular users see normal React app
- [ ] Facebook Debugger shows correct preview
- [ ] Twitter Card displays properly
- [ ] Cache headers are set correctly
- [ ] Error cases handled gracefully

## 💡 Tips

1. **Clear social media cache**: Use "Scrape Again" in Facebook Debugger
2. **Test different user agents**: facebookexternalhit, Twitterbot, LinkedInBot
3. **Check image dimensions**: Should be 1200x630 for best results
4. **Verify HTTPS**: Social platforms require secure URLs
5. **Monitor performance**: Check Vercel Analytics for function execution time

## 🚨 Before Production

1. Update mock data with real API calls in:
   - `lib/server-data/fetchProfile.ts`
   - `lib/server-data/fetchGame.ts`
   - `lib/server-data/fetchAchievement.ts`

2. Test with real data
3. Set appropriate cache durations
4. Monitor error rates in Vercel dashboard

---

Need help? Check SOCIAL_SHARING.md for implementation details.