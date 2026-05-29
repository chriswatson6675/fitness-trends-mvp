const express = require('express');
const cors = require('cors');
const net = require('net');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { getYouTubeTrends } = require('./lib/youtube');
const { analyzeTrend } = require('./lib/claude');

const app = express();
let PORT = process.env.API_PORT || 3001;

// Environment warnings
['YOUTUBE_API_KEY', 'ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'].forEach((k) => {
  if (!process.env[k]) console.warn(`Warning: environment variable ${k} is not set`);
});

// Configure CORS. Set CORS_ORIGIN in production to restrict origins.
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Simple in-memory cache for /api/trends to reduce repeated external calls
let trendsCache = { region: null, timestamp: 0, data: null };

async function saveTrendSnapshot(niche, trend, analysis) {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Defensive checks
    if (!trend || !trend.name || !analysis) return;

    const { error } = await supabase
      .from('trend_snapshots')
      .insert({
        date: today,
        niche: niche,
        platform: trend.platform,
        trend_name: trend.name,
        mentions: trend.mentions_today,
        velocity: trend.velocity,
        sentiment: analysis.sentiment,
        longevity_prediction: analysis.longevity_days,
      });

    if (error) {
      console.error(`Failed to save snapshot for ${trend.name}:`, error.message);
    } else {
      console.log(`✅ Saved snapshot: ${trend.name} (${niche})`);
    }
  } catch (err) {
    console.error('Error saving trend snapshot:', err.message);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime() });
});

app.get('/api/trends', async (req, res) => {
  const acceptedRegions = ['GB', 'US', 'AU', 'CA', 'IN', 'GLOBAL'];
  const rawRegion = String(req.query.region || 'GB').toUpperCase();
  const region = acceptedRegions.includes(rawRegion) ? rawRegion : 'GB';

  try {
    // Return cached result if recent
    if (trendsCache.region === region && Date.now() - trendsCache.timestamp < 60_000 && trendsCache.data) {
      return res.json({ region, data: trendsCache.data });
    }

    // Get trends from YouTube scraper
    const trends = await getYouTubeTrends(region);

    // Enhance each trend with Claude analysis
    const enrichedTrends = await Promise.all(
      trends.map(async (trend) => {
        try {
          const analysis = await analyzeTrend(trend.name, trend.mentions_today);
          
          // Save to database
          await saveTrendSnapshot('fitness', trend, analysis);
          
          return {
            ...trend,
            sentiment: analysis.sentiment || 'positive',
            longevity_days: analysis.longevity_days || 90,
            content_ideas: analysis.content_ideas || trend.content_ideas,
          };
        } catch (error) {
          console.error(`Error analyzing trend "${trend.name}":`, error.message);
          // Return trend with default analysis if Claude fails
          return trend;
        }
      })
    );

    res.json({ region, data: enrichedTrends });
    // update cache
    trendsCache = { region, timestamp: Date.now(), data: enrichedTrends };
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends', region });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { trend_name, mentions_today, mentions_yesterday = 0, platform = 'youtube' } = req.body;

  if (!trend_name) {
    return res.status(400).json({ error: 'trend_name is required' });
  }

  try {
    const mentionsNum = Number(mentions_today || 0);
    if (Number.isNaN(mentionsNum)) return res.status(400).json({ error: 'mentions_today must be a number' });

    const analysis = await analyzeTrend(trend_name, mentionsNum);
    res.json({
      trend: trend_name,
      longevity_days: analysis.longevity_days,
      sentiment: analysis.sentiment,
      content_ideas: analysis.content_ideas,
    });
  } catch (error) {
    console.error('Error analyzing trend:', error);
    res.status(500).json({ error: 'Failed to analyze trend' });
  }
});

// Graceful shutdown
function shutdown() {
  console.log('\nServer shutting down...');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Function to find available port
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      server.once('close', () => {
        resolve(startPort);
      });
      server.close();
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${startPort} is busy, trying next port...`);
        resolve(findAvailablePort(startPort + 1));
      } else {
        // Reject the promise for unexpected errors instead of throwing
        resolve(Promise.reject(err));
      }
    });
  });
}

// Start server
async function startServer() {
  const availablePort = await findAvailablePort(PORT);
  PORT = availablePort;

  app.listen(PORT, () => {
    console.log(`Fitness Trends MVP backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
