# Fitness Trends MVP - Next.js Frontend

This is the frontend dashboard for Fitness Trends, a real-time fitness trend analyzer for content creators.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**For production (Vercel):**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
├── app/
│   ├── page.js                 # Landing page
│   ├── page.module.css         # Landing page styles
│   ├── layout.js               # Root layout
│   ├── globals.css             # Global styles
│   └── dashboard/
│       ├── page.js             # Dashboard
│       └── dashboard.module.css
├── components/
│   ├── TrendCard.js            # Trend card component
│   └── TrendCard.module.css
├── lib/
│   └── api.js                  # API client
├── package.json
├── next.config.js
└── .env.local                  # (local only, not committed)
```

## Pages

### Home (`/`)
Landing page with:
- Problem statement
- Solution overview
- Pricing tiers
- Email signup

### Dashboard (`/dashboard`)
Admin dashboard showing:
- Top 10 trending fitness topics
- Platform filters (YouTube, TikTok, Instagram)
- Trend momentum (% change)
- Longevity predictions
- 3 specific video ideas per trend

## API Integration

The frontend uses the API client in `lib/api.js` to connect to the backend:

```javascript
// Fetch top 10 trends
const { data } = await fetchTrends(10, 'youtube');

// Analyze a single trend
const { longevity_days, sentiment, content_ideas } = await analyzeTrend('Pilates');

// Check backend health
const { status } = await checkHealth();
```

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push code to GitHub
2. Connect repo to Vercel (vercel.com)
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

Your site will be live at: `[project-name].vercel.app`

## Styling

Uses CSS modules for component styles and global CSS variables:

```css
--color-primary: #ff5a2d       /* Burnt orange */
--color-secondary: #1a1a2e     /* Deep navy */
--color-accent: #00d4ff        /* Cyan */
```

Customize in `app/globals.css`

## Features

- ✅ Responsive design (mobile-first)
- ✅ Real-time trend data from backend API
- ✅ Demo data fallback if API is down
- ✅ Platform filtering
- ✅ Fast load times
- ✅ SEO-optimized metadata

## Troubleshooting

### "Can't connect to backend"
- Make sure backend is running on http://localhost:3001
- Check `NEXT_PUBLIC_API_URL` environment variable
- Frontend shows demo data if API is unreachable

### "Styles not loading"
- CSS modules need `.module.css` extension
- Check file names match imports
- Clear `.next/` cache and rebuild

### "Build fails on Vercel"
- Make sure all environment variables are set
- Check Node version compatibility (v18+)
- Review build logs in Vercel dashboard

## Next Steps

- Week 2: Connect to real backend API
- Week 3: Deploy to Vercel + Railway
- Week 4: Launch publicly

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Backend API Docs](../TECHNICAL_DOCUMENTATION.md)
- [Project Summary](../PROJECT_SUMMARY.md)

---

Built with ❤️ for fitness creators
