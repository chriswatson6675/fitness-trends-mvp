const express = require('express');
const cors = require('cors');
const net = require('net');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const { getYouTubeTrends } = require('./lib/youtube');
const { analyzetrend } = require('./lib/claude');

const app = express();
let PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: process.uptime() });
});

app.get('/api/trends', async (req, res) => {
  const acceptedRegions = ['GB', 'US', 'AU', 'CA', 'IN', 'GLOBAL'];
  const rawRegion = String(req.query.region || 'GB').toUpperCase();
  const region = acceptedRegions.includes(rawRegion) ? rawRegion : 'GB';

  try {
    // Get trends from YouTube scraper
    const trends = await getYouTubeTrends(region);

    // Enhance each trend with Claude analysis
    const enrichedTrends = await Promise.all(
      trends.map(async (trend) => {
        try {
          const analysis = await analyzeTrend(trend.name, trend.mentions_today);
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
    const analysis = await analyzeTrend(trend_name, mentions_today);
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
process.on('SIGINT', () => {
  console.log('\nServer shutting down...');
  process.exit(0);
});

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
        throw err;
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
